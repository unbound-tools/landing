# Unbound Landing Pages

A/B landing page experiment for [unbound.tools](https://unbound.tools). Two variants testing AI-specific vs. general infrastructure framing, with server-side Cloudflare Worker routing, form capture, and custom analytics backed by D1 (SQLite at edge).

## Architecture

- **Cloudflare Worker** (`src/`) — A/B routing with cookie assignment, API endpoints for signups, surveys, and events
- **Static Assets** (`pages/`) — Hand-written HTML/CSS/JS, no build step, no framework
- **Cloudflare D1** — SQLite at edge for all data (signups, survey responses, analytics events)

Visitors to `/` are randomly assigned variant A or B via cookie. Direct visits to `/start` (AI Builders) or `/build` (Product Builders) bypass randomization.

### Key Paths

| Path | What it is |
|------|-----------|
| `pages/_variants/start.html` | Variant A source — AI Builders |
| `pages/_variants/build.html` | Variant B source — Product Builders |
| `pages/assets/style.css` | Shared styles |
| `pages/assets/*.js` | Analytics, form handling, graph, typewriter |
| `pages/thanks/index.html` | Thank-you page + survey |
| `src/index.ts` | Worker entry point |
| `src/router.ts` | A/B routing logic |
| `src/api/signup.ts` | POST /api/signup |
| `src/api/survey.ts` | POST /api/survey |
| `src/api/event.ts` | POST /api/event |
| `schema.sql` | D1 table definitions |
| `queries/` | Analysis SQL (not deployed, for local querying) |

### Database Tables

- **assignments** — Visitor variant assignments (visitor_id → variant A/B)
- **signups** — Email captures (primary conversion metric)
- **survey_responses** — Optional post-signup survey
- **events** — Scroll depth, time on page, CTA clicks, and other analytics

## Development

```bash
npm install          # Install dependencies
npm run dev          # Local dev at localhost:8787
npm run deploy       # Deploy to Cloudflare
npm run db:init      # Initialize remote D1 schema
npm run db:init:local # Initialize local D1 schema
```

### Querying Analytics

```bash
# Production (requires --remote flag)
npx wrangler d1 execute landing-db --remote --file=queries/conversion-by-variant.sql
npx wrangler d1 execute landing-db --remote --file=queries/survey-distributions.sql
npx wrangler d1 execute landing-db --remote --file=queries/scroll-depth.sql

# Local (omit --remote, hits local D1)
npx wrangler d1 execute landing-db --file=queries/conversion-by-variant.sql
```

---

## Development Principles

These apply to all work — code, copy, and design. They bias toward caution over speed.

### 1. Think Before Acting

**Don't assume. Don't hide confusion. Surface tradeoffs.**

- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.

### 2. Simplicity First

**Minimum work that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- This is hand-written HTML/CSS/JS. No build tools, no frameworks, no transpilation on the frontend. Keep it that way.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

- Don't "improve" adjacent content, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated issues, mention them — don't fix them uninvited.
- Both variants share CSS and JS. Changes to shared assets affect both variants — verify both after any shared file edit.

### 4. Goal-Driven Execution

**Define success criteria. Verify before finishing.**

- "Update the copy" → Check both variants, check mobile and desktop, check that links work
- "Add a new section" → Confirm it renders correctly, respects existing responsive breakpoints, and analytics events fire
- "Change the form" → Verify the API endpoint still works, the thank-you page still loads, and the D1 write succeeds

### 5. Visual Verification Matters

**This is a landing page. How it looks is the product.**

- Copy changes must be verified visually — a typo or layout break is a production bug.
- CSS changes must be checked at multiple viewport widths. The page uses responsive breakpoints, not a framework.
- When in doubt about how something renders, take a screenshot or ask.

---

## Boundaries

| Tier | Action |
|------|--------|
| **Always** | Verify both variants after changes to shared assets (CSS, JS) |
| **Always** | Check mobile and desktop rendering for visual changes |
| **Always** | Test form submission flow end-to-end after API changes |
| **Ask first** | Schema migrations (new or altered D1 tables) |
| **Ask first** | Adding new third-party dependencies or external scripts |
| **Ask first** | Changes to A/B routing logic |
| **Ask first** | Changes to Cloudflare Worker configuration (wrangler.toml) |
| **Never** | Commit secrets, credentials, or API keys |
| **Never** | Force push to main |
| **Never** | Introduce a frontend build step or framework |
| **Never** | Skip pre-commit hooks (`--no-verify`) |

---

## A/B Experiment Design

Two variants test different framings of the same product (a unified personal data API):

| | Variant A — `start` (AI Builders) | Variant B — `build` (Product Builders) |
|---|---|---|
| **Hero** | "Your AI has no memory." | "Your users have 15 messaging apps. You need one API." |
| **Subheadline** | Focuses on AI not knowing who users talked to | "Stop building connectors. Start building your product." |
| **Rotating words** | "Give your AI access to" — messages, emails, calendar, contacts, calls | "One integration for" — iMessage, Slack, Gmail, WhatsApp, Calendar |
| **Meta description** | AI that needs to know who your user talked to | Connectors, normalization, entity resolution out of the box |
| **Target audience** | Developers building AI products that need user context | Developers building any product that touches messaging/comms |

**Shared across variants:** code preview, feature grid, trust items, graph visualization, signup form, thank-you page, all CSS and JS.

### Metrics

- **Primary:** Signup conversion rate (by variant)
- **Secondary:** Scroll depth, time on page, CTA clicks, survey responses

---

## Visitor Tracking & Analytics

### Visitor Identity

- **Visitor ID:** `crypto.randomUUID()` generated server-side in `router.ts`, stored in `visitor_id` cookie (1-year expiry, `SameSite=Lax; Secure`)
- **NOT IP-based** — IP is recorded in `assignments` for reference but is not the visitor identifier

### Variant Assignment

- **Cookie:** `ab_variant` (value `A` or `B`), same 1-year expiry
- **`/` route:** 50/50 random assignment (`Math.random() < 0.5`), source = `random`
- **`/start` route:** Forces variant A, source = `direct_start`
- **`/build` route:** Forces variant B, source = `direct_build`
- **Returning visitors:** Existing cookies honored, source = `returning`

### UTM Tracking

- `utm_source` and `utm_campaign` captured from URL query params
- Stored on: assignments, events, signups (NOT survey_responses)

### Events

Defined in `src/api/event.ts` VALID_EVENTS, fired by `pages/assets/analytics.js`:

| Event | Value | Trigger |
|-------|-------|---------|
| `page_view` | — | Page load |
| `scroll_depth` | `"25"`, `"50"`, `"75"`, `"100"` | IntersectionObserver on `#scroll-{pct}` sentinel elements |
| `cta_click` | `data-cta` attribute value | Click on any `[data-cta]` element |
| `time_on_page` | Seconds as string | `visibilitychange` → `hidden` |
| `share_click` | — | Defined in VALID_EVENTS but not fired by analytics.js |

### Data Flow

1. Visitor hits `/`, `/start`, or `/build`
2. Worker (`router.ts`) checks cookies → assigns variant if new → sets cookies → serves HTML
3. Page loads → `analytics.js` reads cookies → fires `page_view` via `sendBeacon` to `POST /api/event`
4. User scrolls/clicks/leaves → additional events fire via same mechanism
5. Signup form submits to `POST /api/signup` → redirects to thank-you page
6. Optional survey submits to `POST /api/survey`

---

## Database Schema

All tables live in Cloudflare D1 (`landing-db`). Schema defined in `schema.sql`.

### assignments
Visitor variant assignments. One row per visitor. `id` is the visitor UUID.

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | visitor_id (UUID) |
| `variant` | TEXT NOT NULL | `"A"` or `"B"` |
| `source` | TEXT | `random`, `direct_start`, `direct_build`, `returning` |
| `ip` | TEXT | CF-Connecting-IP header |
| `utm_source` | TEXT | From URL params |
| `utm_campaign` | TEXT | From URL params |
| `referrer` | TEXT | Referer header |
| `created_at` | TEXT NOT NULL | ISO 8601 |

### signups
Email captures — the primary conversion metric.

| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER PK | Autoincrement |
| `visitor_id` | TEXT NOT NULL | References assignments.id |
| `email` | TEXT NOT NULL | Validated: contains `@`, max 320 chars |
| `role` | TEXT NOT NULL | `ai_product`, `dev_tool`, or `exploring` |
| `variant` | TEXT NOT NULL | |
| `utm_source` | TEXT | |
| `utm_campaign` | TEXT | |
| `created_at` | TEXT NOT NULL | ISO 8601 |

Index: `idx_signups_variant` on `(variant)`

### events
Analytics events from `analytics.js`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER PK | Autoincrement |
| `visitor_id` | TEXT NOT NULL | |
| `event_type` | TEXT NOT NULL | See Events table above |
| `variant` | TEXT NOT NULL | |
| `page` | TEXT | `window.location.pathname` |
| `value` | TEXT | Event-specific (scroll %, seconds, CTA name) |
| `utm_source` | TEXT | |
| `utm_campaign` | TEXT | |
| `created_at` | TEXT NOT NULL | ISO 8601 |

Index: `idx_events_variant` on `(variant, event_type)`

### survey_responses
Optional post-signup survey from the thank-you page.

| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER PK | Autoincrement |
| `visitor_id` | TEXT NOT NULL | |
| `signup_id` | INTEGER | References signups.id |
| `building_what` | TEXT | Free text |
| `data_sources` | TEXT | JSON array of strings |
| `current_solution` | TEXT | `built_own`, `third_party`, `not_started`, `not_worth` |
| `variant` | TEXT NOT NULL | |
| `created_at` | TEXT NOT NULL | ISO 8601 |

No index (low volume table).

---

## Related Resources

- [unbound-tools/lifedb-docs](https://github.com/unbound-tools/lifedb-docs) — Public documentation repo (linked from landing page)
- [unbound-tools/lifedb](https://github.com/unbound-tools/lifedb) — Private product repo
- PR workflow: `/pr-check`, `/review-pr`, `/address-review` skills
