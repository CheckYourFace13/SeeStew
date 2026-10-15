# CJ Affiliate setup — SeeStew

## Verified property

| Field | Value |
|---|---|
| Property name | SeeStew — American History Stories & Videos |
| **CJ Promotional Property ID** | **101904039** |
| Status | Active (per Chris) |
| Type | Website |
| Category | Content/Blog/Media |
| Code constant | `CJ_WEBSITE_PID` in `src/lib/affiliate-config.ts` |

This ID is treated as the **website-id** for CJ Link Search / deep-link generation. Final API confirmation still requires a Personal Access Token (below).

## API access status (2026-10-15)

| Item | Status |
|---|---|
| Property PID in repo | **PASS** — `101904039` |
| `CJ_PERSONAL_ACCESS_TOKEN` in SeeStew Hostinger env | **MISSING** |
| Token found on sibling Hostinger Node apps (key names checked) | **NOT FOUND** |
| Token found in local SeeStew `.env.local` | **NOT FOUND** |
| Authenticated Advertiser Lookup / Link Search | **BLOCKED** — no PAT |
| Active CJ placements on site | **0** (registry empty / inactive) |

**Do not** copy another site’s PID or token. Do not commit tokens. Do not print tokens in logs.

### Exact credentials still needed

1. **`CJ_PERSONAL_ACCESS_TOKEN`** — CJ Publisher personal access token with permission to call:
   - Advertiser Lookup
   - Link Search  
   scoped to property **101904039**
2. Store it only in **Hostinger → seestew.com → Node.js environment variables** (or local `.env.local` for ops scripts). Never `NEXT_PUBLIC_*`.

After the PAT is set, run a read-only lookup (ops script / curl against `https://advertiser-lookup.api.cj.com/...` and Link Search) and paste **verified** tracking URLs into `src/data/affiliate-placements.ts` with `active: true`.

## Merchant priorities (when API works)

Approve / select only:

1. American history books & publishers  
2. Historical tours & museum experiences  
3. Documentaries / educational media  
4. Learning resources tied to U.S. history  

Reject: insurance, generic travel, electronics, unrelated shopping.

## Awin (parallel)

| Field | Value |
|---|---|
| Publisher ID | `3112962` |
| Verified history-merchant tracking URLs in repo | **NONE** |
| Active Awin placements | **0** |

Missing for activation: approved merchant tracking link(s) (e.g. GoWithGuide US historical tours) pasted into `affiliate-placements.ts`.

## Placement rules

- Config registry: `src/data/affiliate-placements.ts`
- Render: `NetworkAffiliateBlock` (articles, topics, hubs) — after body / reading lists
- Cap: **max 3** active CJ/Awin placements sitewide (`MAX_ACTIVE_NETWORK_PLACEMENTS`)
- `rel="sponsored nofollow noopener noreferrer"`
- No homepage affiliates
- No sitewide CJ/Awin JS
- Amazon `seestew-20` remains in `recommended-reading.ts`

## Validator

```bash
npm run check:affiliate-placements
npm run check:affiliate-links
```

## Activation checklist

1. Add `CJ_PERSONAL_ACCESS_TOKEN` to Hostinger (SeeStew only).  
2. Confirm Link Search accepts `website-id=101904039`.  
3. Export ≤3 history-relevant approved links.  
4. Add rows to `affiliate-placements.ts` with real `trackingUrl`, `lastVerified`, `active: true`.  
5. Run validators + build + deploy.  
6. Spot-check disclosure + `rel` on production.
