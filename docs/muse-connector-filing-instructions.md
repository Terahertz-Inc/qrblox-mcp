# qrblox — Muse Connector Filing Instructions

Instructions for an agent filing the qrblox connector at
https://muse.ai/platform in a normal browser, signed in as the owner.
This document is documentation only — following it files the connector;
nothing in it submits anything by itself.

Companion document (source of truth for every value below):
`docs/muse-connector-packet.md` in this repo. If anything here and the
packet disagree, the packet wins — stop and flag the discrepancy.

## STATUS GATE — READY TO FILE, with one recommended pre-check

The MCP server is live and verified: `qrblox-mcp` **0.1.0**, 14 tools,
endpoint `https://app.qrblox.com/api/mcp`, verified 2026-10-14
(discovery doc + a real `initialize` handshake). This connector is
READY TO FILE.

**Positioning rule (read before touching the form): this connector is
MERCHANT-facing — QR codes, menus, the voice-agent Phone Book, scan
challenges, and scan analytics. There is NO freebie-discovery tool in
the catalog. No form field, description, or example prompt may claim
"giveaways near you" or freebie discovery.**

### Recommended pre-check (do this first if it hasn't been run)

During packet prep only `initialize` was tested — no authenticated
tool calls. Before filing, run the pre-check below so Meta's
end-to-end review doesn't hit an untested write tool first.

You need a Bearer API key minted by the merchant at
https://app.qrblox.com/settings. All calls go to
`POST https://app.qrblox.com/api/mcp` with headers
`Authorization: Bearer <key>` and `Content-Type: application/json`.

1. **Initialize.**
   `{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"precheck","version":"0"}}}`
   → Pass: HTTP 200, `serverInfo` name `qrblox-mcp`, version `0.1.0`.
2. **List tools.**
   `{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}`
   → Pass: all 14 tools from the packet's catalog are present.
3. **One harmless call per write tool** (7 write tools), in the
   merchant's own workspace, using throwaway test data you clean up
   after:
   - `qrblox.qr.create` — create a test QR code pointing at a harmless
     URL (e.g. `https://qrblox.com`). Pass: returns a hosted PNG and,
     for a dynamic code, a `qrb.dev` link. Note what static vs.
     dynamic codes each return.
   - `qrblox.qr.update` — re-point the test code you just created to
     another harmless URL. Pass: succeeds, and `qrblox.qr.list` shows
     the change.
   - `qrblox.menu.create` — create a test menu. Pass: menu appears in
     `qrblox.menu.list`.
   - `qrblox.menu.add_item` — add one test item to the test menu.
     Pass: item is present on the menu.
   - `qrblox.audio.create` — draft an audio-code payload. Pass: a
     draft payload is returned; nothing is published.
   - `qrblox.challenge.create` — draft a test scan challenge. Pass:
     the challenge is created as a **draft** and does NOT publish
     without a second step. If it publishes immediately, stop — that
     behavior must be fixed or disclosed before filing.
   - `qrblox.voice_agent.register` — this one creates a **public**
     Phone Book backlink page, so it is not harmless. Test it only
     against a domain the owner controls, and confirm the resulting
     page is accurate. While testing, confirm how (or whether) the
     registration verifies domain ownership before publishing a
     number for a domain (see the flag below).
   → Pass for each: HTTP 200, no `isError`, sane structured output,
   and created objects visible via the matching read tools
   (`qrblox.qr.list`, `qrblox.menu.list`,
   `qrblox.analytics.scan_summary`).
4. **Tenant-isolation check.** Using a key from a *different* merchant
   workspace, attempt to read the first workspace's data (e.g.
   `qrblox.qr.list`, `qrblox.qr.get_analytics`,
   `qrblox.analytics.scan_summary` against the first workspace's
   codes). → Pass: the server rejects the cross-workspace access or
   returns no foreign data. If a key can read another workspace's
   codes or analytics, STOP — do not file until that is fixed.

**`voice_agent.register` flag:** this tool creates a public page
asserting that a phone number is a business's voice agent. Domain-
ownership verification must be confirmed and documented before
filing. If it cannot be confirmed, do not claim it anywhere in the
form — state the registration behavior honestly in the "Anything
else?" field instead (see Step 1) and tell the user.

Do **not** run the pre-check against the keyless sandbox
(`POST /api/generate-qr-code`, 3 codes/IP/day) — it is not part of
the connector, and burning the quota helps nothing.

## BEFORE YOU START

- Sign in at muse.ai/platform with the **owner's Muse account**.
  Only the account owner can submit.
- The form's **work email MUST be the email of the signed-in
  account**. A mismatch fails with a generic "Review the highlighted
  information" error and no field highlighted — if you see that error,
  check the email first.
