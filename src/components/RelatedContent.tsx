import Link from "next/link";
import type { Article } from "@/lib/articles";
import type { YouTubeVideo } from "@/lib/youtube";
import { splitRelatedMedia } from "@/lib/related";

type Props = {
  category: string;
  currentSlug: string;
  relatedStories: Article[];
  relatedVideos?: YouTubeVideo[];
};

export function RelatedContent({
  category,
  currentSlug,
  relatedStories,
  relatedVideos = [],
}: Props) {
  const topicSlug = category.toLowerCase().replace(/\s+/g, "-");
  const stories = relatedStories.filter((a) => a.slug !== currentSlug).slice(0, 4);
  const { long, shorts } = splitRelatedMedia(relatedVideos);
  const watchNext = long.slice(0, 3);
  const relatedShorts = shorts.slice(0, 3);

  if (stories.length === 0 && watchNext.length === 0 && relatedShorts.length === 0) {
    return (
      <nav
        className="mt-12 rounded-xl border border-brand-wash bg-brand-wash/40 p-6"
        aria-label="SeeStew library"
      >
        <h2 className="font-heading text-lg font-bold text-ink">Keep exploring</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link href="/videos" className="text-brand-mid underline">
              Videos
            </Link>
          </li>
          <li>
            <Link href="/shorts" className="text-brand-mid underline">
              Shorts
            </Link>
          </li>
          <li>
            <Link href={`/topics/${topicSlug}`} className="text-brand-mid underline">
              More {category} stories
            </Link>
          </li>
        </ul>
      </nav>
    );
  }

  return (
    <nav
      className="mt-12 rounded-xl border border-brand-wash bg-brand-wash/40 p-6"
      aria-label="Related SeeStew content"
    >
      <h2 className="font-heading text-lg font-bold text-ink">Related stories and videos</h2>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        {stories.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-brand-primary">Related stories</p>
            <ul className="mt-2 space-y-2 text-sm">
              {stories.map((a) => (
                <li key={a.slug}>
                  <Link href={`/articles/${a.slug}`} className="text-brand-mid underline">
                    {a.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={`/topics/${topicSlug}`} className="text-brand-mid underline">
                  All {category} stories →
                </Link>
              </li>
            </ul>
          </div>
        )}
        <div>
          {watchNext.length > 0 && (
            <>
              <p className="text-sm font-semibold text-brand-primary">Watch next</p>
              <ul className="mt-2 space-y-2 text-sm">
                {watchNext.map((v) => (
                  <li key={v.id}>
                    <Link href={`/videos/${v.slug}`} className="text-brand-mid underline">
                      {v.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
          {relatedShorts.length > 0 && (
            <>
              <p className={`text-sm font-semibold text-brand-primary ${watchNext.length > 0 ? "mt-4" : ""}`}>
                Related shorts
              </p>
              <ul className="mt-2 space-y-2 text-sm">
                {relatedShorts.map((v) => (
                  <li key={v.id}>
                    <Link href={`/shorts/${v.slug}`} className="text-brand-mid underline">
                      {v.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/videos" className="text-brand-mid underline">
                All videos →
              </Link>
            </li>
            <li>
              <Link href="/shorts" className="text-brand-mid underline">
                All shorts →
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
