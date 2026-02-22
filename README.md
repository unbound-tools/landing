# Unbound Landing Pages

A/B landing page experiment for [unbound.tools](https://unbound.tools). Two variants testing AI-specific vs. general infrastructure framing, with server-side routing, form capture, and custom analytics.

## Architecture

- **Cloudflare Worker** — A/B routing with cookie assignment, API endpoints
- **Worker Static Assets** — HTML/CSS/JS served from `pages/`
- **Cloudflare D1** — SQLite at edge for signups, surveys, and analytics

Visitors to `/` are randomly assigned variant A or B. Direct visits to `/start` (AI Builders) or `/build` (Product Builders) bypass randomization.

## Setup

### Prerequisites

- Node.js 18+
- [Cloudflare account](https://dash.cloudflare.com) (free tier)

### Install

```bash
npm install
```

### Create D1 database

```bash
npx wrangler d1 create landing-db
```

Copy the `database_id` from the output into `wrangler.toml`.

### Initialize schema

```bash
# Remote
npm run db:init

# Local (for dev)
npm run db:init:local
```

### Local development

```bash
npm run dev
```

Visit `http://localhost:8787`.

### Deploy

Production deploys happen automatically via CI when changes are merged to `main`. Do not deploy manually.

## Querying data

Add `--remote` to query production D1. Without it, queries hit the local database.

```bash
# Conversion rate by variant
npx wrangler d1 execute landing-db --remote --file=queries/conversion-by-variant.sql

# Survey distributions
npx wrangler d1 execute landing-db --remote --file=queries/survey-distributions.sql

# Scroll depth + time on page
npx wrangler d1 execute landing-db --remote --file=queries/scroll-depth.sql
```

## Documentation

| File | Audience | Covers |
|------|----------|--------|
| `AGENTS.md` | All contributors | Architecture, lifecycle, boundaries, experiment design, analytics, schema |
| `CLAUDE.md` | AI agents | Behavioral rules, merge policy, common mistakes, quick reference |
| `.claude/pr-standards.md` | All contributors | Branch naming, PR format, review, merge criteria |

## Structure

```
pages/              Static HTML, CSS, JS
  _variants/        Variant source files (served as / , /start, /build)
    start.html      Variant A (AI Builders)
    build.html      Variant B (Product Builders)
  thanks/           Thank-you page + optional survey
  assets/           Shared CSS and JS
src/                Worker source (TypeScript)
  api/              POST endpoint handlers
queries/            Analysis SQL (not deployed)
schema.sql          D1 table definitions
wrangler.toml       Worker + D1 configuration
```
