---
name: github-feedback-pipeline
description: >-
  Set up a complete feedback-to-code pipeline for any project: in-app feedback button
  that creates GitHub issues, auto-labeling workflow, Claude AI triage that evaluates
  and approves/rejects issues, and auto-implementation via PR. Use this skill when
  the user wants to add a feedback form, user feedback system, issue-to-code pipeline,
  Claude auto-fix workflow, GitHub issue automation, or any variation of "let users
  submit feedback that gets automatically triaged and implemented." Also trigger when
  the user says "add feedback button", "set up auto-fix", "automate issue resolution",
  "Claude workflow for GitHub issues", or wants to replicate the amberRepublic feedback
  pipeline on another project. DO NOT trigger for general GitHub Actions questions,
  manual issue management, or CI/CD pipelines that don't involve feedback/triage.
---

# GitHub Feedback Pipeline

Set up a complete feedback → GitHub issues → Claude triage → auto-implementation pipeline
for any project. This skill handles the full setup: feedback UI component, auto-labeling,
AI-powered issue triage (approve/reject/needs-info), and automatic PR creation for
approved issues.

## How it works

```
User submits feedback (in-app button)
        ↓
GitHub Issue created (with title prefix + labels)
        ↓
Auto-label workflow fires (ensures correct labels from title)
        ↓
Claude Triage runs — evaluates the issue:
  ✅ Approved → adds "approved" label, explains reasoning
  ❌ Rejected → adds "rejected" label, explains why
  ❓ Needs info → adds "needs-info" label, asks clarifying questions
        ↓
Claude Implement runs (only for "approved" issues)
  → Creates a PR with the fix/feature
  → PR triggers CI (build, tests)
  → Ready for human review + merge
```

## Setup Workflow

Follow these steps in order. Read each reference file as needed — don't load them all upfront.

### Step 1: Detect the project

Before doing anything, understand the project:

1. Read the project's `package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`, or equivalent to identify the stack
2. Check if it's a web app (React, Vue, Svelte, vanilla HTML) or a CLI/library/backend
3. Look for an existing `CLAUDE.md` or `.github/` directory
4. Identify the GitHub remote: `git remote -v` to get `OWNER/REPO`
5. Check the default branch name: `git branch --show-current` or `git symbolic-ref refs/remotes/origin/HEAD`

Store these facts — you'll use them in every subsequent step.

### Step 2: Add the feedback component

**For web apps (React/TypeScript):**
Read `references/feedback-button-react.tsx` and adapt it:
- Replace `REPO_OWNER` and `REPO_NAME` with the actual values
- Adjust the feedback categories to match the project (e.g., a dashboard might use "Bug Report" / "Feature Request" / "Data Issue" instead of "Bug Report" / "Feature Idea" / "Balance Issue")
- Match the project's existing styling approach (Tailwind, CSS modules, styled-components, etc.)
- Place the component where it makes sense in the app's layout

**For web apps (vanilla HTML/JS):**
Read `references/feedback-button-html.html` and adapt it:
- Replace the repo owner/name placeholders
- Adjust categories
- Add to the project's main HTML file or create a standalone widget

**For non-web projects (CLI, library, backend):**
Skip the feedback component. Instead, tell the user:
> "This project doesn't have a UI for a feedback button. Users can submit feedback
> directly as GitHub issues. The auto-label and triage workflows will still work
> for any issues created manually or via GitHub's issue templates."

Optionally, create a `.github/ISSUE_TEMPLATE/` with templates matching the feedback categories.

### Step 3: Create CLAUDE.md

Read `references/claude-instructions-template.md` for the template structure.

Generate a project-specific `CLAUDE.md` at the repo root by analyzing:
- The directory structure (`find . -type f -name '*.ts' -o -name '*.py' ...` or equivalent)
- Key files (entry points, config files, READMEs)
- Build/test commands from package.json scripts, Makefile, etc.
- Architecture patterns visible in the code

The CLAUDE.md should tell an AI agent everything it needs to implement changes correctly:
- Project overview (1-2 sentences)
- Architecture (key directories and what they contain)
- Key rules (coding conventions, patterns to follow)
- How to build and test
- Style/theme info (if it's a UI project)

If a CLAUDE.md already exists, review it and update if needed rather than replacing it.

### Step 4: Add the auto-label workflow

Read `references/workflow-auto-label.yml` and copy it to `.github/workflows/auto-label-issues.yml`.

Adjust the emoji-to-label mapping if you changed the feedback categories in Step 2.

### Step 5: Add the Claude triage + implement workflow

Read `references/workflow-claude-implement.yml` and copy it to `.github/workflows/claude-implement.yml`.

Customize the `prompt` field to reference the project's `CLAUDE.md` and include project-specific context.

The workflow contains two jobs:
1. **triage** — evaluates the issue against quality criteria, posts a comment, adds a label
2. **implement** — only runs for `approved` issues, creates a PR

### Step 6: Create GitHub labels

Run these commands (adjust colors as desired):

```bash
gh label create "approved" --description "Triaged and approved for implementation" --color 0E8A16 --force
gh label create "rejected" --description "Triaged and rejected — not actionable" --color D93F0B --force
gh label create "needs-info" --description "More information needed before triage" --color FBCA04 --force
gh label create "game-balance" --description "Game balance adjustment" --color FBCA04 --force
```

Also verify that `bug` and `enhancement` labels exist (they're GitHub defaults, but confirm).

### Step 7: Set up the ANTHROPIC_API_KEY secret

Tell the user:

> To enable Claude auto-triage and auto-implementation, you need to add your Anthropic
> API key as a GitHub secret:
>
> 1. Go to https://github.com/OWNER/REPO/settings/secrets/actions
> 2. Click "New repository secret"
> 3. Name: `ANTHROPIC_API_KEY`
> 4. Value: your Anthropic API key from https://console.anthropic.com/settings/keys
> 5. Click "Add secret"
>
> Or use the CLI: `gh secret set ANTHROPIC_API_KEY`

Check if the secret already exists: `gh secret list` — if `ANTHROPIC_API_KEY` is present, skip this step.

### Step 8: Verify the setup

1. Commit and push all new files
2. Create a test issue to verify the pipeline:
   ```bash
   gh issue create --title "[💡 Feature Idea] Test issue — verify feedback pipeline" \
     --body "This is a test issue to verify the feedback pipeline is working. Please triage and close." \
     --repo OWNER/REPO
   ```
3. Check that the auto-label workflow fires: `gh run list --limit 3`
4. Check that the triage workflow fires and posts a comment
5. If everything works, close the test issue

### Step 9 (Optional): Telegram notifications

If the user has the `telegram-notify` skill available, mention that they can get notified
when Claude triages or implements an issue. This is an add-on — not part of the core setup.

## Cost Considerations

Each triage evaluation costs roughly ~$0.01-0.05 in API usage (small prompt, quick assessment).
Each implementation costs more (~$0.10-1.00 depending on complexity).

The triage step saves money by preventing expensive implementation runs on bad/spam issues.
The user's Anthropic plan limits serve as the cost ceiling — no additional enforcement is needed
in the workflow. If cost is a concern, the user can:
- Remove the `issues: [opened, labeled]` trigger so Claude only runs on `@claude` mentions
- Add a `max_turns` limit in the claude-code-action config
- Use a cheaper model for triage via the `model` parameter

## Concurrency

The workflow uses `concurrency: claude-implement-${{ github.event.issue.number }}` to prevent
multiple runs from conflicting on the same issue, while allowing different issues to be
processed in parallel.
