import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/articles";
import { resolveStoryImage } from "@/lib/story-images";

type StoryCardProps = {
  article: Article;
  youtubeThumbnail?: string;
  priority?: boolean;
};

export function StoryCard({ article, youtubeThumbnail, priority }: StoryCardProps) {
  const image = resolveStoryImage(article, { youtubeThumbnail });

  return (
    <article className="group overflow-hidden rounded-xl border border-surface-muted bg-surface shadow-sm transition hover:border-brand-meteorite-light hover:shadow-md">
      <Link href={`/articles/${article.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-brand-dark">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            unoptimized={image.isRemote && image.src.includes("loc.gov")}
          />
          <span className="absolute left-2 top-2 rounded-md bg-brand-bright/95 px-2 py-0.5 text-xs font-medium text-white">
            {article.category}
          </span>
        </div>
        <div className="p-4 text-left">
          <h3 className="font-heading text-lg font-semibold leading-snug text-brand-primary group-hover:text-nav-hover">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="mt-2 line-clamp-3 text-sm text-ink-muted">{article.excerpt}</p>
          )}
          <p className="mt-3 text-sm font-medium text-brand-mid">Read story →</p>
        </div>
      </Link>
    </article>
  );
}
