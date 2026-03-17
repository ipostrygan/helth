# Commit

Stage and commit changes following the commitlint conventional commits format.

## Usage
```
/commit
/commit "optional hint about what changed"
```

---

## Your task

The user has invoked this command with the following arguments:

> $ARGUMENTS

Use the hint (if provided) to guide the commit message. Then execute all steps below sequentially.

---

## Step 1 — Inspect the working tree

Run these commands in parallel:
- `git status` — identify staged and unstaged changes
- `git diff` — see unstaged changes
- `git diff --staged` — see already-staged changes
- `git log --oneline -5` — check recent commit messages for style consistency

---

## Step 2 — Determine what to stage

Stage only files that are part of the current logical change. Prefer staging specific files by name over `git add -A` or `git add .` to avoid accidentally including unrelated files, secrets, or generated artifacts.

Do NOT stage:
- `.env*` files or anything that could contain secrets
- Lock files (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`) unless the user explicitly changed dependencies
- Build output or generated files (`.next/`, `dist/`, `out/`)

---

## Step 3 — Draft the commit message

Follow the **Conventional Commits** / commitlint format:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Type (required) — choose one:

| Type | When to use |
|------|-------------|
| `feat` | A new feature or capability |
| `fix` | A bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `style` | Formatting, whitespace, missing semicolons — no logic change |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `docs` | Documentation only changes |
| `build` | Changes to build system or dependencies (e.g. package.json) |
| `ci` | CI/CD configuration changes |
| `chore` | Other changes that don't affect src or test files |
| `revert` | Reverts a previous commit |

### Scope (optional but recommended)

Use the feature area, module, or directory name in lowercase kebab-case. Examples: `auth`, `medical-expenses`, `therapies`, `api`, `schema`, `ui`.

### Subject rules:
- Lowercase, no period at the end
- Imperative mood: "add feature" not "added feature" or "adds feature"
- Max 72 characters for the entire first line (`type(scope): subject`)
- Be specific and descriptive

### Body (optional):
- Add a blank line after the subject
- Explain **what** and **why**, not **how**
- Wrap at 72 characters

### Footer (optional):
- `BREAKING CHANGE: <description>` for breaking changes
- `Closes #123` for issue references

### Examples:
```
feat(therapies): add create and edit form with modal dialog

fix(api): handle missing profileId in therapy route

refactor(medical-expenses): extract reusable table component

chore(schema): add Therapy model and split seed scripts
```

---

## Step 4 — Commit

Create the commit using a HEREDOC to preserve formatting:

```bash
git commit -m "$(cat <<'EOF'
type(scope): subject

Optional body here.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

Always include the `Co-Authored-By` trailer.

---

## Step 5 — Confirm

Run `git status` and `git log --oneline -3` after the commit to confirm it was created successfully. Report:
- The commit hash and message
- Files included in the commit
- Any files left unstaged and why
