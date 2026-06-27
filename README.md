# SeeStew.com

American history site: YouTube documentaries, shorts, sourced articles, AdSense-ready.

## Story pipeline (OpenRouter)

Articles are written via [OpenRouter](https://openrouter.ai) using **deepseek/deepseek-chat** by default (cheap, strong for long prose).

Each story must include **5+ cited references** with real URLs. The pipeline also:

1. Publishes companion articles for new **long-form YouTube** uploads
2. Publishes **obscure US history** stories from an auto-refilled topic queue

```bash
# Add to .env.local
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=deepseek/deepseek-chat   # optional override
PIPELINE_MAX_STORIES=2
CRON_SECRET=...

# Run once locally
npm run pipeline
```

On Vercel, cron hits `/api/cron/publish` twice daily (`vercel.json`).

After pipeline runs, **rebuild/redeploy** so new `content/articles/*.json` files are baked into the site.

## SEO / GEO / AEO

- `sitemap.xml`, `robots.txt`, canonical URLs, `en-US` + US geo meta
- JSON-LD: Organization, WebSite, FAQPage, Article, VideoObject, BreadcrumbList, ItemList
- `/feed.xml` RSS for articles
- `/llms.txt` for answer engines
- `/topics` category hub pages
- Article **Sources** blocks + schema `citation`
- `manifest.webmanifest`, security.txt

## Auto-deploy (Hostinger + GitHub)

**Every push to `main` deploys to seestew.com.** You do not need to deploy manually.

```
git push origin main  →  Hostinger Git pull + npm install + npm run build + npm start
```

### One-time setup (already done if the site updates after push)

1. **hPanel** → **Websites** → seestew.com → **Git** (or Node.js app → Git)
2. Connect repo `CheckYourFace13/SeeStew`, branch **`main`**
3. Build: `npm install && npm run build` · Start: `npm start` · Node **20**
4. Enable **Auto deployment**
5. Copy the **Webhook URL** → GitHub repo → **Settings → Webhooks → Add webhook**
   - Payload URL: paste Hostinger URL
   - Content type: `application/x-www-form-urlencoded`
   - Events: **Just the push event**

Optional: add the same webhook URL as GitHub Actions secret **`HOSTINGER_WEBHOOK_URL`** so the Deploy workflow can re-trigger Hostinger after CI passes.

### GitHub Actions

| Workflow | When | What |
|----------|------|------|
| **Deploy** | Every push to `main` | Validates build, then triggers Hostinger webhook (if secret set) |
| **Daily Story Generator** | Daily 10:00 UTC | Writes story + image → commits → push → auto-deploy |

Manual redeploy: **hPanel → Git → Redeploy**, or **Actions → Deploy → Run workflow**.

---

## Hostinger deploy (manual reference)

**Option A — Node.js app (recommended)**  
Supports cron API + pipeline.

1. Upload project, run `npm install && npm run build`
2. Start with `npm start` (port 3000)
3. Point domain to the Node app in Hostinger
4. Set all `.env.local` variables in Hostinger panel
5. Schedule external cron (e.g. cron-job.org) to `GET https://seestew.com/api/cron/publish?secret=YOUR_CRON_SECRET` twice daily

**Option B — Static export**  
In `next.config.ts`, add `output: 'export'`. Upload `out/` folder. Pipeline must run on your PC (`npm run pipeline`) before each build; no `/api/cron` on static hosting.

## Env vars

| Variable | Purpose |
|----------|---------|
| `YOUTUBE_CHANNEL_ID` | Channel uploads feed |
| `YOUTUBE_API_KEY` | Long vs short detection |
| `OPENROUTER_API_KEY` | AI story writing |
| `OPENROUTER_MODEL` | Default `deepseek/deepseek-chat` |
| `CRON_SECRET` | Secures publish endpoint |
| `NEXT_PUBLIC_ADSENSE_*` | Ads after approval |

## Dev

```bash
npm install
npm run dev
```
