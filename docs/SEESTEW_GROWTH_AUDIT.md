# SeeStew growth audit — 2026-10-15

Full health / SEO / affiliate / ads / performance pass. Grokbot items treated as hypotheses; only verified changes shipped.

**Git commit:** `9e876462caefd3494ba5f390ad28241adbb4adea`  
**Production SHA:** `9e876462caefd3494ba5f390ad28241adbb4adea` (Hostinger build completed 2026-10-15T05:20:58Z)

---

## Status legend

- **PASS** — implemented and tested
- **FAIL** — tested and broken (none remaining at ship)
- **DEFERRED** — intentionally not shipped
- **NOT VERIFIED** — no access / insufficient credentials

---

## Phase 1 — Baseline (pre-change)

| Check | Result |
|---|---|
| Production homepage | Live (Next.js on Hostinger `u703718100`) |
| ads.txt | `google.com, pub-9572509189594279, DIRECT, f08c47fec0942fa0` — PASS |
| SendFable `/newsletter` | Live embed `seestew-newsletter` — PASS |
| `/on-this-day` + content-rich date pages | Present; empty dates not in sitemap — PASS |
| `/archive`, `/today` | Missing before this pass |
| Security headers | `X-Content-Type-Options`, `X-Frame-Options`, `HSTS`, `Referrer-Policy`, `Permissions-Policy` in `next.config.ts` — PASS |
| Public email / mailto | Absent — PASS |
| Editor identity | Chris only — PASS |
| npm audit (prod) | 3 issues (1 moderate, 2 high: `sharp`/`librsvg`, `source-map-js`) — remaining |
| Google Search Console | **NOT VERIFIED** (no dashboard access in this session) |
| AdSense approval status | Script + ads.txt present; dashboard approval **NOT VERIFIED** |
| Core Web Vitals lab numbers | **NOT VERIFIED** (no CrUX/PSI API run this session); site remains SSG/ISR + YouTube facade |

---

## Phase 2 — CJ Affiliate

| Item | Status |
|---|---|
| SeeStew CJ website PID | **NOT VERIFIED** / missing (`CJ_WEBSITE_PID` empty) |
| CJ personal access token in SeeStew Hostinger env | **NOT VERIFIED** — not listed among env keys |
| Read-only Advertiser Lookup / Link Search | **DEFERRED** — no SeeStew credentials |
| Placements added | None |
| Other sites’ PIDs reused | No — explicitly refused |

**Manual action:** Chris must supply SeeStew’s own CJ website PID + PAT (never RentalNoodle / DrinkKnird / VenueSprocket). Then re-run advertiser lookup for books, museums, tours, education.

---

## Phase 3 — Awin

| Item | Status |
|---|---|
| Publisher ID `3112962` | **PASS** — stored in `AWIN_PUBLISHER_ID` |
| GoWithGuide US tracking URL | **NOT VERIFIED** — no Awin API token in SeeStew env; no invented deep links |
| Travlfi / Music Stand / consumer merchants | **DEFERRED** — unrelated or unverified |
| On-page Awin placements | None until a verified tracking URL exists |
| Sitewide Awin script | Not added — PASS (performance) |

**Manual action:** From Awin UI, confirm GoWithGuide (or similar history-tour) approval + copy a real tracking link for Boston / NY history hubs, then map manually.

---

## Phase 4 — Amazon / Bookshop

| Item | Status |
|---|---|
| Amazon `seestew-20` | **PASS** — active; `check:affiliate-links` passed (18 mapped items) |
| Bookshop.org | **DEFERRED** — `BOOKSHOP_AFFILIATE_ID` empty |
| Prices / ratings / reviews | Not shown — PASS |
| Homepage affiliate-free | PASS |

---

## Phase 5 — On This Day

| Item | Status |
|---|---|
| Canonical archive `/on-this-day` | Preserved — PASS |
| `/today` → today’s content-rich date (America/New_York) or `/on-this-day` | **PASS** |
| `/this-day` → `/today` compat | **PASS** (noindex) |
| Prev/next among content-rich dates | **PASS** |
| Feb 29 parseable (`daysInMonth`) | **PASS** |
| Empty dates not in sitemap | **PASS** |
| Empty valid date slug → redirect `/on-this-day` | **PASS** |
| “Also on this day” on articles (curated calendar only) | **PASS** |
| Invented dates from `createdAt` | Not done — PASS |

---

## Phase 6 — Archive

