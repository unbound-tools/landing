---
name: implement-review
description: Adversarial PR review round for implement workflow (runs as subagent)
context: fork
agent: general-purpose
argument-hint: <pr-number> <round-number>
---

# Adversarial PR Review — Round $1

Review PR #$0, round $1 of 3.

## PR Context

- PR metadata: !`gh pr view $0`
- PR diff: !`gh pr diff $0`
- PR comments: !`gh pr view $0 --comments`

## Instructions

### Step 1: Load Review Methodology

Read `.claude/skills/review-pr/SKILL.md` for the full review methodology. Follow the specialist agent spawning approach, severity categories, verification steps, and anti-patterns described there.

### Step 2: Check Round Context

This is round $1 of 3. If this is round 2 or later, read the PR comments above to find previous "Review Round — Referee Decisions" comments. Do NOT repeat findings that were already addressed or explicitly rejected with justification. Focus on:
- New issues introduced by fixes
- Issues missed in prior rounds
- Whether previously-addressed findings were actually fixed correctly

### Step 3: Execute Review

Follow the methodology from Step 1. Use the PR diff and metadata from the Context section above.

### Step 4: Post and Return Findings

Post findings to GitHub using `gh pr review $0 --comment --body "<findings>"`.

Return findings in exactly this structure:

### Action Required
- **[Category]** Description with specific file:line references

### Recommended
- **[Category]** Description with specific file:line references

### Minor
- **[Category]** Description with specific file:line references

### Summary
<1-2 sentence overall assessment: merge-ready, needs changes, or needs discussion>

If a category has no findings, omit it entirely.
