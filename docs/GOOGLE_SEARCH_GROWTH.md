# Google Search growth — SeeStew

Date: 2026-10-15  
Production commit: `04b7660ecf7652508859fd1cb50dbaa6461c3174`

## GSC data availability

**GSC performance data: UNAVAILABLE** in this session.

- No Search Console MCP / export in the workspace
- No GSC CSV or API credentials in SeeStew Hostinger env
- Site verification meta key exists as `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (optional)

Therefore: **no invented clicks, impressions, CTR, or positions.**  
Evidence below is technical + editorial opportunity analysis only.

### Manual action to unlock measured SEO

1. Export GSC Performance (28d / prior 28d / 3mo) for `seestew.com` as CSV, or  
2. Grant API access / paste exports into the repo’s ops notes (not public).  
Then re-run title/CTR and position 5–20 work with real queries.

---

## Technical visibility / indexing (verified)

| Check | Result |
|---|---|
| `robots.txt` Allow `/`, Disallow `/api/` | PASS |
| Sitemap includes articles, hubs, topics, `/archive`, content-rich `/on-this-day/*` | PASS |
| `/today` noindex redirect | PASS (not in sitemap) |
| Empty calendar dates not indexed | PASS |
| Article BlogPosting + CreativeWork citations | PASS |
| Breadcrumbs JSON-LD on articles/hubs | PASS |
| IndexNow (Bing) | PASS — separate from Google |
| Soft/thin doorway pages | Not added |
| Public mailto | Absent |

---

## Performance baseline (live TTFB, curl 2026-10-15)

Lab field CWV (CrUX/PSI): **NOT VERIFIED** this session.

| Route | HTTP | TTFB | Total | Bytes |
|---|---|---|---|---|
| `/` | 200 | 0.46s | 0.62s | 150 KB |
| `/articles` | 200 | 0.39s | 0.55s | 110 KB |
| `/articles/johnstown-flood-1889` | 200 | 0.47s | 0.61s | 130 KB |
| `/topics/weird-america` | 200 | 0.35s | 0.55s | 171 KB |
| `/on-this-day` | 200 | 0.32s | 0.46s | 87 KB |
| `/videos` | 200 | 0.31s | 0.41s | 61 KB |
| `/newsletter` | 200 | 0.37s | 0.51s | 48 KB |
| `/archive` | 200 | 0.31s | 0.53s | 80 KB |
| `/hubs/cold-war-close-calls` | 200 | 0.33s | 0.44s | 67 KB |

No heavy new third-party scripts added in this pass. Affiliate UI remains text-only.

---

## Top 10 opportunities (technical / editorial — not GSC-ranked)

Until GSC exports exist, prioritize these **hypothesis queues** (validate against Search Console before mass title edits):

1. **Cold War close calls hub** (`/hubs/cold-war-close-calls`, 9 stories) — strong cluster; deepen internal links + FAQ-style intros on near-miss articles.  
2. **Forgotten American disasters hub** (9) — place-name queries; ensure city/state hubs cross-link.  
3. **Notable American fires hub** (8) — evergreen disaster intent.  
4. **Weird America topic** — largest topic; watch cannibalization; prefer unique angles per story.  
5. **Chicago / Boston city hubs** — local history intent; tour affiliates later if Awin/CJ approve.  
6. **Remove Event+Year `seoTitle` stubs** — done for 6 articles so SERP helpers don’t lean on weak labels.  
7. **Revolution topic under-built** — backlog founding-era stories (Gaspee, Newburgh, etc.).  
8. **Presidents topic empty** — keep unindexed until ≥2 sourced stories.  
9. **Video↔article matching** — still thin; explicit IDs needed (see `docs/video-matching-next-steps.md`).  
10. **High-impression low-CTR titles** — **DEFERRED** pending GSC export.

---

## Selected content clusters (3)

Chosen from existing inventory density + editorial fit (not claimed search volume):

| Priority | Cluster | Existing proof | Next move |
|---|---|---|---|
| 1 | **Cold War close calls / secrecy** | Hub + era hub (37 cold-war tagged) | Fill Able Archer, Palomares, Thule, Forrestal |
| 2 | **American disasters (fires/floods/industrial)** | Fires + forgotten disasters hubs | Collinwood, Winecoff, Hinckley, Seattle Fire |
| 3 | **Historical scandals / hoaxes** | Scandal topic + Teapot Dome / Moon Hoax / Black Sox | Credit Mobilier, Whiskey Ring, Quiz Show, ABSCAM |

---

## Proposed backlog (18 sourceable stories)

Do **not** auto-publish — each must pass research / quality gates.

1. Able Archer 83 nuclear scare  
2. Palomares hydrogen bomb incident (1966)  
3. Thule B-52 crash (1968)  
4. USS Forrestal fire (1967)  
5. Collinwood School Fire (1908)  
6. Winecoff Hotel Fire (1946)  
7. Hinckley Firestorm (1894)  
8. Great Seattle Fire (1889)  
9. Tri-State Tornado (1925)  
10. Credit Mobilier Scandal  
11. Whiskey Ring (Grant era)  
12. 1950s Quiz Show scandals  
13. ABSCAM  
14. Operation Pastorius (1942 saboteurs)  
15. Gaspee Affair (1772)  
16. Newburgh Conspiracy  
17. Kingsland Explosion (1917)  
18. Duquesne Spy Ring  

Research starting points listed in `docs/search-growth-plan.md`.

---

## Changes implemented this pass

- CJ property ID `101904039` coded; PAT documented as missing  
- Config-driven `affiliate-placements.ts` + `NetworkAffiliateBlock` (0 active links)  
- Affiliate placement validator  
- Cleared 6 weak Event+Year `seoTitle` fields  
- Docs: `CJ_SEESTEW_SETUP.md`, this file  
- No GSC-invented title mass rewrite  
- No new thin pages  

---

## Remaining manual work

1. Provide GSC exports or API access.  
2. Add `CJ_PERSONAL_ACCESS_TOKEN` to Hostinger SeeStew env.  
3. Confirm AdSense “Ready” in Google UI.  
4. Paste ≤3 verified CJ/Awin tracking URLs into the registry.  
5. After GSC: implement top-10 CTR title/description edits with real queries.

---

## Next three highest-impact traffic actions

1. **Import GSC 28-day query/page export** → edit titles/descriptions for high-impression low-CTR URLs only.  
2. **Publish 2–3 Cold War close-call stories** into the existing hub (Able Archer / Palomares / Thule).  
3. **Unlock CJ Link Search** with PAT → add at most one history-book + one tour placement on matching articles/hubs.
