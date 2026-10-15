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
 */
export const affiliatePlacements: AffiliatePlacement[] = [
  // Example shape only — inactive until PAT + Link Search confirm a real URL.
  // {
  //   id: "cj-example-history-book",
  //   network: "cj",
  //   merchant: "Example History Publisher",
  //   programId: "",
  //   linkId: "",
  //   trackingUrl: "https://www.anrdoezrs.net/...",
  //   destinationHost: "example.com",
  //   title: "…",
  //   reason: "…",
  //   articleSlug: "boston-massacre-1770",
  //   placementType: "further-reading",
  //   active: false,
  //   lastVerified: "2026-10-15",
  //   notes: "Awaiting CJ Link Search for SeeStew PID 101904039",
  // },
];

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
