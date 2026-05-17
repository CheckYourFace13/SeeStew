import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { FaqSection } from "@/components/FaqSection";
import { InstagramFeed } from "@/components/InstagramFeed";
import { JsonLd } from "@/components/JsonLd";
import { Logo } from "@/components/Logo";
import { SocialLinks } from "@/components/SocialLinks";
import { VideoCard } from "@/components/VideoCard";
import { getAllArticles } from "@/lib/articles";
import { siteConfig } from "@/lib/config";
import { buildFaqJsonLd, homeFaqs } from "@/lib/seo";
import { getLongFormVideos, getShortFormVideos } from "@/lib/youtube";

export default async function HomePage() {
  const longForm = (await getLongFormVideos()).slice(0, 6);
  const shorts = (await getShortFormVideos()).slice(0, 8);
  const articles = getAllArticles().slice(0, 3);

  return (
    <>
      <JsonLd data={buildFaqJsonLd(homeFaqs)} />

      {/* Hero — white background like live site */}
      <section className="border-b border-surface-muted bg-surface text-center">
        <div className="container-page py-12 md:py-16">
          <div className="flex justify-center">
            <Logo variant="hero" showText={false} />
          </div>
          <p className="mt-6 text-brand-warning" aria-label="5 star rating">
            ★★★★★
          </p>
          <h1 className="mt-4 font-heading text-4xl font-semibold text-brand-primary md:text-5xl lg:text-6xl">
            Explore America&apos;s Untold Stories
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-ink-muted md:text-lg">
            {siteConfig.description}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/videos" className="btn-primary">
              Watch documentaries
            </Link>
            <a
              href={siteConfig.social.youtubeSubscribe}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              Subscribe on YouTube
            </a>
          </div>
        </div>
      </section>

      <AdSlot className="container-page" format="horizontal" />

      <section className="section-pad">
        <div className="container-page">
          <h2 className="font-heading text-3xl font-semibold text-brand-primary md:text-4xl">
            Videos of American History
          </h2>
          <p className="mt-2 max-w-2xl text-ink-muted">
            Long-form episodes from{" "}
            <a
              href={siteConfig.social.youtube}
              className="link-nav font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              @SeeStew on YouTube
            </a>
            . Watch here or on the channel.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {longForm.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
          <p className="mt-8 text-center">
            <Link href="/videos" className="link-nav text-sm font-medium">
              View all documentaries →
            </Link>
          </p>
        </div>
      </section>

      {shorts.length > 0 && (
        <section className="section-pad section-muted">
          <div className="container-page">
            <h2 className="font-heading text-3xl font-semibold text-brand-primary">
              Short clips
            </h2>
            <p className="mt-2 text-ink-muted">
              From{" "}
              <a
                href={siteConfig.social.youtubeShorts}
                className="link-nav font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                YouTube Shorts
              </a>
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

      <section className="section-pad">
        <div className="container-page">
          <InstagramFeed />
        </div>
      </section>

      <section className="section-pad section-muted">
        <div className="container-page">
          <h2 className="text-center font-heading text-3xl font-semibold text-brand-primary">
            Connect with SeeStew
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-ink-muted">
            YouTube, Instagram, TikTok, and Facebook
          </p>
          <div className="mt-10">
            <SocialLinks />
          </div>
        </div>
      </section>

      {articles.length > 0 && (
        <section className="section-pad">
          <div className="container-page">
            <h2 className="font-heading text-3xl font-semibold text-brand-primary">
              Stories of American History
            </h2>
            <p className="mt-2 text-ink-muted">
              Sourced articles to read with our videos.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {articles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}`}
                  className="rounded-xl border border-surface-muted bg-surface p-6 shadow-sm transition hover:border-brand-meteorite-light hover:shadow-md"
                >
                  <span className="text-xs font-medium uppercase text-brand-bright">
                    {article.category}
                  </span>
                  <h3 className="mt-2 font-heading text-xl font-semibold text-brand-primary">
                    {article.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm text-ink-muted">
                    {article.excerpt}
                  </p>
                </Link>
              ))}
            </div>
            <p className="mt-8">
              <Link href="/articles" className="link-nav text-sm font-medium">
                All articles →
              </Link>
            </p>
          </div>
        </section>
      )}

      <section className="section-pad section-muted">
        <div className="container-page">
          <FaqSection faqs={homeFaqs} title="Common questions" />
        </div>
      </section>
    </>
  );
}
