---
name: implement
description: Full implementation lifecycle with adversarial review using subagents
argument-hint: <task-description or #issue-number>
---

# Implement

Orchestrate the full implementation lifecycle for: $ARGUMENTS

## Context

- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -5`
- Issue (if applicable): !`gh issue view $ARGUMENTS 2>/dev/null || echo "NOT_AN_ISSUE"`

## Instructions

This skill runs five phases. Use TaskCreate/TaskUpdate to track progress — create phase-level tasks at the start, break into granular items as you enter each phase.

**Entry point — determine where to start:**
1. If `$ARGUMENTS` starts with `#`, it is a GitHub issue. The issue body is shown in Context above — extract the task description and acceptance criteria. Then proceed to Phase 1.
2. Run `gh pr list --head <current-branch> --json number,title --jq '.[0]'`. If a PR exists, verify it relates to the current task (check title/description alignment). If it does, record the PR number and **skip to Phase 4**. If it appears unrelated, ignore it and proceed to Phase 1.
3. Otherwise, treat `$ARGUMENTS` as a freeform task description.

---

### Phase 1: Understand & Plan

1. **Explore.** Use Glob, Grep, Read to understand relevant modules, existing patterns, test structure. Read any specs or docs referenced by the task.
2. **Define done.** Write verifiable acceptance criteria. Capture each as a TaskCreate item.
3. **Identify verification steps.** List what must be true when the task is complete — visual checks at mobile/desktop widths, both variants rendering correctly, analytics events firing, form submission working end-to-end.
4. **Plan implementation.** Identify files to create/modify, dependencies, sequencing. Minimum viable approach — AGENTS.md § "Simplicity First".

### Phase 2: Implement

1. **Create a branch** if not already on a feature branch: `<type>/<short-description>` per `.claude/pr-standards.md`.
2. **Write the code.** Follow existing patterns. Surgical changes only. Remember: both variants share CSS and JS — verify changes don't break either variant.
3. **Verify your changes:**
   - Run `npm run dev` and confirm the page renders correctly
   - Check both variants (`/start` and `/build`) if shared assets were changed
   - Check mobile and desktop widths for visual changes
   - Test form submission flow if API changes were made
   - Confirm analytics events fire for new interactive elements
4. **Self-review your diff.** Read every changed file. Check for: unused code, style mismatches, changes that do not trace to the task, responsive breakpoint issues.

### Phase 3: Create PR

1. **Commit** with `<type>: <summary>` format. Separate logical changes into distinct commits.
2. **Push** the branch.
3. **Create the PR:**
   ```
   gh pr create --title "<type>: <imperative summary>" --body "$(cat <<'EOF'
   ## Summary
   <1-3 sentences: what and why>

   <Closes #N / Relates to #N if applicable>

   ## Test evidence
   <verification steps performed and results>

   ## Review focus
   <areas where review attention is most valuable>
   EOF
   )"
   ```
4. Record the PR number for subsequent phases.

---

### Phase 4: Review/Address Loop

Runs up to **3 rounds**. Each round: Reviewer subagent -> Referee (you) -> Addresser subagent.

#### Before Round 1 — Prepare Injection Context

These steps gather everything needed to construct subagent prompts. Do them once; re-fetch the diff each round.

1. **Read the review skill:** Use the Read tool on `.claude/skills/review-pr/SKILL.md`. Store the full content. Strip the YAML frontmatter block (lines between `---` markers) and strip lines that contain `` !`...` `` shell escape sequences (those inject data at skill load time — you will replace them with actual data in the prompt).
2. **Read the address skill:** Use the Read tool on `.claude/skills/address-review/SKILL.md`. Strip frontmatter and `` !`...` `` shell escape lines the same way. Also strip Step 6 (the "Re-request Review" step) — the orchestrator controls the review loop, so re-requesting review from within the addresser subagent would trigger unwanted notifications.
3. **Fetch PR data:** Run `gh pr view <number>` and `gh pr diff <number>`. Store both outputs. You will re-fetch the diff before each subsequent round since it changes after addressing.

#### Step A: Spawn Reviewer Subagent

Use the **Task tool** with these exact parameters:

- `subagent_type`: `"general-purpose"`
- `description`: `"Review PR #<number> round <N>"`
- `prompt`: Construct by concatenating the blocks below. Copy the actual data into the prompt — the subagent has no access to the PR or skill files otherwise.

**Prompt template for reviewer:**

```
You are an adversarial code reviewer. Your job is to find real problems — bugs, security issues, spec violations, missing tests. Do not nitpick style unless it violates project conventions.

## PR Metadata
<paste output of: gh pr view <number>>

## PR Diff
<paste output of: gh pr diff <number>>

## Review Methodology
<paste the stripped contents of review-pr/SKILL.md here — this gives the reviewer the full review methodology including specialist agent spawning, severity categories, verification steps, and anti-patterns>

## Round Context
Round <N> of 3.
<If N > 1, include: "Previous round referee decisions: <paste the referee decision table from the prior round>. Do NOT repeat findings that were already addressed or explicitly rejected with justification. Focus on: new issues introduced by fixes, issues missed in prior rounds, and whether previously-addressed findings were actually fixed correctly.">

## Output Format
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
```

The reviewer subagent will also post its findings to GitHub using `gh pr review`. This is fine — let it. The GitHub comment provides an audit trail.

#### Step B: Referee Evaluation (You — Main Context)

