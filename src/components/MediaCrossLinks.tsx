import Link from "next/link";
import type { Article } from "@/lib/articles";
import type { YouTubeVideo } from "@/lib/youtube";

type Props = {
  relatedArticles?: Article[];
  relatedLongVideos?: YouTubeVideo[];
  relatedShorts?: YouTubeVideo[];
  /** Current page format so CTAs stay specific. */
  kind: "video" | "short";
};

export function MediaCrossLinks({
  relatedArticles = [],
  relatedLongVideos = [],
  relatedShorts = [],
  kind,
}: Props) {
  const story = relatedArticles[0];
  const fullVideo = relatedLongVideos[0];
  const shorts = relatedShorts.slice(0, 3);
  const moreVideos = relatedLongVideos.slice(kind === "video" ? 1 : 0, kind === "video" ? 4 : 3);

  if (!story && !fullVideo && shorts.length === 0 && moreVideos.length === 0) {
    return (
      <nav className="mt-10 text-sm text-ink-muted" aria-label="SeeStew library">
        <Link href="/articles" className="text-brand-mid underline">
          Read the researched stories
        </Link>
        {" · "}
        <Link href="/videos" className="text-brand-mid underline">
          Videos
        </Link>
        {" · "}
        <Link href="/shorts" className="text-brand-mid underline">
          Shorts
        </Link>
      </nav>
    );
  }

  return (
    <nav
      className="mt-10 rounded-xl border border-brand-wash bg-brand-wash/40 p-6"
      aria-label="Related SeeStew content"
    >
      <h2 className="font-heading text-lg font-bold text-ink">Continue this story</h2>
      <ul className="mt-4 space-y-3 text-sm">
        {story && (
          <li>
            <Link href={`/articles/${story.slug}`} className="font-semibold text-brand-mid underline">
              Read the story: {story.title}
            </Link>
          </li>
        )}
        {kind === "short" && fullVideo && (
          <li>
            <Link href={`/videos/${fullVideo.slug}`} className="font-semibold text-brand-mid underline">
              Watch the full story: {fullVideo.title}
            </Link>
          </li>
        )}
        {kind === "video" && shorts.map((clip) => (
          <li key={clip.id}>
            <Link href={`/shorts/${clip.slug}`} className="text-brand-mid underline">
              Related short: {clip.title}
            </Link>
          </li>
        ))}
      </ul>
      {(moreVideos.length > 0 || (kind === "video" && shorts.length === 0)) && (
        <p className="mt-4 text-sm text-ink-muted">
          Browse the library:{" "}
          <Link href="/videos" className="text-brand-mid underline">
            Videos
          </Link>
          {" · "}
          <Link href="/shorts" className="text-brand-mid underline">
            Shorts
          </Link>
          {" · "}
          <Link href="/articles" className="text-brand-mid underline">
            Stories
          </Link>
        </p>
      )}
    </nav>
  );
}
