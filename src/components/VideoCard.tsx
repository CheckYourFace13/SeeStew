import Image from "next/image";
import Link from "next/link";
import type { YouTubeVideo } from "@/lib/youtube";

export function VideoCard({ video }: { video: YouTubeVideo }) {
  const href =
    video.format === "short" ? `/shorts/${video.slug}` : `/videos/${video.slug}`;

  return (
    <article className="group overflow-hidden rounded-xl border border-surface-muted bg-surface shadow-sm transition hover:border-brand-meteorite-light hover:shadow-md">
      <Link href={href} className="block">
        <div className="relative aspect-video overflow-hidden bg-brand-dark">
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover transition group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <span className="absolute left-2 top-2 rounded-md bg-brand-bright px-2 py-0.5 text-xs font-medium text-white">
            {video.format === "short" ? "Short" : "Video"}
          </span>
        </div>
        <div className="p-4 text-left">
          <h3 className="font-heading text-lg font-semibold leading-snug text-brand-primary group-hover:text-nav-hover">
            {video.title}
          </h3>
          {video.description && (
            <p className="mt-2 line-clamp-2 text-sm text-ink-muted">
              {video.description.slice(0, 120)}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
