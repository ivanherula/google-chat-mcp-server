import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OAuth2Client } from "google-auth-library";
import { z } from "zod";
import { listSpaces, listMessages, sendMessage, getMessage, searchMessages } from "./chat.js";

export const server = new McpServer({
  name: "@ivanherula/google-chat-mcp",
  version: "1.0.0",
});

export function registerTools(auth: OAuth2Client): void {
  server.registerTool(
    "list_spaces",
    {
      description: "List Google Chat spaces the user belongs to",
      inputSchema: {
        pageSize: z.number().int().min(1).max(1000).optional().describe("Max spaces to return"),
        filter: z
          .string()
          .optional()
          .describe('Filter expression, e.g. "spaceType = SPACE"'),
        pageToken: z.string().optional().describe("Token for next page"),
      },
    },
    async (input) => {
      try {
        const result = await listSpaces(auth, input);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${String(err)}` }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "list_messages",
    {
      description: "List messages in a Google Chat space",
      inputSchema: {
        spaceName: z
          .string()
          .describe('Space resource name, e.g. "spaces/AAAA"'),
        pageSize: z.number().int().min(1).max(1000).optional().describe("Max messages to return"),
        filter: z
          .string()
          .optional()
          .describe('Filter, e.g. "createTime > \\"2024-01-01T00:00:00Z\\""'),
        orderBy: z.string().optional().describe('Order, e.g. "createTime desc"'),
        showDeleted: z.boolean().optional().describe("Include deleted messages"),
        pageToken: z.string().optional().describe("Token for next page"),
      },
    },
    async (input) => {
      try {
        const result = await listMessages(auth, input);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${String(err)}` }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "send_message",
    {
      description: "Send a message to a Google Chat space or thread",
      inputSchema: {
        spaceName: z
          .string()
          .describe('Space resource name, e.g. "spaces/AAAA"'),
        text: z.string().describe("Message text to send"),
        threadName: z
          .string()
          .optional()
          .describe('Thread resource name for replies, e.g. "spaces/AAAA/threads/BBBB"'),
      },
    },
    async (input) => {
      try {
        const result = await sendMessage(auth, input);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${String(err)}` }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "get_message",
    {
      description: "Get a specific Google Chat message by resource name",
      inputSchema: {
        messageName: z
          .string()
          .describe('Message resource name, e.g. "spaces/AAAA/messages/BBBB"'),
      },
    },
    async (input) => {
      try {
        const result = await getMessage(auth, input);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${String(err)}` }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "search_messages",
    {
      description:
        "Search for messages in a Google Chat space by text (client-side filtering). Searches up to pageSize messages (default 100) from the most recent — does not paginate through the full history.",
      inputSchema: {
        spaceName: z
          .string()
          .describe('Space resource name, e.g. "spaces/AAAA"'),
        query: z.string().describe("Text to search for in messages"),
        afterTime: z
          .string()
          .optional()
          .describe('Only return messages after this ISO 8601 time, e.g. "2024-01-01T00:00:00Z"'),
        pageSize: z
          .number()
          .int()
          .min(1)
          .max(1000)
          .optional()
          .describe("Max messages to fetch before filtering (default 100)"),
      },
    },
    async (input) => {
      try {
        const results = await searchMessages(auth, input);
        return {
          content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${String(err)}` }],
          isError: true,
        };
      }
    }
  );
}
