"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { YouTubeVideo } from "@/lib/youtube";
import { youtubeEmbedUrl } from "@/lib/youtube-id";

export function VideoCard({ video }: { video: YouTubeVideo }) {
  const [playing, setPlaying] = useState(false);
  const href =
    video.format === "short" ? `/shorts/${video.slug}` : `/videos/${video.slug}`;
  const embedUrl = youtubeEmbedUrl(video.id);

  return (
    <article className="group overflow-hidden rounded-xl border border-surface-muted bg-surface shadow-sm transition hover:border-brand-meteorite-light hover:shadow-md">
      <div className="relative aspect-video overflow-hidden bg-brand-dark">
        {playing && embedUrl ? (
          <iframe
            src={`${embedUrl}?autoplay=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="absolute inset-0"
            aria-label={`Play ${video.title}`}
          >
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
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/70 text-white">
                <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6" aria-hidden="true">
                  <path fill="currentColor" d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>
      <Link href={href} className="block p-4 text-left">
        <h3 className="font-heading text-lg font-semibold leading-snug text-brand-primary group-hover:text-nav-hover">
          {video.title}
        </h3>
        {video.description && (
          <p className="mt-2 line-clamp-2 text-sm text-ink-muted">
            {video.description.slice(0, 120)}
          </p>
        )}
        <p className="mt-3 text-sm font-medium text-brand-mid">
          {video.format === "short" ? "Open short →" : "Open video →"}
        </p>
      </Link>
    </article>
  );
}
