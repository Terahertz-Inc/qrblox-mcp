# Qrblox MCP

**The Model Context Protocol server for [Qrblox](https://qrblox.com)** —
let any MCP-aware AI agent generate and manage QR codes, audio codes,
menus, and loyalty campaigns.

📚 **Full reference:** [docs.qrblox.com/mcp.html](https://docs.qrblox.com/mcp.html)
🌐 **Endpoint:** `https://app.qrblox.com/api/mcp`
🔑 **Mint a key:** [create.qrblox.com/settings/api-keys](https://create.qrblox.com/settings/api-keys)
🟢 **No-key sandbox:** `POST https://app.qrblox.com/api/generate-qr-code`

> This is a public, README-only repo. The MCP server itself is
> deployed at the endpoint above; the canonical docs live at
> [docs.qrblox.com/mcp.html](https://docs.qrblox.com/mcp.html).

---

## What is it?

`qrblox-mcp` is a JSON-RPC 2.0 MCP server. Point Claude Desktop,
Cursor, Codex, or any MCP client at `https://app.qrblox.com/api/mcp`,
paste in a `sk-qrblox-` key, and the assistant can immediately draft QR
codes (and audio codes, menus, and loyalty campaigns) and read scan
analytics on a merchant workspace.

Every code created via the MCP lives on the caller's Qrblox account
alongside codes made from the iOS, Android, Canva, and web surfaces.

---

## Quick start

### 1. Try it free (no signup, no OAuth)

```bash
curl -X POST https://app.qrblox.com/api/generate-qr-code \
  -H 'content-type: application/json' \
  -d '{"url":"https://example.com"}'
```

Returns:

```jsonc
{
  "ok": true,
  "code": {
    "codeId": "…",
    "destinationUrl": "https://example.com",
    "qrImage":    "data:image/png;base64,…",            // inline PNG
    "qrImageUrl": "https://storage.googleapis.com/…",    // hosted PNG
    "claimToken": "…",
    "expiresAt":  "…"
  },
  "upgrade": { "signup": "https://app.qrblox.com", "apiKeys": "https://create.qrblox.com/settings/api-keys" }
}
```

Sandbox limits: **3 codes / IP / day**, codes expire in **7 days**.

### 2. Mint an API key

Sign in to [create.qrblox.com](https://create.qrblox.com) →
**Settings → API keys** → **New API key**. Keys are
`sk-qrblox-<64 hex chars>`, shown once, and revocable anytime.

### 3. Connect Claude Desktop

```jsonc
// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "qrblox": {
      "url": "https://app.qrblox.com/api/mcp",
      "headers": {
        "Authorization": "Bearer sk-qrblox-..."
      }
    }
  }
}
```

Restart Claude Desktop. Then ask: *"Generate a QR code for
https://my-spring-menu.com."*

### 4. Or Cursor / Codex / curl

Same URL, same `Authorization` header.

```bash
# tools/list — no auth required
curl -X POST https://app.qrblox.com/api/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# tools/call — create a code on your account
curl -X POST https://app.qrblox.com/api/mcp \
  -H 'authorization: Bearer sk-qrblox-...' \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call",
       "params":{"name":"qrblox.qr.create",
                 "arguments":{"title":"Spring menu",
                              "destinationUrl":"https://qrblox.com/menu/spring"}}}'
```

---

## Tools

All tools are merchant-scoped and **draft-first** — agents propose,
the merchant approves before publishing.

| Tool | Description |
|---|---|
| `qrblox.ping` | Confirm reachability + identity. |
| `qrblox.merchant.get_profile` | The merchant workspace attached to the key. |
| `qrblox.qr.list` | List recent QR codes. |
| `qrblox.qr.create` | Create a draft QR code (URL, menu, offer, campaign). |
| `qrblox.audio.create` | Draft an audio code (near-ultrasonic payload). |
| `qrblox.menu.create` / `.list` / `.add_item` | Build and extend merchant menus. |
| `qrblox.challenge.create` | Scan streaks, scan-count games, visit-window or loyalty campaigns. |
| `qrblox.analytics.scan_summary` | Total scans + by-day series. |

Plus two REST endpoints for non-MCP callers:

| Endpoint | Auth | Notes |
|---|---|---|
| `POST /api/generate-qr-code` | none | 3 / IP / day, sandbox, 7-day expiry. |
| `POST /api/bulk-qr-codes` | `Bearer sk-qrblox-...` | Up to 50 permanent codes per call, written to your merchant workspace. |

---

## Discovery

| URL | What it returns |
|---|---|
| `GET https://app.qrblox.com/api/mcp` | Server info + the full tool list (no auth). |
| `POST https://app.qrblox.com/api/mcp` `tools/list` | JSON-RPC tool discovery (no auth). |
| `GET https://app.qrblox.com/api/generate-qr-code` | Public manifest: endpoint shape, limits, upgrade path. |

Full reference and connect snippets at
[**docs.qrblox.com/mcp.html**](https://docs.qrblox.com/mcp.html).

---

## Errors

| HTTP / JSON-RPC | Meaning |
|---|---|
| `400 / -32600` | Invalid JSON-RPC 2.0 request. |
| `401 / -32001` | Missing or invalid key. `data.code` = `NO_AUTH` / `INVALID_API_KEY` / `INVALID_TOKEN`. |
| `403 / -32001` | Key revoked (`data.code` = `REVOKED`). |
| `200 / -32601` | Unsupported method. |
| `200 / -32602` | Unknown tool. |
| `200 / -32000` | Tool handler threw — read `error.message`. |

---

## Security model

- **Merchant-scoped** — every API key is tied to one merchant
  workspace and one owner uid; tools can't reach another merchant's
  data.
- **Hashed keys** — plaintext shown once; Firestore stores only a
  SHA-256 hash and a short prefix.
- **Audited** — every tool call writes an audit entry with the caller,
  tool name, and status. Arguments and results are not persisted.
- **Draft-first** — creation tools produce drafts; publishing, billing,
  and destructive changes stay with the merchant.

---

## Related

- 🌐 [qrblox.com](https://qrblox.com) — marketing site
- 🖥️ [app.qrblox.com](https://app.qrblox.com) — web dashboard
- 📱 [iOS](https://apps.apple.com/us/app/qrblox-ai-chat-with-qr-code/id6737632062) · [Android](https://play.google.com/store/apps/details?id=com.qrblox.app) · [Canva](https://www.canva.com/apps/)
- 📚 [Full Qrblox docs](https://docs.qrblox.com)
- 🐙 [Terahertz-Inc/qrblox-com](https://github.com/Terahertz-Inc/qrblox-com) — Qrblox overview repo

---

## License

© Qrblox / Terahertz Inc.