| Item | Status |
|---|---|
| `/archive` landing (era, state, topics, anniversaries, recent) | **PASS** |
| Thin empty hubs | Not created — PASS |
| `/articles` remains main library | PASS |

---

## Phase 7 — Source trust

| Item | Status |
|---|---|
| Institution chips (LOC / NARA / NPS / Smithsonian) when matched | **PASS** |
| Softened “primary source” claim in References copy | **PASS** |
| Article JSON-LD `citation` as CreativeWork + real URLs | **PASS** |
| Fake authority badges | Not added — PASS |

---

## Phase 8 — AdSense

| Item | Status |
|---|---|
| Publisher / ads.txt | Unchanged — PASS |
| Reserved min-height on ad slots (CLS) | **PASS** |
| Extra ad units | Not added — PASS |
| Approval dashboard | **NOT VERIFIED** |

---

## Phase 9 — SendFable

| Item | Status |
|---|---|
| Weekly digest embed | Preserved single loader — PASS |
| Daily Story of the Day program | **DEFERRED** — no distinct list/opt-in/capacity verified |
| Promise of daily email in UI | Not added — PASS |

---

## Phase 10 — Search traffic

| Item | Status |
|---|---|
| GSC impressions / CTR | **NOT VERIFIED** |
| Mass title rewrites | Not done — PASS |
| New browse routes for internal links (`/archive`, `/today`) | PASS |
| Roadmap | Keep prioritizing sourced disaster/scandal queries; fix long SERP titles selectively (102 length/CTR warnings in `check:seo-snippets`, 0 failures) |

---

## Phase 11 — Performance

| Item | Status |
|---|---|
| No new heavy affiliate scripts | PASS |
| SendFable single SSR bootstrap | PASS |
| YouTube facade / SSG preserved | PASS |
| Before/after LCP/CLS lab | **NOT VERIFIED** |

---

## URLs changed / added

- `/archive` (new, indexed)
- `/today` (dynamic redirect, noindex)
- `/this-day` (compat → `/today`, noindex)
- `/on-this-day/[date]` — prev/next nav; empty → `/on-this-day`
- Article pages — source chips + “Also on this day” when curated peers exist
- Sitemap + footer + `llms.txt` — archive/today
- Affiliate disclosure — Awin network mention (no live Awin links yet)

---

## Validation (local)

| Command | Result |
|---|---|
| `check:story-images` | PASS (118) |
| `check:article-quality` | PASS |
| `check:affiliate-links` | PASS |
| `check:seo-snippets` | PASS (0 fail; length warnings remain) |
| `check:internal-links` | PASS |
| `check:email-signup` | PASS |
| `validate:indexnow -- --live` | PASS |
| `npm audit --omit=dev` | 3 vulns remain (`sharp`, `source-map-js`) |
| `npm run build` | PASS (211 pages) |

## Production verification (post-deploy)

| URL / check | Result |
|---|---|
| `/archive` | 200 PASS |
| `/today` (2026-10-15, no curated items) | 307 → `/on-this-day` PASS |
| `/this-day` | 307 → `/today` PASS |
| `/on-this-day/may-31` | 200 PASS |
| `/on-this-day/october-10` (empty) | 307 → `/on-this-day` PASS |
| `/newsletter` | 200 PASS |
| ads.txt | Unchanged PASS |
| Johnstown “Also on this day” + Tulsa peer | PASS |
| Article CreativeWork citations | PASS |
| Sitemap includes `/archive`, excludes `/today` | PASS |
| IndexNow submit archive + on-this-day + newsletter | 200 PASS |

---

## Remaining vulnerabilities / manual actions

1. Provide SeeStew **CJ website PID + PAT** (or confirm CJ not used).
2. In Awin, verify **GoWithGuide** (or other history tours) + paste real tracking URLs for Boston/NY hubs.
3. Bookshop.org approval + ID + ISBNs.
4. Confirm AdSense **Ready** in Google UI; do not add units until confirmed.
5. Connect GSC export for CTR/title work on high-impression pages.
6. Review `npm audit fix` for `sharp` / `source-map-js` on a branch before prod.
7. Optional: daily SendFable list only after capacity + opt-in confirmed.

---

## Concise ship summary

Shipped content-rich `/archive`, `/today` (NY timezone), OTD prev/next + Also-on-this-day, source institution chips, safer citation schema, ad min-heights, Awin publisher ID config (no unverified merchant links), CJ explicitly deferred. Amazon, SendFable weekly, AdSense, IndexNow, and SMTP contact preserved.
