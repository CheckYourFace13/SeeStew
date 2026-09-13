import Link from "next/link";
import { VideoCard } from "@/components/VideoCard";
import { categoryToSlug } from "@/lib/topic-seo";
import { getVideoSummary } from "@/lib/video-editorial";
import type { Article } from "@/lib/articles";
import type { YouTubeVideo } from "@/lib/youtube";

type Props = {
  video: YouTubeVideo;
  relatedArticle?: Article;
};

export function VideoIndexCard({ video, relatedArticle }: Props) {
  const summary = getVideoSummary(video);
  const topicHref = relatedArticle
    ? `/topics/${categoryToSlug(relatedArticle.category)}`
    : undefined;

  return (
    <article className="flex flex-col">
      <VideoCard video={video} />
      <div className="mt-3 space-y-2 px-1 text-sm text-ink-muted">
        <p>{summary}</p>
        {relatedArticle ? (
          <p>
            <Link
              href={`/articles/${relatedArticle.slug}`}
              className="font-medium text-brand-mid underline"
            >
              Read the story: {relatedArticle.title}
            </Link>
            {topicHref && (
              <>
                {" · "}
                <Link href={topicHref} className="text-brand-mid underline">
                  {relatedArticle.category}
                </Link>
              </>
            )}
          </p>
        ) : (
          <p>
            <Link href="/articles" className="text-brand-mid underline">
              Prefer to read?
            </Link>
            {" · "}
            {video.format === "short" ? (
              <Link href="/videos" className="text-brand-mid underline">
                Watch the full story
              </Link>
            ) : (
              <Link href="/shorts" className="text-brand-mid underline">
                Prefer quick clips?
              </Link>
            )}
          </p>
        )}
      </div>
    </article>
  );
}
