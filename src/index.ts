#!/usr/bin/env node
/**
 * qrblox-mcp — stdio proxy for the live Qrblox Streamable HTTP MCP.
 *
 * Does not reimplement merchant tools. Forwards tools/list and tools/call to
 * https://api.qrblox.com/mcp/v1 with Authorization: Bearer $QRBLOX_API_KEY.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { AuthError, requireApiKey } from "./auth.js";
import { callRemote } from "./remote.js";

const VERSION = "0.1.0";

async function startProxy(apiKey: string): Promise<void> {
  const server = new Server(
    { name: "qrblox-mcp", version: VERSION },
    {
      capabilities: { tools: {} },
      instructions:
        "Stdio proxy for the Qrblox remote MCP at https://api.qrblox.com/mcp/v1. Merchant tools need QRBLOX_API_KEY (sk-qrblox-...) minted at https://app.qrblox.com/settings.",
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return await callRemote("tools/list", {}, { apiKey });
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      return await callRemote("tools/call", request.params, { apiKey });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        isError: true,
        content: [{ type: "text", text: message }],
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

async function main(): Promise<void> {
  const apiKey = requireApiKey();
  await startProxy(apiKey);
}

main().catch((err) => {
  if (err instanceof AuthError) {
    console.error(err.message.trimEnd());
    process.exit(1);
  }
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
