/**
 * Affiliate configuration — the single place affiliate IDs live.
 *
 * Rules (see docs/affiliate-plan.md and /affiliate-disclosure):
 * - Only relevant, manually mapped recommendations (src/data/recommended-reading.ts).
 * - No Amazon prices, star ratings, or reviews (not allowed without the Product Advertising API).
 * - Every affiliate link: rel="sponsored nofollow noopener noreferrer", new tab, visible disclosure.
 * - Never above the article body; never on the homepage.
 *
 * Kept free of path aliases and Next imports so scripts/check-affiliate-links.ts can import it.
 */

/** Amazon Associates tracking ID for SeeStew. */
export const AMAZON_ASSOCIATE_TAG = "seestew-20";

/**
 * Bookshop.org affiliate ID — PLACEHOLDER only.
 * Chris: after approval at https://bookshop.org/pages/affiliates, paste the ID here
 * (same value you would keep as BOOKSHOP_AFFILIATE_ID in ops notes).
 * Until non-empty, Bookshop links are never generated; books fall back to Amazon.
 * Never invent a value. See docs/bookshop-awin-next-steps.md.
 */
export const BOOKSHOP_AFFILIATE_ID = "";

/**
 * Awin publisher ID — PLACEHOLDER only (config support; no merchants wired in UI).
 * Chris: after Awin publisher approval, paste AWIN_PUBLISHER_ID here.
 * Do not activate museum/tour/education merchants until this is a real ID and a
 * manual mapping exists. Avoid unrelated travel/insurance merchants.
 * See docs/bookshop-awin-next-steps.md.
 */
export const AWIN_PUBLISHER_ID = "";

/** Audible links go through Amazon Associates (same tag). No separate setup, and none are active. */
export const AUDIBLE_VIA_AMAZON = true;

/** Exact link rel for every affiliate link. */
export const AFFILIATE_REL = "sponsored nofollow noopener noreferrer";

/** Short disclosure shown next to every affiliate block. */
export const AFFILIATE_DISCLOSURE_SHORT =
  "Disclosure: SeeStew may earn from qualifying purchases.";

/** Required Amazon Associates statement (shown on /affiliate-disclosure). */
export const AMAZON_ASSOCIATE_STATEMENT =
  "As an Amazon Associate, SeeStew earns from qualifying purchases.";

export type AffiliateProvider = "amazon" | "bookshop" | "audible" | "awin";

/** Amazon search URL carrying the tracking tag. Search links need no ASIN, so none are guessed. */
export function amazonSearchUrl(query: string): string {
  const params = new URLSearchParams({
    k: query,
    tag: AMAZON_ASSOCIATE_TAG,
  });
  return `https://www.amazon.com/s?${params.toString()}`;
}

/** Bookshop.org link for a known ISBN-13, or null until BOOKSHOP_AFFILIATE_ID is filled in. */
export function bookshopUrl(isbn13: string | undefined): string | null {
  if (!BOOKSHOP_AFFILIATE_ID || !isbn13) return null;
  return `https://bookshop.org/a/${BOOKSHOP_AFFILIATE_ID}/${isbn13}`;
}

/**
 * Pick the best provider for a book: Bookshop when an affiliate ID and ISBN exist,
 * otherwise Amazon (tagged search link).
 */
export function bookLink(book: {
  title: string;
  author: string;
  isbn13?: string;
}): { provider: AffiliateProvider; url: string; disclosureLabel: string } {
  const bookshop = bookshopUrl(book.isbn13);
  if (bookshop) {
    return {
      provider: "bookshop",
      url: bookshop,
      disclosureLabel: "Bookshop.org affiliate link",
    };
  }
  return {
    provider: "amazon",
    url: amazonSearchUrl(`${book.title} ${book.author}`),
    disclosureLabel: "Amazon affiliate link",
  };
}