- **Submitter name** = the account owner's name (the person signed
  in). Do not put the support address in the submitter fields.
- **Icon:** download the favicon / apple-touch-icon from
  https://qrblox.com and upload that file in Step 1.
- Have the companion packet (`docs/muse-connector-packet.md`) open —
  every value below is copied from it exactly.

## FILING STEPS

Go to https://muse.ai/platform → **Submit a connector**.

### Step 1 — Overview

| Field | Enter exactly |
|---|---|
| Connector name | qrblox |
| Company / developer | Terahertz, Inc. |
| Product website | https://qrblox.com |
| Icon | The qrblox.com favicon / apple-touch-icon file (see Before You Start) |
| Payments | **No** |
| Support contact | support@qrblox.com |
| Privacy policy URL | https://qrblox.com/privacy |
| Terms of service URL | https://qrblox.com/terms |
| Submitter name | The account owner's name |
| Work email | The email of the signed-in account (must match — see Before You Start) |
| Example prompts | "Make a QR code that points to my bakery's menu page." · "How many scans did my farmers-market QR code get this week?" · "What is the AI voice agent phone number for crosodo.com?" · "Register my business's voice agent number for my domain." · "Add a chocolate croissant for $4.50 to my bakery menu." · "Start a scan challenge for my grand opening weekend." |
| Anything else? | The connector serves merchants: QR code creation/management, menus, the Voice Agent Phone Book, scan challenges, and scan analytics. Freebie claim codes (QR-gated giveaways) are a consumer feature of the qrblox app and are NOT exposed through this connector — no freebie-discovery tool is offered, and none is claimed. QR generation is also available keyless in sandbox (3 codes/IP/day) via POST /api/generate-qr-code. |

Payments is **No**: none of the 14 tools charges money, and there is
no checkout flow for reviewers to test. Do not toggle it on.

### Step 2 — Technical specs

| Field | Enter exactly |
|---|---|
| Connection type | Existing MCP |
| MCP endpoint | https://app.qrblox.com/api/mcp |
| Documentation | https://docs.qrblox.com/mcp.html |
| Access requirements | Bearer API key, minted by the merchant at https://app.qrblox.com/settings. All 14 tools are scoped to the merchant workspace attached to the key. Keyless sandbox QR generation (3 codes/IP/day) is available separately at POST /api/generate-qr-code but is not part of the connector's authenticated toolset. |
| Authentication methods | API keys (check only this one) |

The documentation field takes **exactly one URL** — enter only
`https://docs.qrblox.com/mcp.html`. (It redirects to
`https://docs.qrblox.com/mcp`; submit the `.html` form.) Multiple
URLs in that field fail silently — see Troubleshooting.

Auth is API keys only: the server has no OAuth flow. Do not check
OAuth with PKCE.

### Step 3 — Review

Check the three attestations:

1. You are authorized to submit this connector and its brand assets.
2. Submission doesn't guarantee approval, and any featured placement
   is Meta's editorial call based on usage.
3. You agree to the Muse Connector Terms (linked from this step —
   some submitters have reported the link rendering blank; if it is
   blank, flag it to the user rather than assuming the terms don't
   exist).

Then **Submit for review**.

## AFTER SUBMITTING

- Success looks like a confirmation screen: **"Thank you for your
  submission!"** It shows **no request ID** — there is nothing to
  look the submission up by later.
- Record the **date**, the **connector name** (qrblox), and the
  **confirmation text**, and report all three to the user.
- There is no published review timeline or SLA, and no published
  fees or revenue share. Initial developers are onboarded in waves
  over several weeks. Approval is not guaranteed; featured placement
  is editorial.
- Meta's review includes functional, security, and legal checks plus
  end-to-end testing of the example prompts against the live
  endpoint — another reason the pre-check above matters.

## TROUBLESHOOTING

- **Documentation field rejects the form / silent `invalid_request`:**
  that field accepts exactly ONE URL. Several URLs on separate lines
  fail with no field highlighted. Put only
  `https://docs.qrblox.com/mcp.html` there.
- **Generic "Review the highlighted information" error with nothing
  highlighted:** first suspect is the work-email mismatch — the work
  email must be the address of the account you are signed in with.
  Fix that before changing anything else.
- **Never submit a duplicate.** If a submission may have gone
  through (confirmation seen, page reloaded, unclear state), check
  with the user before refiling — do not just submit again.
- **Don't burn the keyless sandbox quota** (3 codes/IP/day on
  `POST /api/generate-qr-code`) during pre-checks or testing. The
  sandbox is not part of this connector.
- **Endpoint questions during review:** the canonical endpoint is
  `https://app.qrblox.com/api/mcp` (the one that answers the
  handshake). There is no `.well-known/mcp.json` descriptor — the
  `/api/mcp` discovery doc is the machine-readable surface.
