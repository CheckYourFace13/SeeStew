# Daily Story Publishing — SeeStew

SeeStew automatically generates and publishes one new 1500+ word factual U.S. history story every day via **GitHub Actions**. No manual labor required.

---

## How It Works

1. A GitHub Actions cron workflow runs daily at **10:00 UTC** (5:00 AM Eastern).
2. It checks out the repo, runs `node scripts/generate-daily-story.mjs`.
3. The script calls **OpenRouter** (DeepSeek by default) to generate a new story.
4. It validates the story: 1500+ words, 4+ references (2+ credible .gov/.edu), inline citations, ## Sources section.
5. It searches the **Library of Congress** for a matching public-domain image. If none found, it generates an `imagePrompt`.
6. It saves the article JSON to `content/articles/<slug>.json`.
7. The workflow commits and pushes the new file automatically.
8. **Hostinger auto-deploys** from the `main` branch (if GitHub deploy is connected), or you manually trigger a redeploy in hPanel.

---

## Required GitHub Secrets

Set these in your repo → Settings → Secrets and variables → Actions:

| Secret | Value | Required |
|--------|-------|----------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key | **Yes** |
| `OPENROUTER_MODEL` | AI model (default: `openai/gpt-4o-mini`) | Recommended |

**Recommended model**: `openai/gpt-4o-mini` — reliable, fast, and affordable.

The workflow uses the built-in `GITHUB_TOKEN` for committing — no PAT needed.

### Model Fallback

If the primary model fails (provider error, out of credits, unavailable), the script automatically tries fallback models in order:

1. `openai/gpt-4o-mini`
2. `google/gemini-2.0-flash-001`
3. `anthropic/claude-3.5-haiku`

### If the Action Fails with "Provider returned error"

1. Check OpenRouter credits: https://openrouter.ai/credits
2. Verify model availability: https://openrouter.ai/models
3. Ensure your API key has billing enabled
4. Try setting `OPENROUTER_MODEL` to a different model in GitHub secrets

---

## Required Hostinger Env Vars

These go in hPanel → Node.js Web App → Environment Variables:

| Variable | Purpose |
|----------|---------|
| `YOUTUBE_CHANNEL_ID` | YouTube data fetching |
| `YOUTUBE_API_KEY` | YouTube data fetching |
| `OPENROUTER_API_KEY` | Runtime pipeline (API route fallback) |
| `OPENROUTER_MODEL` | AI model selection |
| `CRON_SECRET` | Protects `/api/cron/publish` endpoint |
| `PIPELINE_MAX_STORIES` | Stories per API run (default: 1) |
| `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` | AdSense |
| `NEXT_PUBLIC_ADSENSE_ENABLED` | AdSense toggle |

---

## How to Confirm Yesterday's Story Published

1. Check the Actions tab: [github.com/YOUR_USER/SeeStew/actions](https://github.com)
   - The "Daily Story Generator" workflow should show a green check.
2. Look in `content/articles/` for a new `.json` file with today's date in `createdAt`.
3. After Hostinger redeploys, visit `https://seestew.com/articles` — the new story should appear.

---

## What Happens If Validation Fails

- The script retries up to **3 times** with slightly increased temperature.
- If all 3 attempts fail validation, the script exits with code 1.
- The GitHub Action reports a failed run (visible in Actions tab).
- No bad content is saved or committed.
- You'll see the failure reason in the Action logs.
- The next day's run will try again with a fresh topic.

---

## How Duplicates Are Avoided

1. The script reads all existing `content/articles/*.json` files.
2. It passes all existing titles to the AI prompt as "already published — do NOT repeat".
3. It checks the generated slug against all existing slugs before saving.
4. If a duplicate slug is generated, the script exits with an error (no commit).

---

## Running Locally

```bash
# Set env vars
export OPENROUTER_API_KEY="sk-or-..."
export OPENROUTER_MODEL="deepseek/deepseek-chat"  # optional

# Run
npm run publish:story
```

Expected output:
```
=== SeeStew Daily Story Generator ===

Existing articles: 15
Model: deepseek/deepseek-chat

Attempt 1/3...

Story: "The Time Congress Accidentally Created a Secret War"
Slug: the-time-congress-accidentally-created-a-secret-war
Words: 1823
References: 5

Searching for archive image...
Image: LOC archive

Saved: /path/to/content/articles/the-time-congress-accidentally...json

Done! Story is ready for commit.
```

---

## Manual Trigger

You can trigger the workflow anytime from the GitHub Actions tab:
1. Go to Actions → "Daily Story Generator"
2. Click "Run workflow" → select branch → "Run workflow"

---

## Why Not Hostinger Web Cron?

The Hostinger cron hits `/api/cron/publish` via HTTP, but:
- nginx proxy timeout is ~30-60 seconds
- Story generation with OpenRouter takes 30-70 seconds
- This causes **504 Gateway Timeout**

The GitHub Actions approach avoids this entirely — it runs the script directly with no HTTP timeout.

The `/api/cron/publish` API route still exists as a fallback for environments with longer timeouts, but **GitHub Actions is the primary daily automation**.

---

## Deployment Flow

```
GitHub Actions (daily)
  → generates story JSON
  → commits to main branch
  → pushes to GitHub

Hostinger (auto-deploy from GitHub)
  → detects new commit on main
  → runs npm install && npm run build && npm start
  → new story appears at /articles and /articles/[slug]
```

Stories committed to Git survive all redeploys permanently.
