import type { Metadata } from "next";
import Link from "next/link";
import { AMAZON_ASSOCIATE_STATEMENT } from "@/lib/affiliate-config";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description:
    "How SeeStew uses affiliate links, including Amazon Associates, and how they relate to our editorial coverage.",
  alternates: { canonical: `${siteConfig.url}/affiliate-disclosure` },
};

export default function AffiliateDisclosurePage() {
  return (
    <div className="page-shell-narrow">
      <h1 className="font-heading text-4xl font-bold text-ink">Affiliate Disclosure</h1>
      <p className="mt-2 text-sm text-ink-muted">Last updated: October 3, 2026</p>

      <div className="prose-history mt-8 space-y-6">
        <section>
          <h2>Short version</h2>
          <p>
            Some pages on {siteConfig.name} include a small &ldquo;Recommended reading&rdquo; list
            of books related to the story or topic. Some of those links are affiliate links. If you
            buy through one, {siteConfig.name} may earn a small commission at no extra cost to you.
          </p>
          <p>
            <strong>{AMAZON_ASSOCIATE_STATEMENT}</strong>
          </p>
        </section>

        <section>
          <h2>How we choose recommendations</h2>
          <ul>
            <li>
              Each recommendation is chosen by hand because it relates to the specific story or
              topic it appears on. If we have no relevant recommendation, we show nothing.
            </li>
            <li>
              Affiliate links never affect which stories we cover or what we say in them.
              Articles are written and sourced first; recommendations are added afterward, below
              the article and its sources.
            </li>
            <li>
              We do not show prices, star ratings, or customer reviews for products. Check the
              retailer&apos;s page for current price and availability.
            </li>
            <li>
              Affiliate links are marked as sponsored and open in a new tab. A disclosure appears
              next to every block of recommendations.
            </li>
          </ul>
        </section>

        <section>
          <h2>Advertising</h2>
          <p>
            Separately from affiliate links, {siteConfig.name} may show ads from Google AdSense.
            See our{" "}
            <Link href="/privacy" className="text-brand-mid underline">
              privacy policy
            </Link>{" "}
            for how advertising and cookies work.
          </p>
        </section>

        <section>
          <h2>Questions or corrections</h2>
          <p>
            Our{" "}
            <Link href="/editorial" className="text-brand-mid underline">
              editorial standards
            </Link>{" "}
            apply to every story. If you have a question about a recommendation, or spot an
            error, use the{" "}
            <Link href="/contact" className="text-brand-mid underline">
              contact form
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
