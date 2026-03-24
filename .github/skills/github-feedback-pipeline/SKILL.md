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

Set up a feedback pipeline for any project. The scope depends on whether this is a
personal project or a work project with a funded account.

## Personal vs Work — Choose Your Path

**Ask the user first**: "Is this a personal project or a work project with a funded
Anthropic/Azure subscription?"

### Personal projects (free path)
For personal GitHub accounts and side projects, **do NOT set up automated triage or
implementation workflows**. The API costs add up fast — in testing, 2 auto-implemented
issues cost ~$1.90 in Anthropic credits. That's not sustainable on a $5 balance.

**What to set up:**
1. Feedback button (so users can submit issues from the app)
2. Auto-label workflow (free — runs on GitHub Actions, no API key needed)
3. `CLAUDE.md` (so you have architecture docs for when you fix issues manually)

**How issues get resolved:**
- Developer reviews issues in GitHub or via `gh issue list`
- Implements fixes in VS Code using GitHub Copilot / Claude Code (included in Pro subscription)
- Pushes changes and closes the issue manually

Skip Steps 5, 7, and 8 below. Only do Steps 1–4 and 6.

### Work projects (automated path)
For work/team accounts with a funded Anthropic API subscription or Azure OpenAI deployment,
set up the full automated pipeline: triage + auto-implementation via PR.

**What to set up:** Everything — Steps 1–8.

**Cost reference** (from real-world testing):
- Triage only: ~$0.01–0.05 per issue (Anthropic API)
- Triage + implementation: ~$0.50–1.00 per issue
- A team processing 20 issues/month: ~$10–20/month
- With Azure OpenAI (GPT-4.1 nano): 5–10x cheaper

## How it works

### Personal path (manual implementation)
```
User submits feedback (in-app button)
        ↓
GitHub Issue created (with title prefix)
        ↓
Auto-label workflow fires (adds correct label from title)
        ↓
Developer reviews issues in VS Code
  → Uses GitHub Copilot / Claude Code to implement
  → Pushes and closes issue
```

### Work path (automated implementation)
```
User submits feedback (in-app button)
        ↓
GitHub Issue created (with title prefix)
        ↓
Claude Triage workflow fires:
  1. Auto-labels the issue from title emoji prefix
  2. Evaluates the issue against quality criteria
  ✅ Approved → adds "approved" label, explains reasoning
  ❌ Rejected → adds "rejected" label, explains why, closes issue
  ❓ Needs info → adds "needs-info" label, asks clarifying questions
        ↓
Claude Implement runs (only for "approved" issues)
  → Creates a PR with the fix/feature
  → PR triggers CI (build, tests)
  → Ready for human review + merge
```

**Important** (work path only): Auto-labeling and triage MUST be in the same workflow job.
GitHub Actions does not re-trigger workflows when labels are added by another
workflow using `GITHUB_TOKEN` (to prevent infinite loops). If auto-label is a
separate workflow, the triage workflow will never fire on newly opened issues.
The reference template handles this correctly — both steps are in one job.

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

### Step 5: Add the Claude triage + implement workflows (WORK PATH ONLY)

Skip this step for personal projects — it requires a funded Anthropic API key.

Read `references/workflow-claude-implement.yml` and copy it to `.github/workflows/claude-triage.yml`.
Read `references/workflow-implement.yml` and copy it to `.github/workflows/claude-implement.yml`.

These are two separate workflows connected by `repository_dispatch`:
1. **Triage** (`claude-triage.yml`) — auto-labels, evaluates the issue, adds approval label.
   If approved, fires a `repository_dispatch` event to trigger implementation.
2. **Implement** (`claude-implement.yml`) — runs Claude Code to create a PR.
   Also responds to `@claude` comments for manual triggering.

They must be separate because GitHub Actions does not re-trigger workflows when
labels or comments are added by `GITHUB_TOKEN` (anti-loop protection). The
`repository_dispatch` event bridges this gap.

### Step 6: Create GitHub labels

Run these commands (adjust colors as desired):

```bash
gh label create "approved" --description "Triaged and approved for implementation" --color 0E8A16 --force
gh label create "rejected" --description "Triaged and rejected — not actionable" --color D93F0B --force
gh label create "needs-info" --description "More information needed before triage" --color FBCA04 --force
gh label create "game-balance" --description "Game balance adjustment" --color FBCA04 --force
```

Also verify that `bug` and `enhancement` labels exist (they're GitHub defaults, but confirm).

### Step 7: Set up the ANTHROPIC_API_KEY secret (WORK PATH ONLY)

Skip this step for personal projects.

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

### Step 8: Verify the setup (WORK PATH ONLY)

Skip for personal projects — just verify the feedback button and auto-label work.

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

**Real-world data from amberRepublic testing:**
- 2 auto-triaged + auto-implemented issues consumed ~$1.90 in Anthropic API credits
- Triage alone: ~$0.01–0.05 per issue
- Implementation (Claude Code): ~$0.50–1.00 per issue (the expensive part)
- On a $5 personal budget, you get ~4–5 fully automated issues before running out

**This is why the personal/work split matters:**
- **Personal projects**: Use VS Code + GitHub Copilot (included in your Pro sub) to implement.
  The feedback button + auto-labeling are free. Only the AI triage + implementation costs money.
- **Work projects**: With a funded API subscription ($50+/mo) or Azure OpenAI deployment,
  the automation pays for itself in developer time savings.

**Azure OpenAI alternative** (much cheaper):
If you have an Azure subscription, deploy GPT-4.1 nano via Azure OpenAI. It's ~10x cheaper
than Anthropic API for triage tasks. The workflow templates support Azure OpenAI as a provider.

For personal projects where cost is a concern, the user can:
- Skip automated triage/implementation entirely (recommended)
- Remove the `issues: [opened, labeled]` trigger so Claude only runs on `@claude` mentions
- Use Azure OpenAI with GPT-4.1 nano for triage only (~$0.001 per issue), skip auto-implementation

## Concurrency

The workflow uses `concurrency: claude-implement-${{ github.event.issue.number }}` to prevent
multiple runs from conflicting on the same issue, while allowing different issues to be
processed in parallel.
