# Qrblox MCP

**The Model Context Protocol server for [Qrblox](https://qrblox.com).** It lets
MCP-aware AI agents create and track QR codes, audio codes, menus, and scan
challenges, and read scan analytics on a Qrblox merchant workspace.

- 📚 **Docs:** [docs.qrblox.com/mcp](https://docs.qrblox.com/mcp)
- 🌐 **Endpoint:** `https://api.qrblox.com/mcp/v1` (Streamable HTTP, JSON-RPC 2.0)
- 🔑 **API key:** sign in at [app.qrblox.com/settings](https://app.qrblox.com/settings) and create a key
- 🟢 **No-key sandbox:** `POST https://app.qrblox.com/api/generate-qr-code`

> This is a public, README-only repo. The MCP server is hosted at the
> endpoint above; its source is not in this repo.

---

## Quick start

### 1. Try it free (no signup, no key)

```bash
curl -X POST https://app.qrblox.com/api/generate-qr-code \
  -H 'content-type: application/json' \
  -d '{"url":"https://example.com"}'
```

You get back `code.qrImage` (an inline PNG data URL) and `code.qrImageUrl`
(a hosted PNG), plus a `claimToken` and `expiresAt`. Sandbox limits:
**3 codes per IP per day**, and codes expire after **7 days**.

### 2. Create an API key

Sign in at [app.qrblox.com/settings](https://app.qrblox.com/settings) and
create a key in the API keys section. Keys start with `sk-qrblox-`, are shown
once, and can be revoked at any time.

### 3. Connect your client

**Cursor** (`~/.cursor/mcp.json` or `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "qrblox": {
      "url": "https://api.qrblox.com/mcp/v1",
      "headers": { "Authorization": "Bearer YOUR_QRBLOX_KEY" }
    }
  }
}
```

**Claude Code:**

```bash
claude mcp add --transport http qrblox https://api.qrblox.com/mcp/v1 \
  --header "Authorization: Bearer YOUR_QRBLOX_KEY"
```

**Claude Desktop** (`claude_desktop_config.json`, via the `mcp-remote` bridge):

```json
{
  "mcpServers": {
    "qrblox": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote", "https://api.qrblox.com/mcp/v1",
        "--header", "Authorization:${AUTH_HEADER}"
      ],
      "env": { "AUTH_HEADER": "Bearer YOUR_QRBLOX_KEY" }
    }
  }
}
```

Then ask: *"Make a QR code for https://example.com/spring-menu."*

### 4. Or curl

```bash
# tools/list: no key needed
curl -X POST https://api.qrblox.com/mcp/v1 \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# tools/call: needs a key
curl -X POST https://api.qrblox.com/mcp/v1 \
  -H 'authorization: Bearer YOUR_QRBLOX_KEY' \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call",
       "params":{"name":"qrblox.qr.create",
                 "arguments":{"title":"Spring menu",
                              "destinationUrl":"https://example.com/spring-menu"}}}'
```

---

## Tools

Listing tools is open. Every `tools/call` needs an `sk-qrblox-` key and is
scoped to that key's merchant workspace.

| Tool | What it does |
|---|---|
| `qrblox.ping` | Confirm the server is reachable for the authenticated merchant. |
| `qrblox.voice_agent.lookup` | Look up a business in the [Voice Agent Phone Book](https://qrblox.com/phone-book) by website domain. |
| `qrblox.voice_agent.register` | Register a business's AI voice agent phone number for a domain. |
| `qrblox.merchant.get_profile` | The merchant workspace attached to the key. |
| `qrblox.qr.list` | List recent QR codes. |
| `qrblox.qr.create` | Create a QR code: hosted PNG (`qrImageUrl`), plus a dynamic link for dynamic codes. |
| `qrblox.qr.update` | Re-point a dynamic code's destination, or change its title or style. |
| `qrblox.qr.get_analytics` | Per-code scan report: totals, daily counts, and individual scans. |
| `qrblox.audio.create` | Draft an audio code (near-ultrasonic sharing payload). |
| `qrblox.menu.create` / `qrblox.menu.list` / `qrblox.menu.add_item` | Build and extend merchant menus. |
| `qrblox.challenge.create` | Draft a scan challenge, streak, game, or loyalty campaign. |
| `qrblox.analytics.scan_summary` | Summarize recent scan activity for the workspace. |

Publishing, billing, and destructive changes stay with the merchant.

## Discovery

| URL | Returns |
|---|---|
| `GET https://api.qrblox.com/mcp/v1` | Server info and the full tool list (no key). |
| `GET https://api.qrblox.com/.well-known/mcp/server.json` | MCP server manifest. |
| `GET https://app.qrblox.com/api/generate-qr-code` | Sandbox endpoint manifest: request shape, limits, upgrade path. |

## Errors

| HTTP / JSON-RPC | Meaning |
|---|---|
| `400 / -32600` | Invalid JSON-RPC 2.0 request. |
| `401 / -32001` | Missing or invalid key (`data.code` is `NO_AUTH`, `INVALID_API_KEY`, or `INVALID_TOKEN`). |
| `403 / -32001` | Key revoked (`data.code` is `REVOKED`). |
| `200 / -32601` | Unsupported method. |
| `200 / -32602` | Unknown tool. |
| `200 / -32000` | The tool failed; read `error.message`. |

## Security

- **Merchant-scoped:** each key belongs to one merchant workspace and one owner.
- **Hashed keys:** the plaintext key is shown once; only a hash and prefix are stored.
- **Audited:** every tool call records the caller, tool name, and status.
  Arguments and results are not stored.

## Links

- [qrblox.com](https://qrblox.com) · [Developers](https://qrblox.com/developers) · [Privacy](https://qrblox.com/privacy)
- [app.qrblox.com](https://app.qrblox.com) (merchant dashboard)
- [iOS](https://apps.apple.com/us/app/qrblox-ai-chat-with-qr-code/id6737632062) · [Android](https://play.google.com/store/apps/details?id=com.qrblox.app)
- [Terahertz-Inc/qrblox-com](https://github.com/Terahertz-Inc/qrblox-com): Qrblox overview repo
- Support: support@qrblox.com

## License

© Qrblox / Terahertz, Inc.
