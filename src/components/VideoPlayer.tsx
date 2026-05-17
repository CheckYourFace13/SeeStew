import { siteConfig } from "@/lib/config";
import { youtubeWatchUrl } from "@/lib/youtube";

type VideoPlayerProps = {
  videoId: string;
  title: string;
};

export function VideoPlayer({ videoId, title }: VideoPlayerProps) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  const watchUrl = youtubeWatchUrl(videoId);

  return (
    <div className="space-y-4">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-brand-dark shadow-lg">
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-lg bg-[#ff0000] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Open on YouTube
        </a>
        <a
          href={siteConfig.social.youtubeSubscribe}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-lg border border-brand-wash px-4 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-wash"
        >
          Subscribe
        </a>
        <a
          href={siteConfig.social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-lg border border-brand-wash px-4 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-wash"
        >
          Instagram
        </a>
        <a
          href={siteConfig.social.tiktok}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-lg border border-brand-wash px-4 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-wash"
        >
          TikTok
        </a>
      </div>
    </div>
  );
}
