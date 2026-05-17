import Image from "next/image";
import type { Article } from "@/lib/articles";
import { resolveStoryImage } from "@/lib/story-images";

export function StoryHero({
  article,
  youtubeThumbnail,
}: {
  article: Article;
  youtubeThumbnail?: string;
}) {
  const image = resolveStoryImage(article, { youtubeThumbnail });
  const heroSrc =
    article.image?.hero && article.image.hero.startsWith("/")
      ? article.image.hero
      : image.src;

  return (
    <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-xl bg-brand-dark">
      <Image
        src={heroSrc}
        alt={image.alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 720px"
        priority
        unoptimized={image.isRemote && heroSrc.includes("loc.gov")}
      />
      {image.credit && (
        <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3 text-xs text-white/90">
          Image: {image.credit}
          {image.sourcePageUrl && (
            <>
              {" · "}
              <a
                href={image.sourcePageUrl}
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Source
              </a>
            </>
          )}
        </p>
      )}
    </div>
  );
}
