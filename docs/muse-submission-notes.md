# Qrblox: Muse connector submission notes

> Platform: Muse Connector Platform, https://platform.muse.ai (submissions list: /submissions). Submitter: Sarah Lam, work email sarahoh@stanfordalumni.org. Combined index of all filings: Terahertz-Inc/os-terahertz `docs/muse-connector-submissions.md`. Never refile a connector already listed as Submitted.

**Status:** Submitted Oct 23, 2026 (by an earlier session). Do not refile.
Values below are **per packet (2026-10-14); actual filed values not re-verified**. Confirmation URL/UUID not recorded. The Oct 23 submission's submitter email was sarahoh@stanfordalumni.org (seen on the submission, Nov 3).

| Field | Value (per packet) |
|---|---|
| Connector name | Qrblox (packet wrote "qrblox"; the submissions list shows "Qrblox") |
| Connection type | Existing MCP |
| Endpoint | https://app.qrblox.com/api/mcp (serverInfo qrblox-mcp 0.1.0, 14 tools) |
| Docs (one URL) | https://docs.qrblox.com/mcp.html |
| Auth | Bearer API keys minted at https://app.qrblox.com/settings. No OAuth |
| Payments | No |
| Support / privacy / terms | support@qrblox.com, https://qrblox.com/privacy, https://qrblox.com/terms |

Positioning: merchant-facing (QR codes, menus, Voice Agent Phone Book, scan challenges, analytics). No freebie-discovery tool; do not pitch it as one.

## Auth gap
The Muse form has **no authentication-method checkboxes**, so "API keys" could only be described in the Access requirements free text. If Muse asks, the answer is Bearer API keys and no OAuth.

## Open items
- [ ] No tool calls were tested during packet prep; Muse's end-to-end test needs a working key.
- [ ] Consider OAuth if Muse requires it for authenticated connectors.
- [ ] Revisit payments if paid merchant tiers ship.
