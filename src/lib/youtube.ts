import { youtubeConfig } from "./config";

export type VideoFormat = "long" | "short";

export type YouTubeVideo = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  slug: string;
  format: VideoFormat;
  durationSeconds: number;
};

const FALLBACK_VIDEOS: YouTubeVideo[] = [
  {
    id: "BrNGqid8_tY",
    title: "Teddy Roosevelt: Big Stick Diplomacy",
    description:
      "Theodore Roosevelt and how Big Stick Diplomacy reshaped American foreign policy.",
    thumbnail: "https://i.ytimg.com/vi/BrNGqid8_tY/hqdefault.jpg",
    slug: "teddy-roosevelt-big-stick-diplomacy",
    format: "long",
    durationSeconds: 600,
  },
  {
    id: "mLuyPuMyVMc",
    title: "René Goulaine de Laudonnière — Fort Caroline",
    description:
      "French Florida, Fort Caroline, and the colonial fight with Spain.",
    thumbnail: "https://i.ytimg.com/vi/mLuyPuMyVMc/hqdefault.jpg",
    slug: "rene-laudonniere-fort-caroline",
    format: "long",
    durationSeconds: 480,
  },
  {
    id: "HCzHfSU_95E",
    title: "Antonio Pigafetta — Magellan's Chronicler",
    description:
      "Pigafetta's account of the first circumnavigation of the globe.",
    thumbnail: "https://i.ytimg.com/vi/HCzHfSU_95E/hqdefault.jpg",
    slug: "antonio-pigafetta-magellan",
    format: "long",
    durationSeconds: 420,
  },
];

function slugify(title: string, id: string): string {
  const base = title
    .toLowerCase()
    .replace(/#shorts/gi, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return base || id;
}

function parseIsoDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (
    parseInt(m[1] ?? "0", 10) * 3600 +
    parseInt(m[2] ?? "0", 10) * 60 +
    parseInt(m[3] ?? "0", 10)
  );
}

function classifyFormat(
  durationSeconds: number,
  title: string,
  description: string
): VideoFormat {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes("#shorts") || text.includes("youtube short")) {
    return "short";
  }
  if (durationSeconds > 0 && durationSeconds <= youtubeConfig.shortFormMaxSeconds) {
    return "short";
  }
  if (durationSeconds >= youtubeConfig.longFormMinSeconds) {
    return "long";
  }
  if (durationSeconds > youtubeConfig.shortFormMaxSeconds) {
    return "long";
  }
  return "short";
}

async function getUploadsPlaylistId(
  channelId: string,
  apiKey: string
): Promise<string | null> {
  const params = new URLSearchParams({
    part: "contentDetails",
    id: channelId,
    key: apiKey,
  });
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?${params}`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    items?: Array<{ contentDetails: { relatedPlaylists: { uploads: string } } }>;
  };
  return data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? null;
}

async function fetchFromYouTubeApi(
  channelId: string,
  apiKey: string
): Promise<YouTubeVideo[]> {
  const playlistId = await getUploadsPlaylistId(channelId, apiKey);
  if (!playlistId) return [];

  const playlistParams = new URLSearchParams({
    part: "snippet,contentDetails",
    playlistId,
    maxResults: "50",
    key: apiKey,
  });
  const playlistRes = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?${playlistParams}`,
    { next: { revalidate: 1800 } }
  );
  if (!playlistRes.ok) return [];

  const playlistData = (await playlistRes.json()) as {
    items?: Array<{
      snippet: {
        title: string;
        description: string;
        resourceId: { videoId: string };
        thumbnails: { high?: { url: string }; medium?: { url: string } };
      };
    }>;
  };

  const ids = (playlistData.items ?? [])
    .map((i) => i.snippet.resourceId.videoId)
    .filter(Boolean);

  if (ids.length === 0) return [];

  const videoParams = new URLSearchParams({
    part: "snippet,contentDetails",
    id: ids.join(","),
    key: apiKey,
  });
  const videoRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?${videoParams}`,
    { next: { revalidate: 1800 } }
  );
  if (!videoRes.ok) return [];

  const videoData = (await videoRes.json()) as {
    items?: Array<{
      id: string;
      snippet: {
        title: string;
        description: string;
        thumbnails: { high?: { url: string }; medium?: { url: string } };
      };
      contentDetails: { duration: string };
    }>;
  };

  return (videoData.items ?? []).map((item) => {
    const durationSeconds = parseIsoDuration(item.contentDetails.duration);
    const title = item.snippet.title.replace(/\s*#\s*shorts\s*/gi, "").trim();
    const format = classifyFormat(
      durationSeconds,
      item.snippet.title,
      item.snippet.description
    );
    return {
      id: item.id,
      title,
      description: item.snippet.description.slice(0, 800),
      thumbnail:
        item.snippet.thumbnails.high?.url ??
        item.snippet.thumbnails.medium?.url ??
        `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
      slug: slugify(title, item.id),
      format,
      durationSeconds,
    };
  });
}

function parseRssItem(item: string): YouTubeVideo | null {
  const id =
    item.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] ??
    item.match(/watch\?v=([^"&]+)/)?.[1];
  const title = item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1];
  const description =
    item.match(/<media:description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/media:description>/)?.[1] ??
    "";

  if (!id || !title) return null;

  const cleanTitle = title.replace(/^[^-]+-\s*/, "").trim();
  const format = classifyFormat(0, cleanTitle, description);

  return {
    id,
    title: cleanTitle.replace(/\s*#\s*shorts\s*/gi, "").trim(),
    description: description.slice(0, 800),
    thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    slug: slugify(cleanTitle, id),
    format,
    durationSeconds: 0,
  };
}

async function fetchFromRss(channelId: string): Promise<YouTubeVideo[]> {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) return [];

  const xml = await res.text();
  const entries = xml.split("<entry>").slice(1);
  return entries
    .map((entry) => parseRssItem("<entry>" + entry))
    .filter((v): v is YouTubeVideo => v !== null);
}

export async function getYouTubeVideos(): Promise<YouTubeVideo[]> {
  const { channelId, apiKey } = youtubeConfig;

  if (channelId && apiKey) {
    const fromApi = await fetchFromYouTubeApi(channelId, apiKey);
    if (fromApi.length > 0) return fromApi;
  }

  if (channelId) {
    const fromRss = await fetchFromRss(channelId);
    if (fromRss.length > 0) return fromRss;
  }

  return FALLBACK_VIDEOS;
}

export async function getLongFormVideos(): Promise<YouTubeVideo[]> {
  return (await getYouTubeVideos()).filter((v) => v.format === "long");
}

export async function getShortFormVideos(): Promise<YouTubeVideo[]> {
  return (await getYouTubeVideos()).filter((v) => v.format === "short");
}

export async function getVideoBySlug(slug: string): Promise<YouTubeVideo | undefined> {
  const videos = await getYouTubeVideos();
  return videos.find((v) => v.slug === slug || v.id === slug);
}

export async function getVideoById(id: string): Promise<YouTubeVideo | undefined> {
  const videos = await getYouTubeVideos();
  return videos.find((v) => v.id === id);
}

export function youtubeWatchUrl(id: string, source = "seestew"): string {
  return `https://www.youtube.com/watch?v=${id}&utm_source=${source}&utm_medium=website&utm_campaign=embed`;
}
