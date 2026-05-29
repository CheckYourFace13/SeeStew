import { youtubeConfig } from "./config";
import { isValidYouTubeVideoId, parseYouTubeVideoId } from "./youtube-id";

export type VideoFormat = "long" | "short";

/** Shorts are at most 60 seconds. */
export const SHORT_MAX_SECONDS = 60;

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

function normalizeVideoId(raw: string): string | null {
  return parseYouTubeVideoId(raw) ?? (isValidYouTubeVideoId(raw.trim()) ? raw.trim() : null);
}

/** True when a feed/API URL path is a YouTube Short. */
export function urlLooksLikeShort(url?: string): boolean {
  if (!url) return false;
  return /youtube\.com\/shorts\//i.test(url) || /youtu\.be\/shorts\//i.test(url);
}

/** Signals for full episodes (used when duration is unavailable). */
export function looksLikeLongForm(title: string, description = ""): boolean {
  const text = `${title} ${description}`.toLowerCase();
  return (
    /\b(documentary|full episode|episode \d|part \d|\d+\s*min(ute)?s?|\d+\s*hour)\b/i.test(
      text
    ) || text.includes("watch the full")
  );
}

/** Title/description signals for YouTube Shorts. */
export function looksLikeShort(title: string, description = ""): boolean {
  const text = `${title} ${description}`.toLowerCase();
  return (
    text.includes("#shorts") ||
    text.includes("youtube short") ||
    /\bshorts?\b/i.test(text) ||
    (title.length > 0 && title.length < 95 && !looksLikeLongForm(title, description))
  );
}

export function classifyFormat(
  durationSeconds: number,
  title: string,
  description: string,
  sourceUrl?: string
): VideoFormat {
  if (urlLooksLikeShort(sourceUrl)) return "short";
  if (looksLikeShort(title, description)) return "short";
  if (durationSeconds > 0 && durationSeconds <= SHORT_MAX_SECONDS) return "short";
  if (durationSeconds > SHORT_MAX_SECONDS) return "long";
  if (looksLikeLongForm(title, description)) return "long";
  return "long";
}

export function isLongFormVideo(video: YouTubeVideo): boolean {
  return video.format === "long";
}

export function isShortFormVideo(video: YouTubeVideo): boolean {
  return video.format === "short";
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

async function fetchDurationsByIds(
  ids: string[],
  apiKey: string
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (ids.length === 0) return map;

  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 50) {
    chunks.push(ids.slice(i, i + 50));
  }

  for (const chunk of chunks) {
    const videoParams = new URLSearchParams({
      part: "contentDetails",
      id: chunk.join(","),
      key: apiKey,
    });
    const videoRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?${videoParams}`,
      { next: { revalidate: 1800 } }
    );
    if (!videoRes.ok) continue;
    const videoData = (await videoRes.json()) as {
      items?: Array<{ id: string; contentDetails: { duration: string } }>;
    };
    for (const item of videoData.items ?? []) {
      map.set(item.id, parseIsoDuration(item.contentDetails.duration));
    }
  }

  return map;
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
    .map((i) => normalizeVideoId(i.snippet.resourceId.videoId))
    .filter((id): id is string => id !== null);

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

  return (videoData.items ?? [])
    .map((item) => {
      const id = normalizeVideoId(item.id);
      if (!id) return null;

      const durationSeconds = parseIsoDuration(item.contentDetails.duration);
      const title = item.snippet.title.replace(/\s*#\s*shorts\s*/gi, "").trim();
      const format = classifyFormat(
        durationSeconds,
        item.snippet.title,
        item.snippet.description
      );
      return {
        id,
        title,
        description: item.snippet.description.slice(0, 800),
        thumbnail:
          item.snippet.thumbnails.high?.url ??
          item.snippet.thumbnails.medium?.url ??
          `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        slug: slugify(title, id),
        format,
        durationSeconds,
      };
    })
    .filter((v): v is YouTubeVideo => v !== null);
}

function extractRssLink(entry: string): string | undefined {
  const href =
    entry.match(/<link[^>]+rel="alternate"[^>]+href="([^"]+)"/i)?.[1] ??
    entry.match(/<link[^>]+href="([^"]+)"[^>]*rel="alternate"/i)?.[1] ??
    entry.match(/<link>([^<]+)<\/link>/)?.[1] ??
    entry.match(/<media:content[^>]+url="([^"]+)"/i)?.[1];
  return href?.trim();
}

