---
name: review-pr
description: Run adversarial PR review with specialist subagents
disable-model-invocation: true
argument-hint: <pr-number>
---

# Adversarial PR Review

Review PR #$ARGUMENTS using specialist agents. Be adversarial — verify claims, don't trust assertions.

## PR Context

```
!gh pr view $ARGUMENTS
```

```
!gh pr diff $ARGUMENTS
```

## Instructions

### Step 1: Gather Context

Before spawning any review agents, gather context yourself:

1. Read the PR description above. Identify the **intent**, **test evidence**, and any **review focus** areas the author flagged.
2. Check referenced issues — if the description links to issues (`#N`), read them to understand what the PR is supposed to accomplish.
3. Scan the diff file list. Identify which files are touched — Worker code (`src/`), HTML variants (`pages/_variants/`), shared assets (`pages/assets/`), or infrastructure (`.github/`, `wrangler.toml`). Does the scope match the stated intent, or are there unrelated changes?
4. If this is part of a stacked PR series, note the stack position and ensure you're reviewing in order.

### Step 2: Verify Claims

Do not trust the PR description at face value. Independently verify:

- **Test evidence** — If the author says "both variants checked," check out the branch and run `npm run dev` yourself. Verify both `/start` and `/build` render correctly. Agent work is cheap; broken deploys are expensive.
- **Scope claims** — If the description says "only touches X," confirm via the diff that nothing else was changed.
- **Variant coverage** — If shared assets (CSS, JS) were changed, verify both variants still work. If only one variant was changed, confirm the other doesn't need the same update.

### Step 3: Select Specialist Agents

Based on the change type, determine which specialists to spawn:

- **Style/copy-only change** → Standards only
- **Frontend change (HTML/CSS/JS)** → Visual + Standards
- **Worker/API change** → Correctness + Security + Standards
- **Full-stack change** → All four specialists

### Step 4: Spawn Specialist Agents

Use the Task tool to spawn the selected agents **in parallel**. Each agent should be a `general-purpose` subagent. Provide each agent with:

- The full PR diff (copy it into the prompt)
- The specific focus area and what to look for (see table below)
- Instructions to categorize every finding by severity: **Action Required**, **Recommended**, or **Minor**

| Agent | Focus | What to Check |
|-------|-------|---------------|
| Correctness | Worker logic bugs, D1 query issues, routing edge cases, form validation gaps | Check `src/` changes against `AGENTS.md` (architecture, data flow, database schema). Verify D1 queries are correct, API endpoints validate input, routing logic handles all cases. |
| Security | XSS in user input, missing input validation on API endpoints, secrets exposure, cookie security | Check for unescaped user input in HTML, SQL injection in D1 queries, exposed secrets, cookie flags (Secure, SameSite). Reference: `AGENTS.md` (boundaries). |
| Visual | Responsive layout at mobile/desktop, both variants render correctly, shared asset changes don't break either variant, accessibility basics | Check HTML/CSS changes render correctly, responsive breakpoints aren't broken, both variants work if shared assets changed. Reference: `AGENTS.md` (visual verification matters). |
| Standards | Branch naming, PR formatting, commit messages, both-variants-checked, analytics events on new interactive elements | Reference: `.claude/pr-standards.md`. Check that new interactive elements have `data-cta` attributes and fire analytics events. |

### Step 5: Consolidate Review

After all specialist agents return findings:

1. Merge all findings into a single list
2. Deduplicate — if multiple agents flagged the same issue, keep the most detailed version
3. Resolve conflicts — if agents disagree, note the disagreement and recommend the safer option
4. Sort by severity: **Action Required** first, then **Recommended**, then **Minor**

### Step 6: Post Review

Format the consolidated review and post it as a GitHub PR review comment using:

```
gh pr review $ARGUMENTS --comment --body "<review content>"
```

Use this output format:

```markdown
## PR Review: <PR title>

### Action Required
- **[Agent]** Finding description with file:line references

### Recommended
- **[Agent]** Finding description with file:line references

### Minor
- **[Agent]** Finding description with file:line references

### Summary
<1-2 sentence overall assessment: merge-ready, needs changes, or needs discussion>
```

If there are no Action Required items, state that explicitly. If there are no findings at all in a category, omit that category.

## Escalation

Stop the review and flag the human directly (do not post as a PR comment) when encountering:

- Ambiguous requirements or missing acceptance criteria
- Changes to A/B routing logic or variant assignment
- D1 schema changes (new or altered tables)
- Changes to Cloudflare Worker configuration (`wrangler.toml`)
- Changes to CI workflows (`.github/workflows/`)
- New third-party dependency or external script introduction

When escalating, provide: what you tried, evidence, options with tradeoffs, and your recommended path.

## Anti-Patterns

Do not fall into these traps during review:

- **Blind trust** — Merging because "it looks fine" without running `npm run dev` and checking both variants
- **Review theater** — Approving without reading or comprehending
- **Skipping verification** — Trusting the author's claims about visual results or variant coverage
- **Variant drift** — Approving changes to one variant without checking if the other needs the same change
