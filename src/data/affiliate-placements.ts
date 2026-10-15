/**
 * Configuration-driven affiliate placements (CJ / Awin / future networks).
 *
 * Rules:
 * - Only active:true entries with a real https tracking URL may render.
 * - Max 3 active non-Amazon network placements sitewide (guarded by validator).
 * - Never invent link IDs or tracking URLs.
 * - Amazon book recommendations stay in recommended-reading.ts.
 */

export type AffiliateNetwork = "cj" | "awin" | "amazon" | "bookshop";

export type AffiliatePlacement = {
  id: string;
  network: AffiliateNetwork;
  /** Merchant / advertiser display name */
  merchant: string;
  /** Network program or advertiser id when known */
  programId?: string;
  /** CJ link id / Awin mid when known */
  linkId?: string;
  /** Full verified tracking URL — required when active */
  trackingUrl: string;
  /** Destination domain for disclosure / validation */
  destinationHost?: string;
  title: string;
  reason: string;
  /** Article slug and/or hub/topic slug */
  articleSlug?: string;
  hubSlug?: string;
  topicSlug?: string;
  placementType: "further-reading" | "tour" | "learning" | "documentary";
  active: boolean;
  /** ISO date last verified against network UI/API */
  lastVerified: string;
  notes?: string;
};

/**
 * Registry — keep inactive until each tracking URL is confirmed for SeeStew’s
 * CJ property 101904039 or Awin publisher 3112962.
 *
 * 2026-10-15: Authenticated Link Search for website-id 101904039 listed 13 joined
 * programs (coffee, LawDepot, Adrenaline adventures, AliExpress, etc.). None were
 * history books / museums / educational tours — leave empty until a real match.
 */
export const affiliatePlacements: AffiliatePlacement[] = [];

/** Hard cap on active CJ/Awin (non-Amazon) placements sitewide. */
export const MAX_ACTIVE_NETWORK_PLACEMENTS = 3;

export function activeNetworkPlacements(): AffiliatePlacement[] {
  return affiliatePlacements.filter(
    (p) =>
      p.active &&
      Boolean(p.trackingUrl?.startsWith("https://")) &&
      (p.network === "cj" || p.network === "awin")
  );
}

export function placementsForArticle(slug: string): AffiliatePlacement[] {
  return activeNetworkPlacements()
    .filter((p) => p.articleSlug === slug)
    .slice(0, MAX_ACTIVE_NETWORK_PLACEMENTS);
}

export function placementsForHub(hubSlug: string): AffiliatePlacement[] {
  return activeNetworkPlacements()
    .filter((p) => p.hubSlug === hubSlug)
    .slice(0, MAX_ACTIVE_NETWORK_PLACEMENTS);
}

export function placementsForTopic(topicSlug: string): AffiliatePlacement[] {
  return activeNetworkPlacements()
    .filter((p) => p.topicSlug === topicSlug)
    .slice(0, MAX_ACTIVE_NETWORK_PLACEMENTS);
}
