# Daily Story Publishing — SeeStew

SeeStew automatically generates and publishes one new 1500+ word factual U.S. history story every day via **GitHub Actions**. No manual labor required.

---

## How It Works

1. A GitHub Actions cron workflow runs daily at **10:00 UTC** (5:00 AM Eastern).
2. It checks out the repo and runs `node scripts/generate-daily-story.mjs`.
3. The script calls **OpenRouter** with `response_format: { type: "json_object" }` for structured output.
4. It validates: 1500+ words, 4+ references (2+ credible .gov/.edu), inline citations, `## Sources` section.
5. It searches the **Library of Congress** for a public-domain image (or saves `imagePrompt`).
6. It saves `content/articles/<slug>.json` only if validation passes.
7. The workflow commits and pushes the new file.
8. **Hostinger auto-deploys** from `main`.

---

## Required GitHub Secrets

| Secret | Value | Required |
|--------|-------|----------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key | **Yes** |
| `OPENROUTER_MODEL` | Recommended: `openai/gpt-4o-mini` | Recommended |

The workflow uses the built-in `GITHUB_TOKEN` for commits — no PAT needed.

### Model Fallback Order

If the primary model fails, the script tries (in order):

1. `openai/gpt-4o-mini`
2. `anthropic/claude-3.5-haiku`
3. `google/gemini-2.0-flash-001` (last — can produce invalid JSON)

Each model gets up to **2 attempts** (JSON repair or validation retry before switching).

---

## Troubleshooting Failed Actions

### Malformed JSON (`Unterminated string`, `Bad control character`)

- **Cause**: Model returned truncated or invalid JSON (often from output length limits or Gemini).
- **Fix**: Set `OPENROUTER_MODEL=openai/gpt-4o-mini` in GitHub secrets.
- The script now strips fences, extracts `{…}`, removes control characters, and can run a JSON repair pass.

### Model too short (`Content is 848 words`)

- **Cause**: Model stopped early or truncated inside the JSON string.
- **Fix**: Script targets **1800+ words** in the prompt; retries with explicit failure reasons. Ensure OpenRouter credits allow full `max_tokens` (16384).

### Insufficient references (`Only 0 references`)

- **Cause**: Truncated JSON before the `references` array, or model ignored schema.
- **Fix**: Retry uses validation errors in the prompt. Do not save partial stories.

### Provider / credits error

1. https://openrouter.ai/credits — add billing/credits
2. https://openrouter.ai/models — confirm model availability
3. Verify `OPENROUTER_API_KEY` in GitHub Actions secrets

### Validate existing articles locally

```bash
npm run validate:articles
```

Prints per-article: slug, word count, reference count, citation count, pass/fail.

---

## Required Hostinger Env Vars

| Variable | Purpose |
|----------|---------|
| `YOUTUBE_CHANNEL_ID` | YouTube data |
| `YOUTUBE_API_KEY` | YouTube data |
| `OPENROUTER_API_KEY` | Runtime API route fallback |
| `OPENROUTER_MODEL` | `openai/gpt-4o-mini` recommended |
| `CRON_SECRET` | Protects `/api/cron/publish` |
| `PIPELINE_MAX_STORIES` | `1` for daily automation |
| `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` | AdSense |
| `NEXT_PUBLIC_ADSENSE_ENABLED` | AdSense |

---

## How to Confirm Yesterday's Story Published

1. GitHub → Actions → "Daily Story Generator" → green check
2. New file in `content/articles/` with recent `createdAt`
3. After Hostinger deploy: https://seestew.com/articles

---

## What Happens If Validation Fails

- Up to **2 attempts per model** across **3 models** (6 total attempts max).
- JSON parse failure → repair pass or stricter JSON-only retry.
- Validation failure → retry with explicit error list (word count, refs, citations).
- **No bad JSON is committed** — workflow fails and exits 1.
- Next scheduled run tries a new topic.

---

## How Duplicates Are Avoided

1. All existing titles passed to the model as "do NOT repeat".
2. Slug checked before save.
3. Duplicate slug → exit 1, no commit.

---

## Running Locally

```bash
export OPENROUTER_API_KEY="sk-or-..."
export OPENROUTER_MODEL="openai/gpt-4o-mini"

npm run publish:story
npm run validate:articles
```

---

## Manual Trigger

Actions → "Daily Story Generator" → "Run workflow"

---

## Why Not Hostinger Web Cron?

Hostinger nginx times out (~30–60s) while AI generation takes longer → **504 Gateway Timeout**. GitHub Actions runs the script directly with no HTTP limit.

---

## Deployment Flow

```
GitHub Actions (daily)
  → generate + validate story JSON
  → commit to main
  → push

Hostinger (auto-deploy)
  → npm run build && npm start
  → story live at /articles/[slug]
```

Stories in Git survive all redeploys.
