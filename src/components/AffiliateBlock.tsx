import {
  AFFILIATE_DISCLOSURE_SHORT,
  AFFILIATE_REL,
} from "@/lib/affiliate-config";
import type { RecommendedReadingItem } from "@/data/recommended-reading";
import { MAX_RECOMMENDED_ITEMS } from "@/data/recommended-reading";
import Link from "next/link";

type Props = {
  heading: string;
  items: RecommendedReadingItem[];
  className?: string;
};

/**
 * Small, text-only "Recommended reading" block. Renders nothing when there are no mapped
 * items. Server component: no scripts, no images, no third-party requests. Place it only
 * AFTER the main article content — never above the intro and never on the homepage.
 */
export function AffiliateBlock({ heading, items, className = "" }: Props) {
  const shown = items.slice(0, MAX_RECOMMENDED_ITEMS);
  if (shown.length === 0) return null;

  return (
    <aside
      className={`mt-12 rounded-xl border border-brand-wash bg-white p-6 ${className}`}
      aria-labelledby="recommended-reading-heading"
    >
      <h2 id="recommended-reading-heading" className="font-heading text-lg font-bold text-ink">
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
          <li key={`${item.provider}-${item.title}`}>
            <a
              href={item.url}
              target="_blank"
              rel={AFFILIATE_REL}
              className="font-medium text-brand-mid underline"
            >
              {item.title}
            </a>
            {item.author && <span className="text-ink-muted"> — {item.author}</span>}
            <p className="mt-1 text-ink-muted">{item.reason}</p>
            <p className="mt-1 text-xs text-ink-muted">({item.disclosureLabel})</p>
          </li>
        ))}
      </ul>
    </aside>
  );
}
