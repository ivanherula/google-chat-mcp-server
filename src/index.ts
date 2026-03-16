#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getAuthenticatedClient } from "./auth.js";
import { registerTools, server } from "./server.js";

const auth = await getAuthenticatedClient();
registerTools(auth);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Google Chat MCP server running on stdio");
