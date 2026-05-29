import { SocialIconLinks } from "@/components/SocialIcons";
import { youtubeEmbedUrl, youtubeWatchUrlFromId } from "@/lib/youtube-id";
import { youtubeWatchUrl } from "@/lib/youtube";

type VideoPlayerProps = {
  videoId: string;
  title: string;
};

export function VideoPlayer({ videoId, title }: VideoPlayerProps) {
  const embedUrl = youtubeEmbedUrl(videoId);
  const watchUrl = youtubeWatchUrlFromId(videoId) ?? youtubeWatchUrl(videoId);

  if (!embedUrl) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-brand-wash bg-brand-wash/50 p-8 text-center">
          <p className="text-ink-muted">
            This video could not be embedded. Open it on YouTube instead.
          </p>
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-4 inline-flex"
          >
            Open on YouTube
          </a>
        </div>
        <SocialIconLinks variant="inline" />
      </div>
    );
  }

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
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-lg bg-[#ff0000] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Open on YouTube
        </a>
        <SocialIconLinks variant="inline" />
      </div>
    </div>
  );
}
