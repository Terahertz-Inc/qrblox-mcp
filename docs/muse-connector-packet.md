# qrblox — Muse Connector Submission Packet

**DRAFT ONLY — DO NOT SUBMIT.** Prepared 2026-10-14. Nothing here has
been submitted to muse.ai/platform. Submission needs the user to sign in
with their own Meta account.

## 1. The decision (one page)

- **Connection type:** Existing MCP. The hosted server is live and
  answered a real `initialize` handshake during packet prep.
- **Endpoint to submit:** `https://app.qrblox.com/api/mcp`
- **Auth:** API keys (Bearer, minted at
  `https://app.qrblox.com/settings`). The server's own discovery doc
  specifies Bearer API keys; there is no OAuth flow on this server.
- **Payments:** **No.** None of the 14 tools charges money; the keyless
  sandbox QR generation is free, and the product's core tiers are free.
  Toggling payments on would invite review scrutiny for a checkout flow
  that does not exist. Revisit if paid merchant tiers ship.
- **Positioning correction — read this before submitting:** this
  connector is **merchant/business-facing**, not consumer freebie
  discovery. All 14 verified tools serve merchants (QR codes, menus,
  voice-agent phone book, scan challenges, analytics). There is **no**
  freebie-claim or drop-discovery tool in the catalog, and no public
  live-drops listing could be verified (see §6). Submitting it as
  "find giveaways near you" would fail Meta's end-to-end testing because
  the tool does not exist. The honest pitch is: "an agent that runs a
  merchant's QR codes, menus, and voice-agent listing."

## 2. Form answers — Step 1 (Overview)

| Field | Answer |
|---|---|
| Connector name | qrblox |
| Company / developer | Terahertz, Inc. |
| Product website | https://qrblox.com |
| Icon | Upload the qrblox mark (asset still needed — see §8) |
| Payments | No |
| Support contact | support@qrblox.com |
| Privacy policy | https://qrblox.com/privacy |
| Terms of service | https://qrblox.com/terms |
| Submitter name / work email | The user, signed in — the work email must match the Meta account doing the submission (other submitters hit a generic "Review the highlighted information" error when they differ) |
| Example prompts | "Make a QR code that points to my bakery's menu page." · "How many scans did my farmers-market QR code get this week?" · "What is the AI voice agent phone number for crosodo.com?" · "Register my business's voice agent number for my domain." · "Add a chocolate croissant for $4.50 to my bakery menu." · "Start a scan challenge for my grand opening weekend." |
| Anything else? | The connector serves merchants: QR code creation/management, menus, the Voice Agent Phone Book, scan challenges, and scan analytics. Freebie claim codes (QR-gated giveaways) are a consumer feature of the qrblox app and are NOT exposed through this connector — no freebie-discovery tool is offered, and none is claimed. QR generation is also available keyless in sandbox (3 codes/IP/day) via POST /api/generate-qr-code. |

## 3. Form answers — Step 2 (Technical specs)

- **Connection type:** Existing MCP.
- **MCP endpoint:** `https://app.qrblox.com/api/mcp`
- **Documentation:** `https://docs.qrblox.com/mcp.html` — exactly one URL;
  the form rejects multiple URLs in this field with a silent
  `invalid_request`. (Note: it redirects to `https://docs.qrblox.com/mcp`;
  either resolves, submit the `.html` form printed in the discovery doc.)
- **Access requirements:** "Bearer API key, minted by the merchant at
  https://app.qrblox.com/settings. All 14 tools are scoped to the
  merchant workspace attached to the key. Keyless sandbox QR generation
  (3 codes/IP/day) is available separately at POST
  /api/generate-qr-code but is not part of the connector's authenticated
  toolset."
- **Authentication methods:** API keys (only).

## 4. Form answers — Step 3 (Review)

Three attestations to confirm: (a) authorized to submit the connector
and its brand assets; (b) submission doesn't guarantee approval and
featured placement is Meta's editorial call; (c) agreement to the Muse
Connector Terms (note: some submitters have reported the terms link
rendering blank — if it's still blank at submission time, flag it rather
than treating the terms as nonexistent). Expect a "Thank you for your
submission!" screen with no request ID, and onboarding in waves over
several weeks — there is no published review SLA.

## 5. Verified tool catalog (live, 2026-10-14)

Source: `GET https://app.qrblox.com/api/mcp` (discovery doc, HTTP 200)
plus one `initialize` handshake (`serverInfo: qrblox-mcp 0.1.0`,
protocol `2025-03-26`). No tool calls were tested during packet prep
— see §7.

| Tool | Access | What it does |
|---|---|---|
| `qrblox.ping` | read | Liveness for the authenticated merchant |
| `qrblox.voice_agent.lookup` | read | Voice-agent phone number for a business, by website domain (public directory) |
| `qrblox.voice_agent.register` | **write** | Register a business's voice-agent number + domain in the Phone Book (creates a public backlink page) |
| `qrblox.merchant.get_profile` | read | Merchant workspace attached to the key |
| `qrblox.qr.list` | read | Recent QR codes for the merchant |
| `qrblox.qr.create` | **write** | Create a QR code; returns hosted PNG + dynamic `qrb.dev` link for dynamic codes |
| `qrblox.qr.update` | **write** | Re-point a dynamic code's destination, change scan sound, rename |
| `qrblox.qr.get_analytics` | read | Per-code scan report: totals, daily counts, scans with date + city/state |
| `qrblox.audio.create` | **write** | Draft audio-code payload (near-ultrasonic sharing) |
| `qrblox.menu.create` | **write** | Create a merchant menu |
| `qrblox.menu.list` | read | Recent menus |
| `qrblox.menu.add_item` | **write** | Add an item to a menu section |
| `qrblox.challenge.create` | **write** | Draft scan challenge / streak / game / loyalty campaign |
| `qrblox.analytics.scan_summary` | read | Recent scan activity summary for the workspace |

