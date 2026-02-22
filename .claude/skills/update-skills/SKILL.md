---
name: update-skills
description: Sync skills from LifeDB repo — detect changes, adapt for landing page, create PR
disable-model-invocation: true
---

# Update Skills from LifeDB

Detect new or changed skills in the LifeDB repository and sync them into this landing page repo, adapted for frontend context.

## Source Context

- LifeDB skills directory: `/Users/nathanramia/Documents/Code/Unbound/LifeDB/.claude/skills/`
- LifeDB agents directory: `/Users/nathanramia/Documents/Code/Unbound/LifeDB/.claude/agents/`
- Landing skills directory: `.claude/skills/`

> **Note:** The LifeDB paths above assume Nathan's local checkout. If your LifeDB repo is at a different path, substitute accordingly before running.

## Current Landing Repo Skills

```
!ls -la .claude/skills/
```

## Instructions

### Step 1: Inventory Both Repos

1. **Read all LifeDB skills.** Use Glob to find every `SKILL.md` under `/Users/nathanramia/Documents/Code/Unbound/LifeDB/.claude/skills/`. Read each file completely.
2. **Read all Landing repo skills.** Read every `SKILL.md` under `.claude/skills/`. Read each file completely.
3. **Read LifeDB agents.** Use Glob to find every agent definition under `/Users/nathanramia/Documents/Code/Unbound/LifeDB/.claude/agents/`. Read each file.
4. **Build a comparison table.** For each LifeDB skill/agent, note:
   - Whether a corresponding adapted version exists in Landing
   - If it exists, whether the LifeDB version has meaningful changes since the Landing version was last synced (compare structure, methodology, steps — ignore Go-specific details that were intentionally replaced with frontend equivalents)
   - If it's new, whether it's a candidate for adaptation

### Step 2: Classify Each Skill/Agent

For each item, classify it using the decision framework below.

#### PULL IN and adapt (create new or update existing):

- **Workflow skills** that apply to any repo with PRs and code: review processes, PR validation, implementation orchestration, feedback addressing
- **Methodology improvements** to existing adapted skills: new steps, better escalation triggers, refined severity categories, improved subagent prompts, better referee evaluation postures
- **New specialist skills** that serve frontend quality: visual regression detection, responsive validation, accessibility checking, analytics verification

#### DO NOT pull in:

- **Go-specific skills** that have no frontend equivalent: Go test runners, Go linters, Go build validators, Go-specific deployment skills
- **Implementation variant skills** (`implement-a`, `implement-b`, etc.) — this repo uses a single `implement` skill with prompt-injection approach; methodology improvements should be merged into it rather than creating variants
- **Custom agent types** (`pr-reviewer`, `review-addresser`) — this repo uses `general-purpose` subagents with prompt injection; custom agent types add complexity without benefit for a small repo
- **Infrastructure/tooling** (settings.json hooks, CI-specific skills) — LifeDB-specific

#### MERGE methodology improvements (update existing rather than create new):

- If LifeDB has `implement-a` or `implement-b` with improved Phase 4 logic, merge the improvement into the single `implement` skill
- If LifeDB added a new specialist agent type to `review-pr`, evaluate whether it applies to frontend review and add it if so
- If LifeDB improved the referee evaluation postures or escalation triggers, merge those into the Landing version
- If LifeDB improved the fork-based subagent skills (`implement-review`, `implement-address`), update the Landing versions accordingly

### Step 3: Adapt Changes

For each skill classified as "pull in" or "merge":

1. **Strip Go-specific content:**
   - Replace test suite references (`go test ./...`, `make lint`) with frontend verification (`npm run dev`, visual check of both variants at mobile + desktop, TypeScript compilation via `npx wrangler types && npx tsc --noEmit`)
   - Replace code review focus (Go bugs, race conditions, N+1 queries) with frontend review focus (visual correctness, responsive layout, variant consistency, XSS/injection, analytics events)
   - Replace code conventions references (`docs/specs/standards/go-conventions.md`, `docs/specs/standards/testing-standards.md`) with landing page conventions (`AGENTS.md`, `CLAUDE.md`, `.claude/pr-standards.md`)
   - Replace ADR references (`docs/adr/`) with experiment design references (`AGENTS.md` § A/B Experiment Design)

2. **Adjust specialist agents:**
   - LifeDB: Correctness, Security, Performance, Requirements, Standards
   - Landing: Correctness (Worker logic, D1 queries, routing), Security (XSS, SQL injection, cookie flags), Visual (responsive layout, both variants, accessibility), Standards (PR formatting, analytics events, variant coverage)
   - If LifeDB adds concerns to Performance or Requirements, evaluate whether they belong in Landing's Correctness or Visual specialist rather than creating new specialists

