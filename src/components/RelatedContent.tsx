import Link from "next/link";
import type { Article } from "@/lib/articles";
import type { YouTubeVideo } from "@/lib/youtube";

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
  const stories = relatedStories.filter((a) => a.slug !== currentSlug).slice(0, 3);

  if (stories.length === 0 && relatedVideos.length === 0) return null;

  return (
    <nav
      className="mt-12 rounded-xl border border-brand-wash bg-brand-wash/40 p-6"
      aria-label="Related SeeStew content"
    >
      <h2 className="font-heading text-lg font-bold text-ink">Explore more</h2>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        {stories.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-brand-primary">More stories</p>
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
          <p className="text-sm font-semibold text-brand-primary">Videos & clips</p>
          <ul className="mt-2 space-y-2 text-sm text-ink-muted">
            {relatedVideos.slice(0, 3).map((v) => (
              <li key={v.id}>
                <Link
                  href={v.format === "short" ? `/shorts/${v.slug}` : `/videos/${v.slug}`}
                  className="text-brand-mid underline"
                >
                  {v.title}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/videos" className="text-brand-mid underline">
                Videos →
              </Link>
            </li>
            <li>
              <Link href="/shorts" className="text-brand-mid underline">
                Shorts →
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

