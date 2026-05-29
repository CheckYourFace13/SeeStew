import type { Metadata } from "next";
import Link from "next/link";
import { SocialLinks } from "@/components/SocialLinks";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "About SeeStew",
  description:
    "SeeStew makes American history and politics videos for YouTube, Instagram, and TikTok.",
  alternates: { canonical: `${siteConfig.url}/about` },
};

export default function AboutPage() {
  return (
    <div className="page-shell-narrow">
      <h1 className="font-heading text-4xl font-bold text-ink">About SeeStew</h1>
      <div className="prose-history mt-8">
        <p>
          SeeStew is a history channel built around American politics and the stories that get
          skipped in survey courses. We put out long documentaries on{" "}
          <a
            href={siteConfig.social.youtube}
            target="_blank"
            rel="noopener noreferrer"
          >
            YouTube
          </a>
          , shorter clips on{" "}
          <a
            href={siteConfig.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>{" "}
          and{" "}
          <a
            href={siteConfig.social.tiktok}
            target="_blank"
            rel="noopener noreferrer"
          >
            TikTok
          </a>
          , and written pieces here on seestew.com.
        </p>
        <h2>What we cover</h2>
        <p>
          Presidents, wars, colonial fights, scandals, reformers, and odd corners of the archive.
          The goal is simple: name the people involved, show the sequence of events, and say why it
          still gets argued about.
        </p>
        <h2>Watch here or on YouTube</h2>
        <p>
          Videos on this site use the same uploads as the channel. If you want the algorithm to
          pick up the next release, subscribe on YouTube. If you want the write-up, read the{" "}
          <Link href="/articles">stories</Link> or the notes under each{" "}
          <Link href="/videos">documentary</Link>.
        </p>
        <h2>Contact</h2>
        <p>
          Use the{" "}
          <Link href="/contact" className="text-brand-mid underline">
            contact form
          </Link>{" "}
          for press, corrections, and partnerships. We do not publish a public inbox.
        </p>
      </div>
      <div className="mt-12">
        <SocialLinks compact />
      </div>
    </div>
  );
}
