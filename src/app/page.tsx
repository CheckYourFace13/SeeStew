import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { Logo } from "@/components/Logo";
import { SocialLinks } from "@/components/SocialLinks";
import { PlatformIcon, SocialInlineLink } from "@/components/SocialIcons";
import { StoryCard } from "@/components/StoryCard";
import { VideoCard } from "@/components/VideoCard";
import { getAllArticles } from "@/lib/articles";
import { siteConfig } from "@/lib/config";
import { buildFaqJsonLd, homeFaqs } from "@/lib/seo";
import { getLongFormVideos, getShortFormVideos, getYouTubeVideos } from "@/lib/youtube";

/** Avoid year-long CDN HTML cache (Hostinger) that can serve broken/stale homepages after deploy. */
export const revalidate = 60;

export default async function HomePage() {
  const articles = getAllArticles().slice(0, 9);
  const longForm = (await getLongFormVideos()).slice(0, 3);
  const shorts = (await getShortFormVideos()).slice(0, 4);
  const videos = await getYouTubeVideos();
  const thumbByVideoId = new Map(videos.map((v) => [v.id, v.thumbnail]));
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <>
      <JsonLd data={buildFaqJsonLd(homeFaqs)} />

      <section className="border-b border-surface-muted bg-surface">
        <div className="container-page py-12 text-center md:py-16">
          <div className="flex justify-center">
            <Logo variant="hero" showText={false} />
          </div>
          <p className="mt-6 text-sm font-medium uppercase tracking-wide text-brand-bright">
            Hard-to-believe. Fully documented.
          </p>
          <h1 className="mt-4 font-heading text-4xl font-semibold text-brand-primary md:text-5xl lg:text-6xl">
            True American stories that sound made up
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-ink-muted md:text-lg">
            {siteConfig.description}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/articles" className="btn-primary">
              Read today&apos;s stories
            </Link>
            <Link href="/topics" className="btn-outline">
              Browse by topic
            </Link>
          </div>
        </div>
      </section>

      {articles.length > 0 && (
        <section className="section-pad">
          <div className="container-page">
            <div className="mb-8 max-w-3xl">
              <h2 className="font-heading text-3xl font-semibold text-brand-primary md:text-4xl">
                Latest unbelievable true stories
              </h2>
              <p className="mt-2 text-ink-muted">
                New researched articles land daily — disasters, scandals, near-misses, and
                forgotten chapters with named sources at the bottom of every piece.
              </p>
            </div>

            {featured && (
              <div className="mb-10 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-stretch">
                <StoryCard
                  article={featured}
                  youtubeThumbnail={
                    featured.relatedVideoId
                      ? thumbByVideoId.get(featured.relatedVideoId)
                      : undefined
                  }
                  priority
                />
                <div className="flex flex-col justify-center rounded-xl border border-surface-muted bg-brand-wash/40 p-6 md:p-8">
                  <h3 className="font-heading text-2xl font-semibold text-brand-primary">
                    Why these stories exist
                  </h3>
                  <p className="mt-3 text-ink-muted">
                    SeeStew is built for the American past that gets skipped in survey courses —
                    events so strange they feel fictional, but every claim is grounded in archives,
                    museums, and primary records.
                  </p>
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-ink-muted">
                    <li>Original long-form articles, not scraped summaries</li>
                    <li>Named, linked sources on every story</li>
                    <li>Daily publishing of hard-to-believe documented history</li>
                  </ul>
                  <p className="mt-6">
                    <Link href="/editorial" className="link-nav text-sm font-medium">
                      Read our editorial standards →
                    </Link>
                  </p>
                </div>
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((article, i) => (
                <StoryCard
                  key={article.slug}
                  article={article}
                  youtubeThumbnail={
                    article.relatedVideoId
                      ? thumbByVideoId.get(article.relatedVideoId)
                      : undefined
                  }
                  priority={i < 2}
                />
              ))}
            </div>

            <p className="mt-8 text-center">
              <Link href="/articles" className="btn-primary">
                All stories →
              </Link>
            </p>
          </div>
        </section>
      )}

      {/* Ads only after substantial original story content */}
      <AdSlot className="container-page" format="horizontal" />

      <section className="section-pad section-muted">
        <div className="container-page">
          <h2 className="font-heading text-3xl font-semibold text-brand-primary">
            Watch the deeper cut
          </h2>
          <p className="mt-2 max-w-2xl text-ink-muted">
            Prefer video? Long-form documentaries expand the same researched stories on{" "}
            <SocialInlineLink platform="youtube" className="link-nav !font-medium">
              @SeeStew
            </SocialInlineLink>
            .
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {longForm.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
          <p className="mt-8 text-center">
            <Link href="/videos" className="link-nav text-sm font-medium">
              View all videos →
            </Link>
          </p>
        </div>
      </section>

      {shorts.length > 0 && (
        <section className="section-pad">
          <div className="container-page">
            <h2 className="font-heading text-3xl font-semibold text-brand-primary">
              Quick hits
            </h2>
            <p className="mt-2 text-ink-muted">
              Short clips of the same hard-to-believe history — then come back for the full written
              story.
            </p>
            <div className="mt-8 flex gap-4 overflow-x-auto pb-2">
              {shorts.map((video) => (
                <div key={video.id} className="w-64 shrink-0">
                  <VideoCard video={video} />
                </div>
              ))}
            </div>
            <p className="mt-6 text-center">
              <Link href="/shorts" className="link-nav text-sm font-medium">
                All shorts →
              </Link>
            </p>
          </div>
        </section>
      )}

      <section className="section-pad section-muted">
        <div className="container-page">
          <h2 className="text-center font-heading text-3xl font-semibold text-brand-primary">
            Follow SeeStew
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-ink-muted">
            Daily stories here. Long episodes and clips on YouTube, Instagram, TikTok, and Facebook.
          </p>
          <div className="mt-10">
            <SocialLinks />
          </div>
          <p className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
            <a
              href={siteConfig.social.youtubeSubscribeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline inline-flex items-center gap-2"
            >
              <PlatformIcon platform="youtube" className="h-5 w-5" />
              <span>@SeeStew on YouTube</span>
            </a>
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page">
          <FaqSection faqs={homeFaqs} title="Common questions" />
        </div>
      </section>
    </>
  );
}
