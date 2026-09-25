import type { Metadata } from "next";
import Link from "next/link";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { siteConfig } from "@/lib/config";
import { buildFaqJsonLd, siteFaqs } from "@/lib/seo";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about SeeStew: whether the stories are real, how often they publish, how sources and corrections work, and how articles, videos, and shorts connect.",
  alternates: { canonical: `${siteConfig.url}/faq` },
};

export default function FaqPage() {
  return (
    <div className="page-shell-narrow">
      <JsonLd data={buildFaqJsonLd(siteFaqs)} />
      <header className="mb-8">
        <h1 className="font-heading text-4xl font-bold text-ink">FAQ</h1>
        <p className="mt-3 text-ink-muted">
          Straightforward answers about SeeStew. For sourcing rules, see{" "}
          <Link href="/editorial" className="text-brand-mid underline">
            editorial standards
          </Link>
          . To report a mistake, use the{" "}
          <Link href="/contact" className="text-brand-mid underline">
            contact form
          </Link>
          .
        </p>
      </header>
      <FaqSection faqs={siteFaqs} title="Common questions" />
    </div>
  );
}
