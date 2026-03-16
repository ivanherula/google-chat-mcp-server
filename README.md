# @ivanherula/google-chat-mcp

MCP server for Google Chat. Provides tools to list spaces, read and send messages, and search — for use with Claude Code and other MCP clients.

## Tools

| Tool | Description |
|------|-------------|
| `list_spaces` | List Google Chat spaces the user belongs to |
| `list_messages` | List messages in a space (with optional filter/ordering) |
| `send_message` | Send a message to a space or reply to a thread |
| `get_message` | Get a specific message by resource name |
| `search_messages` | Search messages by text (client-side filtering) |

## Requirements

- Node.js >= 18
- A Google Cloud project with the **Google Chat API** enabled
- OAuth 2.0 credentials (Desktop app type)

## Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable the **Google Chat API**
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**
5. Choose **Desktop app**, give it a name, click Create
6. Copy the **Client ID** and **Client Secret**

## MCP Client Configuration

Add to your Claude Code MCP config (`~/.claude.json`):

```json
{
  "mcpServers": {
    "google-chat": {
      "type": "stdio",
      "command": "npx",
      "args": ["@ivanherula/google-chat-mcp@latest"],
      "env": {
        "GOOGLE_CLIENT_ID": "your-client-id.apps.googleusercontent.com",
        "GOOGLE_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

## First-Run OAuth Flow

On first use, the server will:
1. Open your browser to Google's OAuth consent screen
2. Ask you to sign in and grant Chat permissions
3. Redirect to `localhost` to capture the auth code
4. Save tokens to `~/.config/google-chat-mcp/tokens.json`

Subsequent runs load the saved tokens automatically (with silent refresh).

To force re-authentication (e.g. after revoking access), delete the token file:
```bash
rm ~/.config/google-chat-mcp/tokens.json
```

## Usage Examples

```
# List all spaces
list_spaces

# List recent messages in a space
list_messages spaceName="spaces/AAAA" pageSize=20 orderBy="createTime desc"

# Send a message
send_message spaceName="spaces/AAAA" text="Hello from Claude!"

# Reply to a thread
send_message spaceName="spaces/AAAA" text="Reply here" threadName="spaces/AAAA/threads/BBBB"

# Search messages
search_messages spaceName="spaces/AAAA" query="deploy" afterTime="2024-01-01T00:00:00Z"
```

## License

MIT
