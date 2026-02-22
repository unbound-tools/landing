# PR Standards

Standards for pull requests on the Unbound landing page. PRs are the primary unit of collaboration — most are authored by AI agents and reviewed by a combination of agents and humans.

## Branch Naming

Format: `<type>/<short-description>`

| Type | Use |
|------|-----|
| `feat/` | New functionality (sections, form fields, Worker endpoints) |
| `fix/` | Bug fixes (broken layout, API errors, routing issues) |
| `style/` | CSS or copy-only changes with no logic impact |
| `docs/` | Documentation only |
| `chore/` | Build, CI, tooling, dependency updates |

**Rules:**
- Lowercase, hyphen-separated: `feat/survey-form`, `fix/mobile-overflow`, `style/hero-copy`
- Short but descriptive — a reader should understand the intent without opening the PR
- No issue numbers in branch names (reference issues in the PR description instead)

## PR Titles

Format: `<type>: <imperative summary>`

The type prefix matches the branch type. The summary uses imperative mood ("Add", "Fix", "Update"), not past tense ("Added", "Fixed").

```
feat: Add post-signup survey form
fix: Prevent mobile overflow on feature grid
style: Update hero subheadline copy for variant A
chore: Upgrade wrangler to v3.x
docs: Add A/B experiment results to README
```

**Rules:**
- Under 72 characters
- No period at the end
- Specific enough to understand without reading the description

## PR Description

Every PR description must include:

1. **Summary** — 1-3 sentences explaining what the change does and why
2. **Test evidence** — How the change was verified:
   - Visual changes: both variants checked at mobile and desktop widths
   - API changes: form submission tested end-to-end
   - Shared asset changes: both `/start` and `/build` verified
   - Worker changes: `npm run dev` tested locally

Include when relevant:

3. **Review focus** — Specific areas where human attention is most valuable
4. **Context** — Links to related issues, PRs, or experiment hypotheses

### Referencing

- Reference GitHub issues with `Closes #N` or `Relates to #N` in the description body
- Reference related PRs with `Depends on #N` or `See also #N`

```markdown
## Summary
Add optional survey form to the thank-you page. Collects what
visitors are building, what data sources they need, and their
current solution.

Closes #12

## Test evidence
- Both variants verified at 375px and 1440px widths
- Form submission tested: data appears in D1 survey_responses table
- Skipping the survey still works (thank-you page renders correctly)

## Review focus
- Survey question wording — do these questions get useful signal?
- Mobile layout of the multi-select checkboxes
```

## PR Sizing

Small, focused PRs. Each PR should represent one logical change.

**Guidelines:**
- Target: under 400 lines of meaningful diff (excluding lock files)
- If a PR exceeds 600 lines, it should be split
- A PR that mixes Worker logic changes with frontend HTML/CSS/JS changes should be split unless tightly coupled

**Splitting strategies:**
- Separate Worker logic changes (`src/`) from frontend changes (`pages/`)
- Separate variant-specific changes from shared asset changes
- Separate structural changes (new pages, new endpoints) from content changes (copy, styling)

## Stacking

When a feature requires multiple sequential PRs, stack them:

1. Each PR in the stack targets the previous PR's branch (not `main`)
2. Title includes the stack position: `feat: Add survey backend (1/2)`
3. First PR description includes the full stack outline
4. Merge from the bottom up

## Commits Within a PR

Each commit should be a coherent, self-contained step.

**Rules:**
- Commit messages follow the same `<type>: <summary>` format as PR titles
- No "WIP" or broken intermediate states
- Separate structural changes (new files, new endpoints) from content changes (copy, CSS)

## Draft PRs

Use draft PRs for:
- Work-in-progress that needs early feedback on approach
- PRs blocked on another PR in a stack
- Visual changes where direction needs validation before polish

Convert to ready-for-review when the PR meets all standards above.

## Review

Review depth scales with PR scope:

| PR Type | Minimum Review |
|---------|---------------|
| Copy-only edits (no structural changes) | `/pr-check` passing |
| CSS/JS changes, new sections, structural HTML | `/pr-check` + `/review-pr` + preview verification |
| Worker logic, API changes, schema changes | `/pr-check` + `/review-pr` + local testing |
| CI/CD or infrastructure changes | `/pr-check` + `/review-pr` + human review before merge |

For all PRs: tag @nbramia or @benjamcalvin for human review per the Team section in CLAUDE.md.

## Merge Criteria

A PR is ready to merge when:

1. `/pr-check` passes (no errors; warnings acceptable if justified)
2. `/review-pr` issues are addressed (for non-trivial PRs)
3. Preview URL verified at mobile + desktop widths (for PRs touching `pages/`)
4. **A human has explicitly approved the merge**

Never merge without item 4, regardless of how clean the PR is.

## Merge Process

1. Confirm all merge criteria are met
2. Merge with `gh pr merge --merge --delete-branch`
3. Monitor the production deploy in GitHub Actions
4. Verify the live site after deploy succeeds

---

## Related

### Skills
- `/pr-check [number]` — Validates a PR against these standards
- `/review-pr <number>` — Full adversarial review using specialist agents
- `/address-review <number>` — Address review feedback and re-request review

### Cross-references
- Development lifecycle → AGENTS.md § "Development Lifecycle"
- Merge policy → CLAUDE.md § "Merge Policy"
