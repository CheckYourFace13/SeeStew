# SeeStew affiliate plan

Goal: modest, relevant monetization that never costs AdSense approval, page speed, or editorial
trust. Content first; affiliate links are a small extra at the bottom of pages where they fit.

## What is live

| Provider | Status | Where |
|---|---|---|
| Amazon Associates (`seestew-20`) | **Active** | "Recommended reading" on mapped articles and topics (tagged search links) |
| Bookshop.org | **Placeholder only** | Needs `BOOKSHOP_AFFILIATE_ID` + per-book ISBN-13 |
| Awin | **Placeholder only** | Config field exists; no merchants enabled |
| Audible | **Not active** | Would use the Amazon tag; no audiobook CTAs exist yet |

Nothing here is injected on the homepage, video pages, or shorts pages.

## Files

- `src/lib/affiliate-config.ts` — tag/IDs, link builders, the exact `rel`, and disclosure strings.
- `src/data/recommended-reading.ts` — the **only** place recommendations are defined (manual).
- `src/components/AffiliateBlock.tsx` — the block (text only, no scripts, no images, no prices).
- `src/app/affiliate-disclosure/page.tsx` — `/affiliate-disclosure` (linked from the footer, sitemap, llms.txt).
- `scripts/check-affiliate-links.ts` — `npm run check:affiliate-links`.

## Rules the code enforces

- Amazon links carry `tag=seestew-20`.
- Every affiliate link: `rel="sponsored nofollow noopener noreferrer"`, `target="_blank"`.
- Visible near every block: "Disclosure: SeeStew may earn from qualifying purchases."
- `/affiliate-disclosure` states: "As an Amazon Associate, SeeStew earns from qualifying purchases."
- Max 3 items per article/topic; no entry means no block.
- Block renders only after the article body, sources, and related links. Never on the homepage.
- No Amazon prices, star ratings, or reviews (only allowed via the Product Advertising API).
- No raw email or `mailto:` anywhere public.

## Adding a recommendation

1. Add a `book({...})` entry to `src/data/recommended-reading.ts` with `slug` (article) or
   `topic` (topic slug), plus `title`, `author`, and a one-sentence `reason`.
2. Only use books whose exact title and author you have verified. Never guess.
3. Run `npm run check:affiliate-links`.

Articles/topics currently with **no** mapping (Chris can supply books for these):
every article not listed in `recommended-reading.ts`, and the `weird-america` topic (the largest topic,
so it is the best place for 2–3 good general picks).

## Bookshop.org (preferred for books once approved)

1. Apply: https://bookshop.org/pages/affiliates
2. Set `BOOKSHOP_AFFILIATE_ID` in `src/lib/affiliate-config.ts`.
3. Add `isbn13` to the books in `recommended-reading.ts` (verify each ISBN).
4. Those entries switch from Amazon to Bookshop automatically (`bookLink()`); Amazon stays the
   fallback for entries without an ISBN. Bookshop URL format: `https://bookshop.org/a/<ID>/<ISBN-13>`.

## Awin (research only — do not enable random merchants)

Set `AWIN_PUBLISHER_ID` only after joining Awin. Merchant categories worth researching, each only
if clearly relevant to U.S. history readers and policy-safe for a content site:

- History book sellers / publishers
- Museums, historic sites, and guided tours
- Educational subscriptions (history courses, lecture series)
- Documentaries / streaming, only where the program allows content-site promotion

Do not add travel, insurance, VPN, or other unrelated merchants just to monetize.

## Audible

If audiobook CTAs are ever added (for example "Listen to related history audiobooks"), use the
Amazon Associates tag — no separate account. Add sparingly and only where a real audiobook matches the story.

## Still needed from Chris

- Bookshop.org affiliate approval + ID (optional but preferred for books).
- Review/approve the books in `recommended-reading.ts` and add more for top-traffic stories.
- Awin account only if pursuing museums/tours/courses.
- Confirm the Amazon Associates account is approved and has 3 qualifying sales within 180 days
  (Amazon's requirement for keeping the account active).
