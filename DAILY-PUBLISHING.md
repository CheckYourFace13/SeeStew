# Daily Story Publishing — SeeStew

SeeStew publishes one new 1500+ word factual U.S. history story daily via **GitHub Actions**, using a **curated topic/source queue**.

**Architecture:** The model returns **Markdown body text only**. Node.js builds the final article JSON (title, slug, excerpt, references, image) — the model never outputs JSON or controls URLs.

---

## How It Works

1. GitHub Actions runs daily at **10:00 UTC** (5:00 AM Eastern).
2. `npm run validate:queue` checks the queue file.
3. `node scripts/generate-daily-story.mjs` picks the **first pending** topic from `content/story-queue.json`.
4. Script sets metadata from the queue item (title, slug, excerpt, category).
5. OpenRouter writes **Markdown only** (1800–2200 words, inline `[1]` citations, `## Sources`).
6. Script injects curated `references` from the queue and rebuilds `## Sources`.
7. If under 1500 words → **expansion** call (Markdown only).
8. If fewer than 4 citation markers → **citation repair** call (Markdown only).
9. Validates word count, citations (in body only), and curated references.
10. LOC image search via `imageSearchTerms`; otherwise `imagePrompt`.
11. Saves `content/articles/<slug>.json` (clean JSON from Node) and marks queue item `published`.
12. Commits article + `content/story-queue.json`.
13. Hostinger auto-deploys from `main`.

---

## Story Queue (`content/story-queue.json`)

Each item includes:

| Field | Purpose |
|-------|---------|
| `id` | Slug / unique id |
| `title`, `hook`, `category`, `angle`, `keywords` | Editorial brief |
| `requiredSources` | 4–6 credible HTTPS sources (fixed) |
| `imageSearchTerms` | LOC search query |
| `status` | `pending` / `published` / `skipped` |
| `publishedSlug`, `publishedAt` | Set after publish |

**32 topics** are seeded (Black Sox, Teapot Dome, Bonus Army, Tulsa, MOVE, Ludlow, Wilmington coup, Lake Peigneur, Titan II, Tuskegee, Osage murders, Love Canal, Bath School, etc.).

Add more items to the queue file anytime. Run `npm run init:queue` to merge new seed topics into an existing file.

---

## Required GitHub Secrets

| Secret | Value | Required |
|--------|-------|----------|
| `OPENROUTER_API_KEY` | OpenRouter API key | **Yes** |
| `OPENROUTER_MODEL` | `openai/gpt-4o-mini` (recommended) | Recommended |

Fallback model in script: `anthropic/claude-3.5-haiku` (Gemini not used for daily JSON).

---

## Troubleshooting

### Malformed JSON / truncated output

- **Fixed:** Model no longer returns JSON. Markdown-only generation avoids `Unterminated string` errors.

### Model too short / 0 citations

- Sources always come from the queue (script-built `references` array).
- Expansion call if body is under 1500 words.
- Citation repair call if fewer than 4 unique `[n]` markers in the body.
- Set `OPENROUTER_MODEL=openai/gpt-4o-mini`.

### Insufficient credible sources

- Queue items are validated with `npm run validate:queue` (2+ credible domains per item).
- Fix sources in `content/story-queue.json`, not in the model prompt.

### OpenRouter credits

- https://openrouter.ai/credits

### No story created (Action fails at commit)

- All pending topics may already have matching article files.
- Queue empty or validation failed — read Action logs for the exact error.

---

## Local Commands

```bash
export OPENROUTER_API_KEY="sk-or-..."
export OPENROUTER_MODEL="openai/gpt-4o-mini"

npm run validate:queue      # check queue sources
npm run publish:story       # generate next pending story
npm run validate:articles   # check all saved articles
npm run init:queue          # merge seed topics into queue file
```

---

## Hostinger Env Vars

Same as before: `YOUTUBE_*`, `OPENROUTER_*`, `CRON_SECRET`, `PIPELINE_MAX_STORIES=1`, AdSense vars. Daily automation is **GitHub Actions**, not Hostinger cron.

---

## Deployment

```
GitHub Actions → story + images → push main → Hostinger auto-deploy
Deploy workflow → validate build → optional Hostinger webhook
```

Every push to `main` should deploy automatically. See `README.md` and `HOSTINGER.md` for webhook setup.

Stories in Git survive all redeploys.
