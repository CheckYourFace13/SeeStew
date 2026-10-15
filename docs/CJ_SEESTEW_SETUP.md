# CJ Affiliate setup — SeeStew

## Verified property

| Field | Value |
|---|---|
| Property name | SeeStew — American History Stories & Videos |
| **CJ Promotional Property ID** | **101904039** |
| Status | Active |
| Type | Website |
| Code constant | `CJ_WEBSITE_PID` in `src/lib/affiliate-config.ts` |

This ID is the **website-id** for CJ Link Search. Authenticated Link Search with `website-id=101904039` succeeds with SeeStew’s PAT.

## API access status (2026-10-15)

| Item | Status |
|---|---|
| Property PID in repo | **PASS** — `101904039` |
| `CJ_PERSONAL_ACCESS_TOKEN` in local `.env.local` | **SET** (gitignored; never print) |
| `CJ_PERSONAL_ACCESS_TOKEN` on Hostinger Node env | **MANUAL** — add single key in hPanel (do not full-replace via API; SMTP/AdSense keys would be wiped) |
| Link Search `Authorization: Bearer` + `website-id=101904039` | **PASS** |
| Advertiser Lookup | **NEEDS** publisher **company CID** as `requestor-cid` (website PID `101904039` is rejected) |
| Joined advertisers (via Link Search `advertiser-ids=joined`) | **13 programs** — none history/books/museums/education |
| Active CJ placements on site | **0** (correct — no tasteful relevant matches) |

### Joined advertisers audited (not activated)

Coffee/gourmet (Adagio, Peet’s), LawDepot, Adrenaline (skydiving/helicopter gifts), DailySteals, AliExpress, electronics, betting (Legendz), visas, garden kits, kitchen, music AI. Keyword scans for museum / smithsonian / bookstore / civil war / history returned **no** relevant joined inventory (false positives only: coffee “press”, adventure “tours”).

**Rule applied:** leave placements inactive until a real history/museum/book/education merchant is joined and a verified tracking URL exists.

## Ops check (no credential leakage)

```bash
npm run check:cj-api
```

Optional: set `CJ_REQUESTOR_CID` (publisher company CID from CJ Members → Account) to also exercise Advertiser Lookup.

## Awin (parallel)

| Field | Value |
|---|---|
| Publisher ID | `3112962` |
| Active Awin placements | **0** |

## Placement rules

- Registry: `src/data/affiliate-placements.ts`
- Render: `NetworkAffiliateBlock` — max **3** active CJ/Awin
- `rel="sponsored nofollow noopener noreferrer"`
- Amazon `seestew-20` stays in `recommended-reading.ts`
- Never commit tokens; never `NEXT_PUBLIC_CJ_*`

## Hostinger secret (manual)

In **hPanel → seestew.com → Node.js → Environment variables**, add:

`CJ_PERSONAL_ACCESS_TOKEN` = *(your PAT)*

Do **not** use the Hostinger “replace all env vars” API unless you have the full unmasked set (SMTP, AdSense, YouTube, OpusClip, etc.).
