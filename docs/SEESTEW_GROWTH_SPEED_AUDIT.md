# SeeStew growth & speed audit

Date: 2026-10-28  
Grokbot items treated as hypotheses. Only verified measurements and justified changes shipped.

**Production target after this pass:** the commit SHA recorded at deploy time (see final report).

## Status legend

- **PASS** — measured or implemented
- **FIXED** — root cause addressed
- **DEFERRED** — intentionally not shipped
- **BLOCKED** — cannot complete without access or would violate editorial rules

---

## Confirmed vs unconfirmed Grokbot claims

| Claim | Verdict | Evidence |
|---|---|---|
| `/_next/image` returns HTTP 503 | **Not reproduced** | HEAD/GET of logo and story cards at `w=256`, `640`, `1200`, `3840` all returned **200** on 2026-10-28 |
| HTML srcset includes `w=3840` | **Confirmed** | Homepage HTML listed 35 `w=3840` candidates (Next default `deviceSizes`) |
| Browser actually requests 3840px cards | **Mostly unconfirmed** | Desktop 1440×900 @ 2× DPR selected **`w=750`**. Narrow 491px viewport selected **`w=384`** for above-the-fold cards. Unloaded lazy images exposed 3840 as the fallback `src` attribute (Next default), which can still be requested by crawlers or under memory pressure |
| Homepage desktop load ~10.5s | **Not reproduced** | Lab, production, 1440×900 @ 2×: TTFB **204 ms**, FCP **424 ms**, `load` **1017 ms**, ~235 KB transfer, 66 requests. Narrow 491px: TTFB **521 ms**, FCP **952 ms**, `load` **1782 ms** |
| 41 indexable pages under 250 words, especially `/hubs/1870s` and `/hubs/boston-history` | **Partly true, misleading** | Hub *intros* are short by design. Each populated hub lists ≥3 full articles with excerpts. Not treated as doorway stubs. Intros for 1870s and Boston improved; hubs remain indexed |
| Only 17 On This Day date pages | **Was true** | 19 curated events / 17 unique dates before this pass. Expanded from verified article dates only |
| 72 titles exceed 65 characters; 24 contain em dashes | **Do not treat as defects** | Character count ≠ CTR. Prior GSC work (`a01b755`) already shortened high-rank/low-CTR titles. No blanket rewrite |
| “delve” twice; ~793 em dashes | **Partly true** | One “delves” in Operation Paperclip rewritten. Em dashes left in historical prose. Editorial “we do not invent…” language kept — it is a correction policy, not filler |
| Unfilled AdSense units | **Integration only** | Script + ads.txt present. Dashboard approval **not verified**. No extra units added |
| Daily / QR automation healthy | **Daily PASS; QR failing** | Daily published through Winecoff (2026-10-28). All 5 QR scheduled runs since 2026-10-17 failed: **Quick Read missing image** |

---

## Phase 1 — Images & performance

### Root cause (503 risk, not a live 503 today)

Hostinger Sharp is asked to generate a **3840px** candidate for every `fill` image because Next.js default `deviceSizes` ends at 3840, and that width is the fallback `src`. Combined with several **400 KB–2 MB** local JPEGs (Paxton Boys 1.7 MB, Goldsboro 2.0 MB, Galveston 1.1 MB), optimizer memory spikes can produce intermittent 503s even when a given probe returns 200.

Lab browsers with correct `sizes` usually pick 384–750. That is not the same as “3840 is never requested.”

### Fixes

- Cap `deviceSizes` at **1200**; keep small `imageSizes` for logos
- 30-day image `minimumCacheTTL`
- Logo `sizes` = 48px / 128px (display usage)
- Card `sizes` ≈ actual layout; featured card `720px`
- Video thumbs capped at `400px`
- Recompressed oversized local `card.jpg` files above 400 KB to max 1200px JPEG q78 (credits/alt unchanged). Goldsboro was **locked on disk** this session and remains large

### Measured before (production, 2026-10-28, pre-deploy)

| Viewport | TTFB | FCP | load | Transfer | Requests | 503s | Selected card `w` |
|---|---:|---:|---:|---:|---:|---:|---|
| ~491×850 @ 1.25× | 521 ms | 952 ms | 1782 ms | ~813 KB | 68 | 0 | 384 (visible); lazy `src` advertised 3840 |
| 1440×900 @ 2× | 204 ms | 424 ms | 1017 ms | ~235 KB | 66 | 0 | 750 |

**3-second desktop load target:** already met in this lab **before** code deploy. After deploy, re-measure; do not claim a post-deploy number until the Hostinger build is live.

LCP entries were empty in the CDP sample (LCP observer not installed before first paint). FCP + `load` are the reliable lab numbers here.

---

## Phase 2 — Hubs

- Populated hubs remain **indexable** (minimum 3 sourced articles)
- **0 hubs noindexed** — navigation value is real; excerpts prevent empty doorway pages
- Improved intros: `/hubs/1870s`, `/hubs/boston-history` (facts already in those articles)
- Related-hub links prefer the same hub kind
- `/archive` era navigation unchanged

---

## Phase 3 — On This Day

| Metric | Before | After |
|---|---:|---:|
| Curated anniversary events | 19 | 66 |
| Unique date pages (sitemap) | 17 | ~59 (unique month/day) |
| Fake / inferred dates | 0 | 0 |