There is **no** `.well-known/mcp.json` descriptor (404 on both
`app.qrblox.com` and `qrblox.com`) — the `/api/mcp` discovery doc is the
canonical machine-readable surface. The discovery doc's `endpoint`
field lists a Cloud Functions URL (`http://…cloudfunctions.net/mcp`,
note `http`, not `https`); submit the `app.qrblox.com/api/mcp` URL,
which is the one that answered the handshake, and fix the discovery
doc's endpoint field to match.

## 6. The freebies caveat (honest readiness note)

- The qrblox.com homepage markets "QR × Freebies" (freebie claim codes
  hidden in QR codes, live remaining counts, `TAKEN` when claimed).
  The examples shown ("Cookie box 4 left", "Free latte 1 left",
  "@mochi.makes") read as marketing demos, not a verified live feed.
- **No public drops listing exists:** `/freebies` and `/drops` both
  404. The app (`app.qrblox.com`) is a JS shell with no publicly
  readable feed.
- **Consequence:** do not submit a consumer "giveaways near you"
  connector. If that vision matters, it needs a new tool first (e.g.
  `qrblox.freebie.list_nearby` over a real drops feed) — a build task,
  not a form task. The merchant-tools connector in this packet is
  submittable as-is; the freebie-discovery connector is not.
- Counterpoint: the Voice Agent Phone Book **is** a real public
  surface (`https://qrblox.com/phone-book`, verified 200, with
  confirmed entries for qrblox, Crosodo, LovedOne) — the lookup tool
  is the connector's strongest public-discovery story today.

## 7. Review-readiness notes (what Meta checks)

- **Functional:** every example prompt in §2 maps to a real tool.
  Meta will run them end-to-end. Before submitting, run one
  authenticated `tools/call` per write tool against the live endpoint
  (not done during packet prep — only `initialize` was tested) and
  confirm each returns sane output. In particular, confirm what
  `qr.create` returns for a static vs. dynamic code and that
  `challenge.create` drafts do not publish without a second step.
- **Security — `voice_agent.register` is the review risk.** It creates
  a public backlink page asserting that a phone number is a business's
  voice agent. If registration does not verify domain ownership, an
  attacker can register a fake number for someone else's domain. Before
  submitting, confirm and document the verification mechanism (or add
  one: e.g. DNS TXT, email confirmation at the domain). Expect Meta's
  reviewers to probe this.
- **Security — API keys:** keys are per-merchant workspace; tools are
  scoped to the key's workspace. Confirm the server rejects a key from
  one workspace reading another's codes/analytics (tenant isolation).
- **Legal:** privacy + terms URLs are live qrblox pages (privacy
  updated Apr 20, 2025; terms updated Sep 17, 2026). Terms include a
  binding-arbitration / class-action-waiver clause — nothing to change
  for the submission, but do not let the connector's example prompts
  promise anything the terms disclaim.
- **Keyless sandbox:** the 3-codes/IP/day sandbox is a rate-limited
  free surface, not part of the connector — do not list it as a
  connector capability in the form; it is mentioned in "Anything else?"
  only for context.

## 8. Open items needing the user

1. **Icon asset** — the connector form needs an uploaded icon (qrblox mark; confirm which file).
2. **Submitter sign-in** — only the account owner can submit; the user
   signs in at muse.ai/platform with the work email they'll list.
3. **Positioning sign-off** — merchant-tools connector now (§1) vs.
   waiting to build a freebie-discovery tool first (§6). Recommendation:
   submit the merchant connector now; freebie discovery is a separate
   later listing once a real feed + tool exist.
4. **`voice_agent.register` verification** — confirm how (or whether)
   domain ownership is verified before a number is published (§7).
5. **Pre-submit evals** — one authenticated `tools/call` per write
   tool, plus a tenant-isolation check (see §7). Not done in this
   packet; do not submit until green.
6. **Discovery-doc cleanup (optional, pre-submit)** — fix the
   `endpoint` field in the `/api/mcp` discovery doc to the
   `https://app.qrblox.com/api/mcp` URL instead of the `http://`
   Cloud Functions URL.

## 9. Verification log (all checks done for this packet, 2026-10-14)

- `GET https://app.qrblox.com/api/mcp` → 200, discovery doc, 14 tools
- `POST https://app.qrblox.com/api/mcp` `initialize` → 200,
  `serverInfo: qrblox-mcp 0.1.0`, protocol `2025-03-26` (one handshake
  only; no tool calls tested, sandbox quota untouched)
- `GET /.well-known/mcp.json` on both hosts → 404 (no descriptor)
- `https://qrblox.com/privacy` → 200 (real policy page)
- `https://qrblox.com/terms` → 200 (real terms page)
- `https://qrblox.com/support` → 200; `support@qrblox.com` in page source
- `https://docs.qrblox.com/mcp.html` → 200 (redirects to `/mcp`)
- `https://qrblox.com/phone-book` → 200 (live public directory)
- `https://qrblox.com/freebies`, `/drops` → 404 (no public drops feed)
- `https://app.qrblox.com/privacy`, `/terms`, `/support` → 404
  (legal/support live on the marketing host only)
