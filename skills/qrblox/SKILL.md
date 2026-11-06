---
name: qrblox
description: Create or look up Qrblox QR codes, audio codes, menus, or Voice Agent Phone Book entries for merchants.
---

# Qrblox merchant codes

Every tool named below comes from Qrblox's MCP server at `https://api.qrblox.com/mcp/v1`.

Set `QRBLOX_API_KEY` (Bearer `sk-qrblox-…` from https://app.qrblox.com/settings) for merchant tools. `qrblox.ping` and public voice-agent lookup work without a key.

## Steps

1. **Health** — call `qrblox.ping` to confirm the server is up.
2. **Public directory** — use voice-agent lookup tools for public handles before asking for a key.
3. **Merchant work** — with a key, create/update/list QR codes, audio codes, or menus only after the user names the merchant and what to change.
4. **Confirm** — after a write, read the returned id/URL back to the user.

## Rules

- Never invent a merchant API key. Ask the user to set `QRBLOX_API_KEY` in Hermes.
- Prefer read tools before writes. Confirm destructive deletes.
- Own-domain docs: https://docs.qrblox.com/mcp

## Done when

- Read answers cite a tool result.
- Writes were confirmed and the new id/URL was shown.

