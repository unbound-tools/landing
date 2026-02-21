---
name: address-review
description: Address PR review feedback, verify independently, and re-request review
disable-model-invocation: true
argument-hint: <pr-number>
---

# Address Review Feedback

Address review comments on PR #$ARGUMENTS. Be adversarial about the feedback itself — verify that suggestions are correct before applying them.

## PR Context

```
!gh pr view $ARGUMENTS
```

```
!gh api repos/{owner}/{repo}/pulls/$ARGUMENTS/comments --jq '.[] | "---\n\(.path):\(.line // .original_line)\n\(.body)\n"'
```

```
!gh pr view $ARGUMENTS --comments
```

## Instructions

### Step 1: Gather All Feedback

Read every review comment above. Categorize each piece of feedback:

- **Action Required** — Reviewer flagged as blocking merge
- **Recommended** — Reviewer suggested addressing before merge
- **Minor** — Nits, style suggestions

### Step 2: Independently Verify Each Finding

**Do not blindly apply suggestions.** For each piece of feedback:

1. **Read the file in question** — Use Glob/Grep/Read to find the relevant file and understand the full context, not just the diff snippet.
2. **Assess whether the feedback is correct** — Reviewers (including agent reviewers) can be wrong. Check:
   - Does the suggested change actually fix the issue identified?
   - Could the suggestion introduce a new bug or visual regression?
   - Is the reviewer missing context that makes the current code correct?
   - Does the suggestion align with project conventions in `AGENTS.md`?
3. **For visual feedback** — Check out the branch, run `npm run dev`, verify rendering at mobile and desktop widths, check both variants (`/start` and `/build`).
4. **For security feedback** — Take it seriously by default. Security suggestions should be applied unless you can clearly demonstrate they're wrong.

### Step 3: Respond to Each Finding

For each piece of feedback, take one of these actions:

**Apply** — The feedback is correct. Make the change.
- Edit the file
- Run `npm run dev` and verify both variants render correctly
- Note what was changed

**Partially apply** — The core insight is right but the suggested fix isn't quite right.
- Implement a better fix that addresses the underlying concern
- Explain why you deviated from the exact suggestion

**Reject with justification** — The feedback is incorrect or doesn't apply.
- Explain clearly why the current code is correct
- Reference `AGENTS.md` or project conventions to support your reasoning
- Never reject feedback without a concrete justification

**Escalate** — You're unsure whether the feedback is valid.
- Flag it to the human with the evidence for and against
- Do not guess or silently skip

### Step 4: Run Full Verification

After addressing all feedback:

1. **Run `npm run dev`** and verify both variants render correctly at mobile and desktop widths
2. **Check TypeScript compilation** — `npx wrangler types && npx tsc --noEmit` (Worker-side only)
3. **Test form submission** if any API or form changes were made
4. **Spot-check your changes** — Read through your own diff. Did you introduce any new issues while fixing the review feedback?
5. **Check sizing** — If the fixes significantly expanded the PR, flag whether it should be split.

### Step 5: Commit and Push

- Commit fixes with clear messages linking to the review feedback: `fix: Address review — <description>`
- Keep fix commits separate from each other when they address unrelated feedback (easier to review the re-review)
- Push to the PR branch

### Step 6: Post Summary and Re-request Review

Post a comment on the PR summarizing how each finding was addressed, then re-request review:

```
gh pr comment $ARGUMENTS --body "<summary>"
gh pr edit $ARGUMENTS --add-reviewer <reviewer>
```

Use this format for the summary:

```markdown
## Review Feedback Addressed

| # | Finding | Action | Details |
|---|---------|--------|---------|
| 1 | <brief description> | Applied / Partially applied / Rejected | <what was done and why> |
| 2 | ... | ... | ... |

**Visual verification:** Both variants checked at mobile + desktop
**New commits:** <list of fix commits>
```

For any rejected findings, provide the full justification in the Details column so the reviewer can evaluate your reasoning.