Rules kept: never `createdAt`; skip multi-day crises without a single sourced date (Able Archer, Dust Bowl as an era, Amistad date mismatch, Haymarket May 1 vs May 4).

Homepage:

- If today has a verified event → “On this day”
- Else → “Upcoming anniversaries” and copy that they are **not** today (Oct 28 has none)

Prev/next among content-rich dates unchanged. Feb 29 still parseable.

---

## Phase 4 — SEO titles

**Changed this pass: none.**

Prior production titles from `a01b755` / GSC (Molasses, Lake Peigneur, Radium Girls, Zoot Suit) left intact.

GSC baseline (2026-10-15 export): 4,871 impressions / 4 clicks / avg position 70.5. Highest-priority CTR page remains Molasses (pos 5.77, 0 clicks at export). Re-check GSC in 28 days; do not guess new titles.

---

## Phase 5 — Editorial language

| Change | Why |
|---|---|
| Operation Paperclip: “delves into” → “examines” | Isolated AI-tell; meaning unchanged |
| Homepage On This Day heading/copy | Stop implying upcoming dates happened today |
| Em dashes | **Not** bulk-deleted |
| Editorial standards “we do not invent quotes” | Kept — corrections policy |

No 100-article rewrite.

---

## Phase 6 — Publishing automation (14 days)

### Daily Story Generator (`0 10 * * *` UTC)

| Date (UTC run) | Result |
|---|---|
| Oct 13–15 | failure (pre-repair empty queue era) |
| Oct 16 | success — Gaspee |
| Oct 17 | success |
| Oct 18 | failure |
| Oct 19–22 | success |
| Oct 23 | failure — **Download story card image** |
| Oct 24–28 | success — through Winecoff Hotel Fire |

Public homepage featured Winecoff, Hinckley, Seattle Fire, Forrestal, Thule, Palomares, Able Archer, Paxton Boys, Benedict Arnold — **real articles**, not workflow-only successes.

Last full story at audit start of local clone: `winecoff-hotel-fire-1946`.  
Pending full topics: see `npm run validate:queue` at ship (reserve warning if &lt; 30).

Editorial hold file cleared of **test** `-redux` slugs (Amistad/Able Archer) that were written by originality regressions. Tests now set `SEESTEW_EDITORIAL_TEST=1` and do not write the production hold log.

### Quick Reads (`0 14 * * 2,4,6` UTC)

| Date | Result | Cause |
|---|---|---|
| Oct 17, 20, 22, 24, 27 | **failure** | `Quick Read missing image` after LOC search miss |

**0 Quick Reads published.** Next scheduled: **Thursday 2026-10-29 14:00 UTC**.

Fix (not a silent publish):

- Broader LOC search terms
- Companion QRs **copy the parent article’s archival card** (same credit/source page)
- Queue items for Able Archer, Gaspee, and Forrestal now declare `parentArticleSlug` now that those full stories exist

Dry-run only this pass (Wednesday). Do not invent a QR to hit quota.

---

## Phase 7 — AdSense

| Check | Status |
|---|---|
| ads.txt `google.com, pub-9572509189594279, DIRECT, f08c47fec0942fa0` | PASS |
| `ca-pub-9572509189594279` script in layout | PASS |
| Cookie notice present | PASS |
| Duplicate adsbygoogle.js | Not found (one layout script + per-slot push) |
| Ads before article body on mobile | Homepage slot is **after** the story grid |
| Approval / fill rate | **BLOCKED** — no AdSense dashboard in this session |
| Extra ad units | None added |

Unfilled units are consistent with pending approval, low inventory, or blocked requests — not missing tags.

Amazon `seestew-20`, CJ PID 101904039 (no history merchants), Awin 3112962, SendFable: preserved.

---

## Phase 8 — Search growth opportunities (do next)

1. Re-export GSC; if Molasses still pos ≤10 with ~0 CTR, iterate snippet only
2. Internal links from 1870s / Boston / fire hubs to Triangle, Chicago, Peshtigo (already listed; add in-article links only where historically honest)
3. Ship first three companion Quick Reads once Thursday’s job can attach parent images
4. Submit new `/on-this-day/*` URLs via IndexNow after deploy
5. Compress remaining Goldsboro card when the file is not locked; avoid 2 MB optimizer inputs

---

## Pages changed (this pass)

- `next.config.ts` — image size cap
- `src/components/{Logo,StoryCard,VideoCard}.tsx`, `src/app/page.tsx`
- `src/lib/on-this-day.ts`, `src/lib/history-hubs.ts`, `src/app/hubs/[slug]/page.tsx`
- `scripts/story-images-loc.mjs`, `scripts/editorial/prepublish-gate.mjs`, tests
- `content/quick-read-queue.json` — parent slugs
- `content/articles/operation-paperclip.json` — one verb
- `public/stories/*/card.jpg` — oversized recompress
- `docs/SEESTEW_GROWTH_SPEED_AUDIT.md`

**Not changed:** published article URLs, canonicals, AdSense slot count, affiliate activation, SendFable, contact SMTP, editor identity.

---

## Unresolved

- Goldsboro card still ~2 MB (file lock)
- QR still unpublished until the next scheduled run succeeds
- Full-story queue may sit near/below the 30 reserve — refill with a curated batch, not filler
- AdSense approval unknown
- GSC not re-exported this session
- Post-deploy CWV must be re-measured on the new SHA
