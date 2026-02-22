---
name: implement-address
description: Address filtered review findings for implement workflow (runs as subagent)
context: fork
agent: general-purpose
argument-hint: <pr-number> <round-number>
---

# Address Review Findings — Round $1

Address filtered review findings on PR #$0, round $1.

## PR Context

- PR metadata: !`gh pr view $0`
- PR comments: !`gh pr view $0 --comments`

## Instructions

### Step 1: Load Address Methodology

Read `.claude/skills/address-review/SKILL.md` for the full address methodology. Follow the Apply/Partially-apply/Reject/Escalate framework, verification steps, and commit conventions described there. **Skip Step 6 (Re-request Review)** — the orchestrator controls the review loop, so do not re-request review or add reviewers.

### Step 2: Find Filtered Findings

Read the PR comments above. Find the most recent "Review Round $1 — Referee Decisions" comment. This contains the filtered action plan — only findings the referee accepted or downgraded. Address these findings only.

**If no "Review Round $1 — Referee Decisions" comment is found**, stop and report the issue: post a PR comment stating that no referee decisions were found for round $1, then return an error to the orchestrator. Do not proceed without the filtered findings.

### Step 3: Address Each Finding

For each finding in the referee's filtered action plan:
1. Independently verify the finding by reading the relevant code
2. Apply the appropriate fix using the framework from Step 1
3. Verify changes work after ALL edits — check both variants if shared assets were touched, check mobile/desktop for visual changes

### Step 4: Commit and Push

- Commit with message format: `fix: address review round $1 — <description>`
- Keep fix commits separate when addressing unrelated findings
- Push to the PR branch

### Step 5: Post Summary

Post your summary to the PR:

```
gh pr comment $0 --body "<summary>"
```

Return a summary table:

| # | Finding | Action | Details |
|---|---------|--------|---------|
| 1 | <brief description> | Applied / Partially applied / Rejected | <what was done and why> |

**Verification:** <what was checked and results>
**Commits:** <list of fix commit messages>
