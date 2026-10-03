"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  videoId: string;
  title: string;
  embedUrl: string;
};

/**
 * Click-to-load YouTube embed. The heavy YouTube iframe (and its third-party scripts and
 * cookies) is not requested until the visitor presses play; until then this is just a
 * lazily loaded thumbnail, which keeps pages fast and avoids loading YouTube for readers
 * who only want the article.
 */
export function YouTubeFacade({ videoId, title, embedUrl }: Props) {
  const [active, setActive] = useState(false);

  if (active) {
    return (
      <iframe
        src={`${embedUrl}?autoplay=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      className="group absolute inset-0 h-full w-full cursor-pointer"
      aria-label={`Play video: ${title}`}
    >
      <Image
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 720px"
        className="object-cover"
        loading="lazy"
      />
      <span className="absolute inset-0 bg-black/20 transition group-hover:bg-black/10" />
      <span
        className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#ff0000] shadow-lg"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-white">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </button>
  );
}
