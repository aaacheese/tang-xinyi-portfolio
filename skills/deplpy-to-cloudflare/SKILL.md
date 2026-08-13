---
name: static-deploy-to-cloudflare
description: Complete workflow for deploying static HTML/CSS/JS projects to Cloudflare Pages with GitHub as source control. Covers project analysis, production build with minification and asset organization, GitHub repo creation and push, wrangler-based Cloudflare Pages deployment, and custom domain binding. Trigger phrases: 部署, 上线, 发布网站, deploy to cloudflare pages, 绑定域名.
agent_created: true
---

# Static Deploy to Cloudflare

## Overview

End-to-end workflow for taking a static web project from local files to a live
URL on Cloudflare Pages, with GitHub as the canonical source. The workflow
handles: project analysis → privacy scan → production build → GitHub push
→ Cloudflare deploy → custom domain binding.

## Workflow Decision Tree

```
User asks to deploy a static project
  │
  ├─ Step 0: Analyze — is this static-only, or does it need a backend?
  │     Read HTML/JS files, check for API calls, form actions, SSR deps.
  │     If backend required → tell the user and stop.
  │
  └─ Static confirmed → proceed
        │
        ├─ Step 0.5: Privacy Scan (READ-ONLY)
        │     Scan HTML text for API keys, passwords, tokens, bank info,
        │     real names, phone models, and other PII.
        │     Scan images for visible sensitive content (blurred card
        │     numbers, account names, email addresses, usage data).
        │     Report findings by risk level. Require user confirmation
        │     before proceeding. If high-risk items found → pause.
        │
        ├─ Step 1: Production Build
        │     Create dist/, organize assets, minify HTML/CSS/JS.
        │     Use scripts/build_html.py as a reference template.
        │
        ├─ Step 2: GitHub
        │     Init git, create repo (gh), commit & push.
        │     Include .gitignore (node_modules/, .wrangler/, dist/ optional).
        │
        ├─ Step 3: Cloudflare Pages Deploy
        │     Install wrangler if missing, deploy dist/.
        │
        └─ Step 4: Custom Domain (optional)
              Bind via Cloudflare API, guide user on DNS CNAME record.
```

## Step 0: Project Analysis (READ-ONLY)

Before touching any files, determine whether the project can be deployed as a
static site. Read the main HTML file(s) and check for:

| Signal | Static OK? |
|--------|-----------|
| No `<script>` fetching external APIs | ✅ |
| No `<form action="...">` posting to servers | ✅ |
| No PHP/Node/Python server-side code | ✅ |
| No `package.json` with SSR framework (Next.js, Nuxt, etc.) | ✅ |
| References to local images/assets via relative paths | ✅ (needs path fix in build) |
| References to external CDN (CSS/JS/fonts) | ✅ (no action needed) |
| Contains inline `<style>` only | ✅ |
| Pure `.html` file with embedded styles | ✅ |

**Report findings to the user before proceeding.** If the project is NOT static,
explain why and stop.

## Step 0.5: Privacy Scan (READ-ONLY — mandatory before any push/deploy)

Before any code leaves the local machine, scan all project files for
privacy risks. **This step must complete with user sign-off before Step 1.**

### 0.5.1 Code scan (text files)

Read every `.html`, `.js`, `.css`, `.py`, `.md`, `.json`, `.env`, and config
file in the project. Search for:

| Category | Pattern / Signal | Risk |
|----------|-----------------|------|
| API Keys / Tokens | `api_key`, `secret`, `token`, `Bearer`, `ghp_`, `sk-`, `pk_` | 🔴 HIGH |
| Passwords | `password=`, `passwd`, `pwd=` | 🔴 HIGH |
| Email addresses | `xxx@xxx.xxx` pattern (except noreply/example) | 🔴 HIGH |
| Bank / card info | Bank names + card types, partial card numbers | 🟡 MEDIUM |
| Real names | Full names that appear to be real identities | 🟡 MEDIUM |
| Personal device | Specific phone models, device serials | 🟡 MEDIUM |
| Internal paths | Hardcoded local filesystem paths (e.g. `E:\Code\...`) | 🟢 LOW |
| Account usernames | GitHub handles, Cloudflare emails in code | 🟢 LOW |

### 0.5.2 Image scan (screenshots)

Read every `.png`, `.jpg`, `.jpeg` image in the project. Check for:

| Signal | Risk |
|--------|------|
| Unblurred credit card numbers | 🔴 HIGH |
| Unblurred email / account names | 🔴 HIGH |
| Partially blurred but potentially recoverable info | 🟡 MEDIUM |
| Visible account usage statistics | 🟢 LOW |
| Visible subscription tier / billing info | 🟢 LOW |
| Button text / UI showing login state | 🟢 LOW |

### 0.5.3 Report format

Present findings in a structured table grouped by risk level:

```
## 🔒 Privacy Scan Results

### 🔴 High Risk (must fix before deploy)
- file:line → what was found

### 🟡 Medium Risk (recommend fixing)
- file:line → what was found

### 🟢 Low Risk (known, no action needed)
- file:line → what was found

### ✅ Good Practices
- (items already handled properly)
```

### 0.5.4 User confirmation

