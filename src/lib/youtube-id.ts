/** YouTube video IDs are 11 characters (unpadded base64url-style). */
const VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

export function isValidYouTubeVideoId(id: string): boolean {
  return VIDEO_ID_RE.test(id);
}

/**
 * Extract a canonical 11-character video ID from a raw id string or any YouTube URL.
 */
export function parseYouTubeVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (isValidYouTubeVideoId(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && isValidYouTubeVideoId(id) ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const fromQuery = url.searchParams.get("v");
      if (fromQuery && isValidYouTubeVideoId(fromQuery)) return fromQuery;

      const parts = url.pathname.split("/").filter(Boolean);
      const embedIdx = parts.indexOf("embed");
      if (embedIdx >= 0 && parts[embedIdx + 1] && isValidYouTubeVideoId(parts[embedIdx + 1])) {
        return parts[embedIdx + 1];
      }
      const shortsIdx = parts.indexOf("shorts");
      if (shortsIdx >= 0 && parts[shortsIdx + 1] && isValidYouTubeVideoId(parts[shortsIdx + 1])) {
        return parts[shortsIdx + 1];
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function youtubeEmbedUrl(videoId: string): string | null {
  const id = parseYouTubeVideoId(videoId);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}`;
}

export function youtubeWatchUrlFromId(videoId: string): string | null {
  const id = parseYouTubeVideoId(videoId);
  if (!id) return null;
  return `https://www.youtube.com/watch?v=${id}`;
}
