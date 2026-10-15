/**
 * Affiliate configuration — the single place affiliate IDs live.
 *
 * Rules (see docs/affiliate-plan.md, docs/CJ_SEESTEW_SETUP.md, /affiliate-disclosure):
 * - Only relevant, manually mapped recommendations (recommended-reading + affiliate-placements).
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
 * Until non-empty, Bookshop links are never generated; books fall back to Amazon.
 */
export const BOOKSHOP_AFFILIATE_ID = "";

/**
 * Awin publisher ID for SeeStew.
 * Merchants stay off until each program is approved and a real tracking URL
 * is mapped in src/data/affiliate-placements.ts.
 */
export const AWIN_PUBLISHER_ID = "3112962";

/**
 * CJ Promotional Property ID for SeeStew (American History Stories & Videos).
 * Confirmed by Chris as Active Website / Content-Blog-Media property.
 * Used as website-id for Link Search when CJ_PERSONAL_ACCESS_TOKEN is available
 * server-side. Do not commit the token.
 */
export const CJ_WEBSITE_PID = "101904039";

/**
 * CJ is “ready” only when the property PID is set. Live placements still require
 * verified tracking URLs in affiliate-placements.ts (active: true).
 */
export const CJ_PROPERTY_CONFIGURED = Boolean(CJ_WEBSITE_PID);

/** Audible links go through Amazon Associates (same tag). No separate setup. */
export const AUDIBLE_VIA_AMAZON = true;

/** Exact link rel for every affiliate link. */
export const AFFILIATE_REL = "sponsored nofollow noopener noreferrer";

/** Short disclosure shown next to every affiliate block. */
export const AFFILIATE_DISCLOSURE_SHORT =
  "Disclosure: SeeStew may earn from qualifying purchases.";

/** Required Amazon Associates statement (shown on /affiliate-disclosure). */
export const AMAZON_ASSOCIATE_STATEMENT =
  "As an Amazon Associate, SeeStew earns from qualifying purchases.";

export type AffiliateProvider = "amazon" | "bookshop" | "audible" | "awin" | "cj";

/** Amazon search URL carrying the tracking tag. Search links need no ASIN. */
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
