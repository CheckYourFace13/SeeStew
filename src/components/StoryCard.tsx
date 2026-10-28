import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/articles";
import { isQuickRead } from "@/lib/articles";
import { getHistoricalEra } from "@/lib/historical-eras";
import { resolveStoryImage } from "@/lib/story-images";

type StoryCardProps = {
  article: Article;
  youtubeThumbnail?: string;
  priority?: boolean;
  /** Override sizes when the card is featured / larger than the grid. */
  sizes?: string;
};

export function StoryCard({ article, youtubeThumbnail, priority, sizes }: StoryCardProps) {
  const image = resolveStoryImage(article, { youtubeThumbnail });
  const quick = isQuickRead(article);
  const era = article.historicalEra ? getHistoricalEra(article.historicalEra) : undefined;

  return (
    <article className="group overflow-hidden rounded-xl border border-surface-muted bg-surface shadow-sm transition hover:border-brand-meteorite-light hover:shadow-md">
      <Link href={`/articles/${article.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-brand-dark">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            sizes={
              sizes ??
              "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
            }
            priority={priority}
            unoptimized={image.isRemote && image.src.includes("loc.gov")}
          />
          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            <span className="rounded-md bg-brand-bright/95 px-2 py-0.5 text-xs font-medium text-white">
              {article.category}
            </span>
            {quick && (
              <span className="rounded-md bg-ink/90 px-2 py-0.5 text-xs font-medium text-white">
                Quick Read
              </span>
            )}
          </div>
        </div>
        <div className="p-4 text-left">
          <h3 className="font-heading text-lg font-semibold leading-snug text-brand-primary group-hover:text-nav-hover">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="mt-2 line-clamp-3 text-sm text-ink-muted">{article.excerpt}</p>
          )}
          <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-muted">
            <span>{article.readMinutes} min read</span>
            {era && <span>{era.shortTitle}</span>}
            {article.references && article.references.length > 0 && (
              <span>{article.references.length} sources</span>
            )}
          </p>
          <p className="mt-2 text-sm font-medium text-brand-mid">
            {quick ? "Quick read →" : "Read story →"}
          </p>
        </div>
      </Link>
    </article>
  );
}
