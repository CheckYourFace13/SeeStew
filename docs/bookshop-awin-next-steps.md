# Bookshop.org & Awin — next steps for Chris

Amazon Associates (`seestew-20`) is already live. Bookshop and Awin stay **off** until you paste real IDs. Do not invent IDs or enable unrelated merchants.

## Bookshop.org (recommended for history books)

### What to sign up for
1. Apply at [bookshop.org/pages/affiliates](https://bookshop.org/pages/affiliates).
2. Use a publisher/creator account tied to SeeStew (not a personal shopping account).
3. After approval, copy your **affiliate ID** from the Bookshop affiliate dashboard.

### Where to paste the ID
In `src/lib/affiliate-config.ts`:

```ts
export const BOOKSHOP_AFFILIATE_ID = ""; // paste approved ID here
```

Until this string is non-empty, `bookshopUrl()` returns `null` and `bookLink()` keeps using Amazon search links with `seestew-20`.

### After the ID is set
1. Add verified `isbn13` values to books in `src/data/recommended-reading.ts` (never guess ISBNs).
2. Run `npm run check:affiliate-links`.
3. Spot-check one article + one topic page: Bookshop links should open in a new tab with `rel="sponsored nofollow noopener noreferrer"`.

### Categories that fit SeeStew
- U.S. history monographs and narrative histories
- Documentary companion books tied to a published story
- Museum / archive exhibition catalogs when ISBN-backed

### Avoid
- Random bestsellers with no story connection
- Self-published “listicle” history books you have not vetted
- Anything that would need fake reviews, prices, or star ratings on-site

## Awin (optional; museums / education / docs only)

### What to sign up for
1. Create a publisher account at [Awin](https://www.awin.com/).
2. Apply only to merchants clearly relevant to American history readers.
3. Copy your **publisher ID** after approval.

### Where to paste the ID
In `src/lib/affiliate-config.ts`:

```ts
export const AWIN_PUBLISHER_ID = ""; // paste publisher ID here
```

Config support exists; **no Awin merchants are wired in the UI yet**. Do not add deep links until a merchant is approved and a manual mapping is written (same style as `recommended-reading.ts`).

### Merchant categories worth researching
- Museums and historic-site ticket / membership programs
- Guided history tours (U.S. only, content-policy safe)
- Educational history courses / lecture series
- Documentary or history-streaming partners that allow content-site affiliates
- Specialty history bookstores already on Awin (prefer Bookshop for books when possible)

### Avoid on SeeStew
- Travel insurance, SafetyWing-style products
- VPNs, generic gadgets, credit cards
- Unrelated travel deals with no history angle
- Any merchant that requires fake testimonials or on-page pricing scraped from Amazon

## Audible (later, via Amazon)

No separate Audible affiliate account. When an audiobook CTA makes sense for a specific story:

1. Use the existing Amazon Associates tag (`seestew-20`).
2. Add a manual recommendation entry (same disclosure rules).
3. Keep CTAs rare and after the article body — never on the homepage.

## Checklist before enabling anything new

- [ ] Real ID pasted (never a placeholder invent)
- [ ] Manual mapping only (no auto inject)
- [ ] `rel="sponsored nofollow noopener noreferrer"` + new tab
- [ ] Visible disclosure + `/affiliate-disclosure`
- [ ] `npm run check:affiliate-links` passes
- [ ] Homepage still affiliate-free