function extractRssDurationSeconds(entry: string): number {
  const mediaSeconds = entry.match(/<media:content[^>]+duration="(\d+)"/i)?.[1];
  if (mediaSeconds) return parseInt(mediaSeconds, 10);
  return 0;
}

function parseRssItem(item: string): YouTubeVideo | null {
  const rawId =
    item.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] ??
    item.match(/watch\?v=([^"&]+)/)?.[1];
  const link = extractRssLink(item);
  const id = rawId ? normalizeVideoId(rawId) : link ? normalizeVideoId(link) : null;

  const title = item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1];
  const description =
    item.match(/<media:description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/media:description>/)?.[1] ??
    "";

  if (!id || !title) return null;

  const cleanTitle = title.replace(/^[^-]+-\s*/, "").trim();
  const durationSeconds = extractRssDurationSeconds(item);
  const format = classifyFormat(durationSeconds, cleanTitle, description, link);

  return {
    id,
    title: cleanTitle.replace(/\s*#\s*shorts\s*/gi, "").trim(),
    description: description.slice(0, 800),
    thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    slug: slugify(cleanTitle, id),
    format,
    durationSeconds,
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

let _durationWarnLogged = false;

async function enrichMissingDurations(
  videos: YouTubeVideo[],
  apiKey: string
): Promise<YouTubeVideo[]> {
  const missing = videos.filter((v) => v.durationSeconds === 0).map((v) => v.id);
  if (missing.length === 0) return videos;

  const durations = await fetchDurationsByIds(missing, apiKey);

  const stillMissing = missing.filter((id) => !durations.has(id) || durations.get(id) === 0);
  if (stillMissing.length > 0 && !_durationWarnLogged) {
    _durationWarnLogged = true;
    console.warn(
      `[youtube] API returned no duration for ${stillMissing.length} video(s): ${stillMissing.slice(0, 5).join(", ")}${stillMissing.length > 5 ? "..." : ""}. Classified using title/URL heuristics only.`
    );
  }

  return videos.map((v) => {
    if (v.durationSeconds > 0) return v;
    const seconds = durations.get(v.id) ?? 0;
    const durationSeconds = seconds;
    const format = classifyFormat(durationSeconds, v.title, v.description);
    return {
      ...v,
      durationSeconds,
      format,
    };
  });
}

export async function getYouTubeVideos(): Promise<YouTubeVideo[]> {
  const { channelId, apiKey } = youtubeConfig;

  if (channelId && apiKey) {
    const fromApi = await fetchFromYouTubeApi(channelId, apiKey);
    if (fromApi.length > 0) return fromApi;
  }

  if (channelId) {
    let fromRss = await fetchFromRss(channelId);
    if (fromRss.length > 0 && apiKey) {
      fromRss = await enrichMissingDurations(fromRss, apiKey);
    }
    if (fromRss.length > 0) return fromRss;
  }

  return FALLBACK_VIDEOS;
}

const LONG_FALLBACK = FALLBACK_VIDEOS.filter((v) => isLongFormVideo(v));

export async function getLongFormVideos(): Promise<YouTubeVideo[]> {
  const all = await getYouTubeVideos();
  const long = all.filter(isLongFormVideo);
  if (long.length > 0) return long;
  return LONG_FALLBACK;
}

export async function getShortFormVideos(): Promise<YouTubeVideo[]> {
  const all = await getYouTubeVideos();
  return all.filter(isShortFormVideo);
}

export async function getVideoBySlug(slug: string): Promise<YouTubeVideo | undefined> {
  const videos = await getYouTubeVideos();
  return videos.find((v) => v.slug === slug || v.id === slug);
}

export async function getVideoById(id: string): Promise<YouTubeVideo | undefined> {
  const parsed = normalizeVideoId(id);
  const videos = await getYouTubeVideos();
  return videos.find((v) => v.id === parsed || v.slug === id);
}

export function youtubeWatchUrl(id: string, source = "seestew"): string {
  const videoId = normalizeVideoId(id) ?? id;
  return `https://www.youtube.com/watch?v=${videoId}&utm_source=${source}&utm_medium=website&utm_campaign=embed`;
}
