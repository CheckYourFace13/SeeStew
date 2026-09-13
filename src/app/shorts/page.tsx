import type { Metadata } from "next";
import Link from "next/link";
import { SocialInlineLink } from "@/components/SocialIcons";
import { VideoIndexCard } from "@/components/VideoIndexCard";
import { getAllArticles } from "@/lib/articles";
import { siteConfig } from "@/lib/config";
import { relatedArticlesForVideo, relatedVideosForVideo } from "@/lib/related";
import { getLongFormVideos, getShortFormVideos } from "@/lib/youtube";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "American History Shorts",
  description:
    "SeeStew YouTube Shorts only — quick companion clips for researched American history stories. Watch the full episode or read the article when a match exists.",
  alternates: { canonical: `${siteConfig.url}/shorts` },
};

export default async function ShortsPage() {
  const shorts = await getShortFormVideos();
  const articles = getAllArticles();
  const longForm = await getLongFormVideos();

  return (
    <div className="page-shell">
      <header className="mb-10 max-w-2xl">
        <h1 className="font-heading text-4xl font-bold text-ink">History shorts</h1>
        <p className="mt-3 text-lg text-ink-muted">
          YouTube Shorts from{" "}
          <SocialInlineLink platform="youtube" href={siteConfig.social.youtubeShortsUrl}>
            @SeeStew
          </SocialInlineLink>
          . This page is clips only — under a minute, not full documentaries. Play a short, then
          follow a real match to the{" "}
          <Link href="/articles" className="text-brand-mid underline">
            written story
          </Link>{" "}
          or a{" "}
          <Link href="/videos" className="text-brand-mid underline">
            full-length episode
          </Link>{" "}
          when one exists.
        </p>
      </header>

      {shorts.length === 0 ? (
        <p className="mt-10 text-ink-muted">
          Shorts are loading from the SeeStew channel.{" "}
          <Link href="/articles" className="text-brand-mid underline">
            Prefer to read?
          </Link>
        </p>
      ) : (
        <div className="mt-10 grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {shorts.map((video) => {
            const relatedArticle = relatedArticlesForVideo(video, articles)[0];
            const relatedLong = relatedVideosForVideo(video, longForm, "long")[0];
            return (
              <div key={video.id}>
                <VideoIndexCard video={video} relatedArticle={relatedArticle} />
                {relatedLong && (
                  <p className="mt-2 px-1 text-sm">
                    <Link
                      href={`/videos/${relatedLong.slug}`}
                      className="text-brand-mid underline"
                    >
                      Watch the full story: {relatedLong.title}
                    </Link>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
