import type { Metadata } from "next";
import Link from "next/link";
import { FaqSection } from "@/components/FaqSection";
import { InstagramFeed } from "@/components/InstagramFeed";
import { JsonLd } from "@/components/JsonLd";
import { SocialLinks } from "@/components/SocialLinks";
import { SocialInlineLink } from "@/components/SocialIcons";
import { siteConfig } from "@/lib/config";
import { buildFaqJsonLd } from "@/lib/seo";

const socialFaqs = [
  {
    question: "What is SeeStew's YouTube channel?",
    answer: "youtube.com/@SeeStew — long-form American history and politics documentaries.",
  },
  {
    question: "What is the Instagram handle?",
    answer: "instagram.com/see.stew — short reels on presidents, scandals, and major events.",
  },
  {
    question: "What is the TikTok handle?",
    answer: "tiktok.com/@see.stew — quick history clips, often tied to the same stories on YouTube.",
  },
];

export const metadata: Metadata = {
  title: "Follow SeeStew — YouTube, Instagram, TikTok",
  description:
    "Official SeeStew links: YouTube @SeeStew, Instagram @see.stew, TikTok @see.stew. Watch documentaries and shorts.",
  alternates: { canonical: `${siteConfig.url}/social` },
};

export default function SocialPage() {
  return (
    <div className="page-shell">
      <JsonLd data={buildFaqJsonLd(socialFaqs)} />

      <header className="mb-10 max-w-2xl">
        <h1 className="font-heading text-4xl font-bold text-ink">Follow SeeStew</h1>
        <p className="mt-3 text-lg text-ink-muted">
          Pick a platform below. Documentaries live on YouTube; reels on Instagram and TikTok.
        </p>
      </header>

      <SocialLinks />

      <section className="mt-16 rounded-2xl border border-brand-wash bg-white p-8">
        <h2 className="font-heading text-2xl font-bold text-ink">Where to start</h2>
        <ul className="mt-6 space-y-4 text-ink-muted">
          <li>
            <strong className="text-ink">YouTube</strong> —{" "}
            <SocialInlineLink
              platform="youtube"
              href={siteConfig.social.youtubeSubscribeUrl}
            >
              @SeeStew
            </SocialInlineLink>{" "}
            for full episodes.
          </li>
          <li>
            <strong className="text-ink">This site</strong> —{" "}
            <Link href="/videos" className="text-brand-mid underline">
              Documentaries
            </Link>{" "}
            and{" "}
            <Link href="/shorts" className="text-brand-mid underline">
              Shorts
            </Link>{" "}
            play here with written notes.
          </li>
          <li>
            <strong className="text-ink">Instagram & TikTok</strong> — @see.stew for daily clips that
            point back to the longer videos.
          </li>
        </ul>
      </section>

      <div className="mt-16">
        <InstagramFeed />
      </div>

      <FaqSection faqs={socialFaqs} title="Quick answers" />

      <p className="mt-12 text-center">
        <Link href="/articles" className="btn-primary">
          Read hard-to-believe true stories →
        </Link>
      </p>
    </div>
  );
}
