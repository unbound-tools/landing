@AGENTS.md

# Claude Code Configuration

## Workflow

- Use plan mode for non-trivial changes (new sections, structural changes, Worker logic). Quick copy edits and small CSS tweaks don't need it.
- When editing HTML variants, check if the change should apply to both `start.html` and `build.html` or just one. Ask if unclear.
- After visual changes, offer to verify rendering with browser tools if available.

## Common Mistakes

1. **Editing one variant but not the other** → Both variants share structure. Copy/structural changes usually apply to both. CSS/JS changes always affect both.
2. **Breaking responsive layout** → No CSS framework — breakpoints are manual. Test at mobile widths after any layout change.
3. **Forgetting analytics events** → New interactive elements (CTAs, form fields, sections) should fire analytics events via `pages/assets/analytics.js`.
4. **Hardcoding variant-specific content in shared files** → Shared JS/CSS must work for both variants. Variant-specific logic belongs in the HTML or uses data attributes.
5. **Adding build dependencies to the frontend** → The frontend is hand-written HTML/CSS/JS with no build step. Keep it that way. Worker-side TypeScript is the only thing that compiles.
6. **Changing the D1 schema without a migration plan** → Schema changes affect the production database. Always ask before altering tables.
7. **Forgetting `--remote` when querying production D1** → Without `--remote`, `wrangler d1 execute` hits the local database. Always include it for production queries.

## Team

Collaborators: **@nbramia** and **@benjamcalvin**. When pushing PRs, tag the other for review.

## Quick Reference

### Read These First
- New to the project → AGENTS.md (this file's import)
- Understanding variants → `pages/_variants/start.html` and `pages/_variants/build.html`
- Understanding routing → `src/router.ts`
- Understanding analytics → `pages/assets/analytics.js` and `src/api/event.ts`
- Experiment design & hypotheses → AGENTS.md § "A/B Experiment Design"
- Visitor tracking & event flow → AGENTS.md § "Visitor Tracking & Analytics"
- Database columns & types → AGENTS.md § "Database Schema"

### Key Commands
- `npm run dev` — Local development at localhost:8787
- `npm run deploy` — Deploy to Cloudflare
- `npm run db:init:local` — Initialize local D1 schema
- `npx wrangler d1 execute landing-db --file=queries/conversion-by-variant.sql` — Check conversion rates
