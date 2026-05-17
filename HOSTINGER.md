# Deploy SeeStew on Hostinger

Use this when replacing the old **Hostinger Website Builder** site at seestew.com.

## Before you switch DNS

### Keep from the old site (already in this project)

| Item | Status |
|------|--------|
| AdSense publisher `ca-pub-9572509189594279` | In `.env.local` + `public/ads.txt` |
| `ads.txt` at `/ads.txt` | `public/ads.txt` |
| Email `info@seestew.com` | Site config + contact page |
| Old blog URLs | 301 redirects in `next.config.ts` |

### Copy from Google dashboards (add to Hostinger env)

1. **Search Console** → Settings → Ownership verification  
   - If you used **DNS TXT**: leave that TXT record in Hostinger DNS when you migrate.  
   - If you used **HTML tag**: copy the `content="..."` value into  
     `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` in Hostinger environment variables.

2. **Google Analytics** (if you use it)  
   - Analytics → Admin → Data streams → Web → Measurement ID (`G-XXXXXXXX`)  
   - Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in Hostinger env.

3. **AdSense**  
   - After go-live, open AdSense → Sites → confirm `seestew.com` still approved.  
   - Crawl `https://seestew.com/ads.txt` — should show `pub-9572509189594279`.

---

## Option A — Hostinger Node.js Web App (recommended)

Supports `npm start`, API cron, and server features.

1. **hPanel** → **Websites** → your domain → **Node.js** (or **Advanced** → Node.js Web App).

2. **Deploy code**
   - Git: connect GitHub repo, or  
   - Upload ZIP of the project (exclude `node_modules`, include `package.json`).

3. **Build settings**
   - Node version: **20** or **22**
   - Install: `npm install`
   - Build: `npm run build`
   - Start: `npm start`
   - Port: **3000** (or whatever Hostinger assigns)

4. **Environment variables** (paste from your `.env.local`)

   ```
   YOUTUBE_CHANNEL_ID
   YOUTUBE_API_KEY
   NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-9572509189594279
   NEXT_PUBLIC_ADSENSE_ENABLED=true
   NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=   (if using HTML tag)
   NEXT_PUBLIC_GA_MEASUREMENT_ID=          (if using GA4)
   OPENROUTER_API_KEY
   OPENROUTER_MODEL=deepseek/deepseek-chat
   CRON_SECRET
   PIPELINE_MAX_STORIES=2
   ```

5. **Turn off Website Builder** for seestew.com  
   - hPanel → Websites → seestew.com → stop pointing domain to Website Builder.  
   - Point domain to the **Node.js app** instead.

6. **SSL** — enable free SSL for seestew.com in hPanel (Let’s Encrypt).

7. **Cron** (new articles twice daily)  
   - hPanel → **Cron Jobs** (or use cron-job.org):  
   ```
   curl -s "https://seestew.com/api/cron/publish?secret=YOUR_CRON_SECRET"
   ```
   - After cron runs, trigger a **redeploy/rebuild** if articles are baked at build time, OR configure Hostinger to rebuild on schedule.

8. **Search Console**  
   - Submit sitemap: `https://seestew.com/sitemap.xml`  
   - Use **URL inspection** on homepage after DNS propagates.

---

## Option B — Static export (simpler hosting, no API cron)

1. In `next.config.ts` add: `output: 'export'`
2. Run locally: `npm run build` → upload the `out/` folder to **public_html**.
3. Run `npm run pipeline` on your PC before each build to add articles.
4. Cron API will **not** work on pure static hosting.

---

## DNS checklist (Hostinger)

| Record | Purpose |
|--------|---------|
| A / CNAME | Points `seestew.com` to Hostinger Node app or server IP |
| TXT (Google) | Keep existing Search Console verification TXT if used |
| MX | Keep email MX records if mail is on Hostinger |

Propagation: up to 24–48 hours; usually faster.

---

## Post-launch checks

- [ ] https://seestew.com loads with purple SeeStew branding  
- [ ] https://seestew.com/ads.txt  
- [ ] https://seestew.com/sitemap.xml  
- [ ] https://seestew.com/blog-post3 → redirects to George Washington article  
- [ ] AdSense ads visible (if approved)  
- [ ] YouTube videos and shorts load  
- [ ] Search Console: no spike in 404s after a week  

---

## Rollback

Keep Website Builder unpublished but not deleted for 1–2 weeks. If needed, point DNS back to the builder site temporarily.