3. **Supplement escalation triggers:**
   - Keep LifeDB's core triggers (e.g., "changes touch auth, crypto, or PII handling") — they apply to the Worker code in this repo too
   - Add Landing-specific triggers: "changes to A/B routing logic, D1 schema, Worker config (`wrangler.toml`), CI workflows, new third-party dependencies"

4. **Adjust verification steps:**
   - LifeDB: "Run the full test suite. All tests must pass."
   - Landing: "Run `npm run dev` and verify both variants render correctly at mobile and desktop widths. If API changes, test form submission end-to-end. If shared assets changed, check both `/start` and `/build`."

5. **Keep sizing thresholds:**
   - Same as LifeDB: 400/600 lines (frontend PRs are similarly scoped)

6. **Preserve core methodology:**
   - The adversarial review pattern (specialist agents -> consolidation -> referee -> addresser) should remain intact
   - The Apply/Partially-apply/Reject/Escalate framework should remain intact
   - The 3-round review loop with escalation should remain intact
   - Independent verification before applying any suggestion should remain intact

7. **Maintain frontmatter conventions:**
   - Skills invoked directly by the user (e.g., `review-pr`, `address-review`, `pr-check`) use `disable-model-invocation: true`
   - Orchestration skills that run autonomously (e.g., `implement`, `merge-pr`) omit `disable-model-invocation` so they can be invoked programmatically
   - Fork-based subagent skills use `context: fork` and `agent: general-purpose`
   - Shell escapes use code-fenced format: `` ```\n!command\n``` ``

8. **Landing-specific concerns to add/preserve:**
   - Both variants (`/start` and `/build`) must be checked after shared asset changes
   - Mobile + desktop responsive verification for all visual changes
   - Analytics events (`data-cta` attributes) on new interactive elements
   - Form submission flow testing for API changes
   - No frontend build step — keep it hand-written HTML/CSS/JS

### Step 4: Create Branch and Commit

1. Create branch: `chore/sync-skills-from-lifedb`
2. Stage all changed/new files under `.claude/skills/`
3. Commit: `chore: Sync skills from LifeDB — <brief description of what changed>`

### Step 5: Create PR

```
gh pr create --title "chore: Sync skills from LifeDB" --body "$(cat <<'EOF'
## Summary
Sync skill updates from the LifeDB repository, adapted for landing page context.

### Changes
<list each skill that was added or updated, with a one-line description of what changed>

### Skipped
<list any LifeDB skills/agents that were evaluated and intentionally not pulled in, with brief reasoning>

## Test evidence
Skills are methodology documents — verified by reading adapted content for correctness.

## Review focus
- Verify adapted skills make sense for a frontend/landing page repository
- Check that Go-specific references were properly replaced with frontend equivalents
- Confirm escalation triggers are appropriate for this repo's architecture
EOF
)"
gh pr edit <number> --add-reviewer nbramia,benjamcalvin
```

### Step 6: Review the PR

Invoke the `review-pr` skill against the new PR to run a full adversarial review. Address any findings using the `address-review` methodology.

### Step 7: Finalize

1. Run `pr-check` validation against the PR
2. Fix any failures
3. Post completion summary to the PR
4. Report the PR URL — ready for human merge

## Decision Log

This section records past decisions for context. Update it when new precedents are set.

### 2026-02-22 — Pre-existing Adaptations (before this skill existed)

**Already adapted (7 skills):**
- `review-pr` — Frontend review with Correctness, Security, Visual, Standards specialists (replaced Go-focused Correctness, Security, Performance, Requirements, Standards)
- `address-review` — Frontend feedback addressing with visual verification of both variants (replaced Go test suite verification)
- `pr-check` — Frontend PR validation with Test Evidence requiring visual checks and variant coverage (kept 400/600 sizing thresholds)
- `implement` — Single frontend implementation lifecycle with prompt-injection approach (adapted Phase 2 for visual verification, adapted escalation triggers for A/B routing/D1/Worker concerns)
- `implement-review` — Fork-based review subagent (adapted to reference Landing review-pr methodology)
- `implement-address` — Fork-based address subagent (adapted verification to check both variants and mobile/desktop)
- `merge-pr` — Landing-specific skill (not from LifeDB, created directly for this repo)

**Not pulled in (from LifeDB):**
- `implement-a` — Custom subagent variant using `pr-reviewer` and `review-addresser` agent types; Landing uses prompt-injection approach in a single `implement` skill
- `implement-b` — Context-fork variant; Landing already has fork skills (`implement-review`, `implement-address`) as standalone alternatives, with `implement` using prompt-injection as the primary approach
- `pr-reviewer` agent — Custom agent type for implement-a approach; not needed since Landing uses `general-purpose` subagents
- `review-addresser` agent — Same reasoning as pr-reviewer

**Landing-specific (not from LifeDB):**
- `merge-pr` — Handles PR merge with validation readiness checks, issue updates, and squash-merge workflow
- `.claude/pr-standards.md` — Adapted PR standards document (branch naming, test evidence, review tiers, merge criteria)