When the reviewer subagent returns, independently evaluate **every finding**. Read the relevant code yourself. Do not rubber-stamp and do not dismiss without checking.

For each finding, decide:

| Decision | When to use | Effect |
|----------|-------------|--------|
| **Accept** | Finding is valid — you verified by reading the code | Include in addresser action plan at reviewer's severity |
| **Downgrade** | Finding has merit but severity is overstated | Include at lower severity with your reasoning |
| **Reject** | Finding is incorrect, irrelevant, or pure style preference | Exclude from action plan; record your reasoning |

**Default postures** (err on the side of accepting):
- **Action Required findings:** Accept unless you can demonstrate the code is correct by reading it.
- **Security findings:** Accept by default. Reject only with concrete evidence that the concern does not apply.
- **Convention findings:** Accept if the code violates a documented standard in `AGENTS.md`, `CLAUDE.md`, or `.claude/pr-standards.md`. Reject if it is personal preference not backed by a standard.
- **Vague "consider" / "might" language:** Downgrade to Minor unless you independently agree it matters.

Produce a **filtered action plan** containing only Accepted and Downgraded findings, each with your reasoning.

**If zero findings survive filtering**, post a brief PR comment for the audit trail — `"Review Round <N>: no actionable findings — review loop complete."` — then skip to Phase 5.

#### Step C: Post Referee Decisions to GitHub

```
gh pr comment <number> --body "$(cat <<'EOF'
## Review Round <N> — Referee Decisions

| # | Finding | Reviewer Severity | Decision | Reasoning |
|---|---------|-------------------|----------|-----------|
| 1 | <brief description> | Action Required / Recommended / Minor | Accept / Downgrade to X / Reject | <why> |
| ... | ... | ... | ... | ... |

**Findings forwarded to addresser:** <count>
EOF
)"
```

#### Step D: Spawn Addresser Subagent

Use the **Task tool** with these exact parameters:

- `subagent_type`: `"general-purpose"`
- `description`: `"Address review PR #<number> round <N>"`
- `prompt`: Construct by concatenating the blocks below.

**Prompt template for addresser:**

```
You are addressing filtered review feedback on PR #<number>. A referee has validated these findings — they are real issues. Address them all, but independently verify that each suggested fix is correct before applying it.

## PR Number
<number>

## Branch
<branch-name from gh pr view --json headRefName>

## Findings to Address
<paste the filtered action plan from Step B — only Accepted and Downgraded findings, with the referee's severity and reasoning>

## Address Methodology
<paste the stripped contents of address-review/SKILL.md here — this gives the addresser the full methodology for verifying findings, the Apply/Partially-apply/Reject/Escalate framework, testing requirements, and commit conventions>

## Key Rules
- Verify changes work after ALL edits. Check both variants if shared assets were touched. Check mobile/desktop for visual changes.
- Commit with message format: `fix: address review round <N> — <description>`
- Keep fix commits separate when they address unrelated findings.
- Push to the PR branch when done.
- Do NOT re-request review or add reviewers — the orchestrator controls the review loop.
- Post your summary to the PR as a comment using: gh pr comment <number> --body "<summary>"

## Output Format
Return a summary table:

| # | Finding | Action | Details |
|---|---------|--------|---------|
| 1 | <brief description> | Applied / Partially applied / Rejected | <what was done and why> |
| ... | ... | ... | ... |

**Verification:** <what was checked and results>
**Commits:** <list of fix commit messages>
```

#### Step E: Evaluate Continuation

After the addresser subagent returns:

1. **Post the addresser's summary** as a PR comment (if the addresser didn't already).
2. **Decide whether to continue:**
   - **Stop** if: this was round 3, OR the reviewer found zero Action Required items in the last round, OR all findings were Minor.
   - **Continue** if: Action Required findings existed and were addressed — another review round may catch regressions or issues introduced by fixes. Re-fetch `gh pr diff <number>` and return to Step A.
3. **Escalate** if round 3 ends with unresolved Action Required items:

```
gh pr comment <number> --body "$(cat <<'EOF'
## Escalation — Review Loop Limit

3 review rounds completed with unresolved Action Required items:

<list each unresolved item with context on what was attempted>

Requesting human review.
EOF
)"
```

Then stop and inform the user directly with the escalation details.

---

### Phase 5: Finalize

1. **PR standards check.** Read `.claude/skills/pr-check/SKILL.md` and execute its validation checks against the PR (branch naming, title format, description, sizing, commits, references). Fix any failures.
2. **Final verification.** Confirm changes render correctly in both variants at mobile and desktop widths.
3. **Post completion summary:**
   ```
   gh pr comment <number> --body "$(cat <<'EOF'
   ## Implementation Complete

   **Task:** <original task description>
   **Review rounds:** <N>
   **Status:** Ready for human review

   ### Changes
   - <bullet summary of what was implemented>

   ### Test evidence
   <verification steps and results>
   EOF
   )"
   ```
4. Report the PR URL to the user.

---

## Escalation

Stop and flag the human directly (not as a PR comment) when encountering:

- Ambiguous requirements where you cannot proceed without clarification
- Architectural decisions that exceed the scope of the task
- A new third-party dependency is needed
- Changes touch auth, crypto, or PII handling beyond existing patterns
- Changes to A/B routing logic or Cloudflare Worker configuration
- Schema migrations (new or altered D1 tables)

Provide: what you tried, evidence for/against options, your recommended path.
