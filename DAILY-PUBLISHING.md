# Daily Story Publishing — SeeStew

SeeStew publishes one new 1500+ word factual U.S. history story daily via **GitHub Actions**, using a **curated topic/source queue**. The model writes the article; **sources are fixed in the queue** — the model cannot invent URLs.

---

## How It Works

1. GitHub Actions runs daily at **10:00 UTC** (5:00 AM Eastern).
2. `npm run validate:queue` checks the queue file.
3. `node scripts/generate-daily-story.mjs` picks the **first pending** topic from `content/story-queue.json`.
4. OpenRouter writes the article using **only** the queue item’s `requiredSources` (4–6 HTTPS URLs).
5. The script **replaces** any model references with the curated list and rebuilds `## Sources`.
6. If under 1500 words, an **expansion call** targets 1800–2200 words (same sources).
7. Validates word count, citations, and curated URLs.
8. LOC image search uses `imageSearchTerms`; otherwise saves `imagePrompt`.
9. Saves `content/articles/<slug>.json` and marks the queue item `published`.
10. Commits **both** the article and `content/story-queue.json`.
11. Hostinger auto-deploys from `main`.

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

### Malformed JSON

- Script strips fences, extracts `{…}`, removes control characters.
- Expansion/retry uses `response_format: { type: "json_object" }`.
- Set `OPENROUTER_MODEL=openai/gpt-4o-mini`.

### Model too short / 0 references

- Sources come from the queue — **not** from the model.
- `enforceCuratedReferences()` always injects the curated list before validation.
- Expansion call runs if draft is under 1500 words.

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
GitHub Actions → article JSON + story-queue.json → push main → Hostinger deploy
```

Stories in Git survive all redeploys.
