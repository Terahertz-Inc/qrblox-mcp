export const DEFAULT_MCP_URL = "https://api.qrblox.com/mcp/v1";

export function getRemoteUrl(env: NodeJS.ProcessEnv = process.env): string {
  const override = env.QRBLOX_MCP_URL?.trim();
  return override || DEFAULT_MCP_URL;
}

export type JsonRpcErrorBody = {
  code: number;
  message: string;
  data?: unknown;
};

export type JsonRpcSuccess = {
  jsonrpc: "2.0";
  id: unknown;
  result: unknown;
};

export type JsonRpcFailure = {
  jsonrpc: "2.0";
  id: unknown;
  error: JsonRpcErrorBody;
};

export type JsonRpcResponse = JsonRpcSuccess | JsonRpcFailure;

export async function callRemote<T = unknown>(
  method: string,
  params: unknown,
  options: { apiKey?: string; url?: string } = {},
): Promise<T> {
  const url = options.url ?? getRemoteUrl();
  const headers: Record<string, string> = {
    "content-type": "application/json",
    accept: "application/json, text/event-stream",
    "mcp-protocol-version": "2025-03-26",
  };
  if (options.apiKey) {
    headers.authorization = `Bearer ${options.apiKey}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: crypto.randomUUID(),
        method,
        params: params ?? {},
      }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to reach Qrblox MCP at ${url}: ${message}`);
  }

  const payload = await parseMcpResponse(response);
  if (!payload) {
    throw new Error(`Empty response from Qrblox MCP (${response.status})`);
  }
  if ("error" in payload) {
    const extra = payload.error.data
      ? ` ${JSON.stringify(payload.error.data)}`
      : "";
    throw new Error(`${payload.error.message}${extra}`);
  }
  return payload.result as T;
}

export async function parseMcpResponse(
  response: Response,
): Promise<JsonRpcResponse | undefined> {
  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();

  if (!text.trim()) {
    if (!response.ok) {
      throw new Error(`Qrblox MCP HTTP ${response.status}`);
    }
    return undefined;
  }

  if (contentType.includes("text/event-stream")) {
    const messages = parseSseJson(text);
    const rpc = messages.find(isJsonRpcResponse);
    if (rpc) {
      return rpc;
    }
    if (!response.ok) {
      throw new Error(
        `Qrblox MCP HTTP ${response.status}: ${text.slice(0, 400)}`,
      );
    }
    throw new Error(
      "Qrblox MCP SSE response did not contain a JSON-RPC message",
    );
  }

  try {
    const parsed = JSON.parse(text) as unknown;
    if (isJsonRpcResponse(parsed)) {
      return parsed;
    }
    if (!response.ok) {
      throw new Error(
        `Qrblox MCP HTTP ${response.status}: ${text.slice(0, 400)}`,
      );
    }
    throw new Error("Unexpected Qrblox MCP response");
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error(
        `Qrblox MCP HTTP ${response.status}: ${text.slice(0, 400)}`,
      );
    }
    throw err;
  }
}

function parseSseJson(text: string): unknown[] {
  const out: unknown[] = [];
  for (const block of text.split(/\r?\n\r?\n/)) {
    const dataLines: string[] = [];
    for (const line of block.split(/\r?\n/)) {
      if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trimStart());
      }
    }
    const data = dataLines.join("\n").trim();
    if (!data || data === "[DONE]") {
      continue;
    }
    try {
      out.push(JSON.parse(data));
    } catch {
      // Ignore non-JSON data frames.
    }
  }
  return out;
}

function isJsonRpcResponse(value: unknown): value is JsonRpcResponse {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  return record.jsonrpc === "2.0" && ("result" in record || "error" in record);
}
