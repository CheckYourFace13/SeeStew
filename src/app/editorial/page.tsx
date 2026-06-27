import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Editorial Standards",
  description:
    "How SeeStew researches, writes, and corrects American history stories — sourcing, accuracy, and updates.",
  alternates: { canonical: `${siteConfig.url}/editorial` },
};

export default function EditorialPage() {
  return (
    <div className="page-shell-narrow">
      <h1 className="font-heading text-4xl font-bold text-ink">Editorial Standards</h1>
      <p className="mt-2 text-sm text-ink-muted">Last updated: May 26, 2026</p>

      <div className="prose-history mt-8 space-y-6">
        <section>
          <h2>What we publish</h2>
          <p>
            SeeStew publishes researched articles and video documentaries about documented events in
            American history and politics. Every story on {siteConfig.url} is written for a general
            audience and grounded in named, linked sources.
          </p>
        </section>

        <section>
          <h2>Research and sourcing</h2>
          <ul>
            <li>
              Articles cite primary and secondary sources — federal archives, museums, academic
              publishers, and established news organizations — listed at the bottom of each story.
            </li>
            <li>
              Inline citation markers in the body correspond to those sources. We do not invent
              quotes, dates, or statistics.
            </li>
            <li>
              Images come from public archives (such as the Library of Congress) when available, with
              credit and source links on the story page.
            </li>
          </ul>
        </section>

        <section>
          <h2>Human review</h2>
          <p>
            Stories are drafted, expanded, and checked against our source list before publication.
            Topics are chosen for historical significance and documented evidence, not for
            clickbait alone.
          </p>
        </section>

        <section>
          <h2>Corrections</h2>
          <p>
            If you spot a factual error, use the{" "}
            <Link href="/contact" className="text-brand-mid underline">
              contact form
            </Link>
            . We review correction requests promptly and update articles when we verify a mistake.
            Significant corrections are noted in the article when appropriate.
          </p>
        </section>

        <section>
          <h2>Advertising</h2>
          <p>
            SeeStew displays ads through Google AdSense. Advertising does not influence which
            stories we publish or how we report them. See our{" "}
            <Link href="/privacy" className="text-brand-mid underline">
              Privacy Policy
            </Link>{" "}
            for how ads and cookies work on this site.
          </p>
        </section>

        <section>
          <h2>About the channel</h2>
          <p>
            Learn more on our{" "}
            <Link href="/about" className="text-brand-mid underline">
              About
            </Link>{" "}
            page and watch long-form episodes on{" "}
            <Link href="/videos" className="text-brand-mid underline">
              Videos
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
