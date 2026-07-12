import type { Metadata } from "next";
import Link from "next/link";
import { SocialLinks } from "@/components/SocialLinks";
import { SocialInlineLink } from "@/components/SocialIcons";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "About SeeStew",
  description:
    "SeeStew publishes hard-to-believe true American history stories daily — researched articles with named sources, plus companion videos.",
  alternates: { canonical: `${siteConfig.url}/about` },
};

export default function AboutPage() {
  return (
    <div className="page-shell-narrow">
      <h1 className="font-heading text-4xl font-bold text-ink">About SeeStew</h1>
      <div className="prose-history mt-8">
        <p>
          SeeStew is built for one kind of American history: the hard-to-believe true story.
          Disasters that sound invented. Scandals that get skipped in survey courses. Near-misses
          and forgotten chapters that only make sense once you see the documents.
        </p>
        <p>
          The heart of the site is original researched writing on{" "}
          <Link href="/articles">Stories</Link> — long articles with named, linked sources. We also
          publish companion documentaries on{" "}
          <SocialInlineLink platform="youtube">YouTube</SocialInlineLink> and short clips on{" "}
          <SocialInlineLink platform="instagram">Instagram</SocialInlineLink> and{" "}
          <SocialInlineLink platform="tiktok">TikTok</SocialInlineLink>, so you can read the full
          account or watch the deeper cut.
        </p>
        <h2>What we publish</h2>
        <p>
          Presidents, scandals, wars, riots, spies, industrial disasters, and the strange corners
          of the American past. If it sounds made up but is documented, we are interested. New
          stories land regularly — often daily — so the archive keeps growing.
        </p>
        <h2>How we work</h2>
        <p>
          Every story lists sources at the bottom. We do not invent quotes, dates, or statistics.
          Corrections are welcome through the{" "}
          <Link href="/contact" className="text-brand-mid underline">
            contact form
          </Link>
          . Read our{" "}
          <Link href="/editorial" className="text-brand-mid underline">
            editorial standards
          </Link>{" "}
          for sourcing, review, and how advertising works on this site.
        </p>
        <h2>Start here</h2>
        <ul>
          <li>
            <Link href="/articles">Latest stories</Link> — the written archive
          </li>
          <li>
            <Link href="/topics">Topics</Link> — browse by subject
          </li>
          <li>
            <Link href="/videos">Videos</Link> — long-form companion episodes
          </li>
        </ul>
      </div>
      <div className="mt-12">
        <SocialLinks compact />
      </div>
    </div>
  );
}
