import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { StoredTokens } from "./types.js";

const SCOPES = [
  "https://www.googleapis.com/auth/chat.spaces.readonly",
  "https://www.googleapis.com/auth/chat.messages",
  "https://www.googleapis.com/auth/chat.messages.readonly",
];

const TOKEN_DIR = path.join(os.homedir(), ".config", "google-chat-mcp");
const TOKEN_PATH = path.join(TOKEN_DIR, "tokens.json");

function loadTokens(): StoredTokens | null {
  try {
    const raw = fs.readFileSync(TOKEN_PATH, "utf-8");
    return JSON.parse(raw) as StoredTokens;
  } catch {
    return null;
  }
}

function saveTokens(tokens: StoredTokens): void {
  fs.mkdirSync(TOKEN_DIR, { recursive: true });
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2), "utf-8");
}

async function runOAuthFlow(oauth2Client: OAuth2Client): Promise<void> {
  const server = http.createServer();

  await new Promise<void>((resolve, reject) => {
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      if (!addr || typeof addr === "string") {
        reject(new Error("Failed to get server address"));
        return;
      }
      const port = addr.port;
      const redirectUri = `http://127.0.0.1:${port}`;

      const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: SCOPES,
        redirect_uri: redirectUri,
      });

      console.error("Opening browser for Google OAuth2 authorization...");
      console.error("If browser does not open, visit:\n" + authUrl);

      import("open").then(({ default: open }) => {
        open(authUrl).catch(() => {
          console.error("Could not open browser automatically.");
        });
      }).catch(() => {
        console.error("Could not load 'open' module. Visit the URL above manually.");
      });

      server.on("request", (req, res) => {
        const url = new URL(req.url ?? "/", `http://127.0.0.1:${port}`);
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");

        if (error) {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end(`<html><body><h1>Authorization failed: ${error}</h1></body></html>`);
          server.close();
          reject(new Error(`OAuth error: ${error}`));
          return;
        }

        if (!code) {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end("<html><body><h1>Missing code parameter</h1></body></html>");
          return;
        }

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(
          "<html><body><h1>Authorization successful!</h1><p>You can close this tab and return to Claude Code.</p></body></html>"
        );

        server.close();

        oauth2Client
          .getToken({ code, redirect_uri: redirectUri })
          .then(({ tokens }) => {
            oauth2Client.setCredentials(tokens);
            saveTokens(tokens as StoredTokens);
            console.error("Tokens saved to " + TOKEN_PATH);
            resolve();
          })
          .catch(reject);
      });
    });

    server.on("error", reject);
  });
}

export async function getAuthenticatedClient(): Promise<OAuth2Client> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables must be set"
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);

  oauth2Client.on("tokens", (tokens) => {
    const existing = loadTokens() ?? {};
    const merged: StoredTokens = { ...existing, ...tokens };
    saveTokens(merged);
    console.error("Tokens refreshed and saved.");
  });

  const stored = loadTokens();
  if (stored) {
    oauth2Client.setCredentials(stored);
    console.error("Loaded existing tokens from " + TOKEN_PATH);
  } else {
    await runOAuthFlow(oauth2Client);
  }

  return oauth2Client;
}