After reporting, present actionable options (e.g. "replace bank card name with
generic description", "re-blur screenshot areas") and wait for explicit
confirmation. **Do not proceed to Step 1 until the user confirms.**

If all clear (no 🔴 or 🟡 items): auto-proceed with a brief summary note.

## Step 1: Production Build

For pure static HTML projects (no framework, no build tool):

### 1.1 Scan existing assets

List all image files at the project root. Compare against `<img src="...">`
references in the HTML to identify the expected directory structure.

### 1.2 Create dist/ structure

Create `dist/` and any required subdirectories (e.g., `dist/images/docx_media/`)
to match the HTML's relative paths.

### 1.3 Copy assets

Copy all referenced image files into their expected locations under `dist/`.

### 1.4 Minify HTML

Use Python's `minify-html` package to compress the HTML (inline CSS + markup).
Install it in an isolated venv:

```bash
python -m venv /path/to/venv
/path/to/venv/bin/pip install minify-html
```

Key minification parameters:
- `minify_css=True` — compress inline styles
- `minify_js=True` — compress any inline scripts
- `keep_closing_tags=True` — preserve valid HTML structure
- `allow_removing_spaces_between_attributes=True` — reduce file size

Reference implementation: `scripts/build_html.py`.

### 1.5 Verify output

After building, verify:
- `dist/index.html` exists
- Every `<img src="...">` path resolves to an actual file under `dist/`
- Report original vs minified file size

### 1.6 Report

Show the user a summary table: file count, byte sizes, compression ratio,
any missing assets.

## Step 2: GitHub Repository

### 2.1 Check auth

Run `gh auth status`. If not authenticated, guide the user to connect GitHub
via WorkBuddy's Connector panel.

### 2.2 Init and configure

```bash
cd <project-dir>
git init
git branch -m main
git config user.email "<github-username>@users.noreply.github.com"
git config user.name "<github-username>"
```

### 2.3 Create .gitignore

```
node_modules/
.wrangler/
__pycache__/
*.pyc
.workbuddy/
```

### 2.4 Commit and push

```bash
git add -A
git commit -m "Initial commit"
gh repo create <repo-name> --private --source=. --remote=origin --push
```

Ask the user: repo name and visibility (public/private).

## Step 3: Cloudflare Pages Deploy

### 3.1 Install wrangler

In the project directory, install wrangler as a dev dependency:

```bash
npm install wrangler --save-dev
```

> On Windows, use the system Node.js (`C:/Program Files/nodejs/npm.cmd`)
> since the managed Node's `.bin/wrangler` is a bash script that won't run.

### 3.2 Verify auth

```bash
npx wrangler whoami
```

Should show the Cloudflare account email and account ID. If not authenticated,
guide the user through `npx wrangler login` (opens browser).

### 3.3 Create Pages project

```bash
npx wrangler pages project create <project-name> --production-branch=main
```

### 3.4 Deploy

```bash
npx wrangler pages deploy dist --project-name=<project-name>
```

This uploads all files in `dist/` and returns:
- A deployment-specific URL (e.g., `https://<hash>.<project>.pages.dev`)
- The canonical project URL (e.g., `https://<project>.pages.dev`)

Both URLs are immediately live.

### 3.5 Update .gitignore

Add `.wrangler/` to `.gitignore` (it contains account-specific config).
Commit `package.json` and `package-lock.json` so the project is reproducible.

## Step 4: Custom Domain (Optional)

### 4.1 Bind domain via API

The wrangler CLI does not support domain management directly. Use the
Cloudflare API:

```
POST https://api.cloudflare.com/client/v4/accounts/<account-id>/pages/projects/<project-name>/domains
Authorization: Bearer <oauth-token>
Content-Type: application/json
{"name": "<custom-domain>"}
```

Get the OAuth token from `~/.wrangler/config/default.toml` (`oauth_token` field)
and the account ID from `npx wrangler whoami` output.

### 4.2 DNS configuration

After binding, the domain status will show `pending`. If the domain's DNS is
managed by Cloudflare (same account), Cloudflare Pages auto-configures the
CNAME. Otherwise, instruct the user to add:

| Type  | Name    | Target                        |
|-------|---------|-------------------------------|
| CNAME | <sub>   | <project>.pages.dev           |

### 4.3 Verify

Wait ~30 seconds, then re-check:

```bash
npx wrangler pages project list
```

The custom domain should appear in the "Project Domains" column. Test
access via `https://<custom-domain>`.

## Bundled Scripts

### scripts/build_html.py

A Python build script template for single-page static HTML projects.
Customizable for different project structures. Installs `minify-html` in
an isolated venv, creates `dist/`, copies assets, minifies HTML, and
verifies output completeness.

Usage:
```bash
python scripts/build_html.py
```

Edit the `ROOT`, `DIST`, and `HTML_FILE` variables at the top of the script
to match the actual project layout.

## Common Pitfalls

1. **Privacy leaks before deploy**: HTML often contains real bank card names,
   phone models, or personal details in comments/descriptions. Screenshots may
   show account info even when partially blurred. Always run Step 0.5 before
   pushing to GitHub or deploying — once data is on a public URL, it cannot be
   taken back.

2. **Image path mismatch**: The HTML may reference `images/foo.png` but the
   actual files are at the project root. Always scan both the HTML `src`
   attributes and the actual file layout, then create the correct directory
   structure in `dist/`.

2. **Quoted vs unquoted attributes after minification**: `minify-html` may
   strip quotes from attribute values. When verifying img references,
   use a regex that handles both: `src=["']?([^"'\s>]+)`.

3. **Git push failure**: If `git push` fails (connection reset), the local
   commit is still safe. Retry `git push` later. The Cloudflare deploy
   step works independently.

4. **Windows wrangler**: The `.bin/wrangler` under managed Node is a bash
   script. Use `npx wrangler` with the system Node.js instead.

5. **OAuth token scope**: The wrangler OAuth token may not have DNS write
   permissions. For custom domain DNS records, the user may need to add
   the CNAME manually via the Cloudflare dashboard.
