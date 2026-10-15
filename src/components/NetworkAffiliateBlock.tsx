import Link from "next/link";
import {
  AFFILIATE_DISCLOSURE_SHORT,
  AFFILIATE_REL,
} from "@/lib/affiliate-config";
import type { AffiliatePlacement } from "@/data/affiliate-placements";
import { MAX_ACTIVE_NETWORK_PLACEMENTS } from "@/data/affiliate-placements";

type Props = {
  heading?: string;
  items: AffiliatePlacement[];
  className?: string;
};

/**
 * CJ / Awin placements from the config registry — text only, no network scripts.
 * Renders nothing when the list is empty (default until verified tracking URLs exist).
 */
export function NetworkAffiliateBlock({
  heading = "Related resources",
  items,
  className = "",
}: Props) {
  const shown = items
    .filter((p) => p.active && p.trackingUrl.startsWith("https://"))
    .slice(0, MAX_ACTIVE_NETWORK_PLACEMENTS);
  if (shown.length === 0) return null;

  return (
    <aside
      className={`mt-8 rounded-xl border border-brand-wash bg-white p-6 ${className}`}
      aria-labelledby="network-affiliate-heading"
    >
      <h2 id="network-affiliate-heading" className="font-heading text-lg font-bold text-ink">
        {heading}
      </h2>
      <p className="mt-1 text-xs text-ink-muted" data-affiliate-disclosure>
        {AFFILIATE_DISCLOSURE_SHORT}{" "}
        <Link href="/affiliate-disclosure" className="text-brand-mid underline">
          Affiliate disclosure
        </Link>
      </p>
      <ul className="mt-4 space-y-4 text-sm">
        {shown.map((item) => (
          <li key={item.id}>
            <a
              href={item.trackingUrl}
              target="_blank"
              rel={AFFILIATE_REL}
              className="font-medium text-brand-mid underline"
            >
              {item.title}
            </a>
            <p className="mt-1 text-ink-muted">{item.reason}</p>
            <p className="mt-1 text-xs text-ink-muted">
              ({item.network.toUpperCase()} · {item.merchant})
            </p>
          </li>
        ))}
      </ul>
    </aside>
  );
}
