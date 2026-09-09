# Qrblox MCP

**The Model Context Protocol server for [Qrblox](https://qrblox.com)** —
a local stdio package so Claude Desktop, Cursor, and other agents can
`npx` Qrblox the same way FlipLetters ships `flipletters-mcp-server`.

This package does **not** reimplement merchant tools. It is a thin stdio
proxy to the live Streamable HTTP MCP:

`https://api.qrblox.com/mcp/v1` (`qrblox-mcp` 0.1.0)

📚 **Docs:** [docs.qrblox.com/mcp.html](https://docs.qrblox.com/mcp.html)
🔑 **Mint a key:** [app.qrblox.com/settings](https://app.qrblox.com/settings)

---

## Quick start

### 1. Mint an API key

Sign in at [app.qrblox.com/settings](https://app.qrblox.com/settings)
and create a merchant API key. Keys look like `sk-qrblox-...` and are
shown once.

Merchant `tools/call` requests send that key as
`Authorization: Bearer sk-qrblox-...`.

### 2. Run with npx

```bash
QRBLOX_API_KEY=sk-qrblox-... npx -y qrblox-mcp
```

Without `QRBLOX_API_KEY`, the process starts and exits immediately with
a clear error pointing at the settings page.

### 3. Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json`
(macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "qrblox": {
      "command": "npx",
      "args": ["-y", "qrblox-mcp"],
      "env": {
        "QRBLOX_API_KEY": "sk-qrblox-..."
      }
    }
  }
}
```

Restart Claude Desktop, then ask it to generate a QR code or look up a
voice-agent number.

### 4. Cursor

Add the same stdio server in Cursor MCP settings
(`.cursor/mcp.json` or the MCP panel):

```json
{
  "mcpServers": {
    "qrblox": {
      "command": "npx",
      "args": ["-y", "qrblox-mcp"],
      "env": {
        "QRBLOX_API_KEY": "sk-qrblox-..."
      }
    }
  }
}
```

Clients that already speak Streamable HTTP can skip this package and
call the remote endpoint directly:

```json
{
  "mcpServers": {
    "qrblox": {
      "url": "https://api.qrblox.com/mcp/v1",
      "headers": {
        "Authorization": "Bearer sk-qrblox-..."
      }
    }
  }
}
```

---

## Environment

| Variable | Required | Description |
|---|---|---|
| `QRBLOX_API_KEY` | Yes (for `tools/call`) | Merchant key `sk-qrblox-...` from [app.qrblox.com/settings](https://app.qrblox.com/settings). Sent as `Authorization: Bearer`. |
| `QRBLOX_MCP_URL` | No | Override the remote MCP URL. Defaults to `https://api.qrblox.com/mcp/v1`. |

---

## What the proxy does

1. Speaks MCP over **stdio** (what Claude Desktop / Cursor spawn).
2. Forwards `tools/list` and `tools/call` to
   `https://api.qrblox.com/mcp/v1` (Streamable HTTP / JSON-RPC).
3. Attaches `Authorization: Bearer $QRBLOX_API_KEY` so merchant tools
   run on the key owner's workspace.

Tool schemas and behavior always come from the live server — this
package is not a second implementation.

### Tools (from the live server)

| Tool | Description |
|---|---|
| `qrblox.ping` | Confirm reachability + identity for the authenticated merchant. |
| `qrblox.voice_agent.lookup` | Look up a business in the Voice Agent Phone Book by domain. |
| `qrblox.voice_agent.register` | Register a voice-agent number for a domain. |
| `qrblox.merchant.get_profile` | Merchant workspace attached to the key. |
| `qrblox.qr.list` / `.create` / `.update` / `.get_analytics` | List, create, re-point, and report on QR codes. |
| `qrblox.audio.create` | Draft an audio code. |
| `qrblox.menu.create` / `.list` / `.add_item` | Build and extend merchant menus. |
| `qrblox.challenge.create` | Scan streaks, scan-count games, visit-window or loyalty campaigns. |
| `qrblox.analytics.scan_summary` | Total scans + by-day series. |

Full reference: [docs.qrblox.com/mcp.html](https://docs.qrblox.com/mcp.html).

---

## Local development

```bash
npm install
npm test
```

`npm test` builds the package and runs a short check that the process
starts and fails clearly when `QRBLOX_API_KEY` is missing.

```bash
QRBLOX_API_KEY=sk-qrblox-... npm start
```

---

## Publishing (maintainers)

Do **not** commit tokens or keys. This package is not published from CI
in this PR.

1. Confirm the unscoped name is still free: `npm view qrblox-mcp`
   (it was unpublished / 404 when this package was added). If it is
   taken, change `package.json` `name` to `@qrblox/mcp` and publish
   that instead.
2. Sign in as the **Qrblox npm user**:

   ```bash
   npm login
   ```

3. From a clean build:

   ```bash
   npm publish
   ```

   (`prepublishOnly` runs `npm test` first.)

4. Smoke-check: `npx -y qrblox-mcp` should print the missing-key error
   until `QRBLOX_API_KEY` is set.

---

## Related

- 🌐 [qrblox.com](https://qrblox.com)
- 🖥️ [app.qrblox.com](https://app.qrblox.com)
- 📚 [docs.qrblox.com](https://docs.qrblox.com)
- 🐙 [Terahertz-Inc/qrblox-com](https://github.com/Terahertz-Inc/qrblox-com)

---

## License

MIT © Qrblox / Terahertz Inc.
