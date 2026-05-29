import { existsSync } from "fs";
import { join } from "path";
import type { Article, ArticleImage } from "@/lib/articles";

export type ResolvedStoryImage = {
  src: string;
  alt: string;
  credit?: string;
  sourcePageUrl?: string;
  isRemote: boolean;
};

const PUBLIC_STORIES = join(process.cwd(), "public", "stories");

const CATEGORY_DEFAULTS: Record<string, string> = {
  presidents: "/stories/defaults/presidents.svg",
  revolution: "/stories/defaults/revolution.svg",
  "civil war": "/stories/defaults/military.svg",
  scandal: "/stories/defaults/scandal.svg",
  crime: "/stories/defaults/crime.svg",
  military: "/stories/defaults/military.svg",
  exploration: "/stories/defaults/exploration.svg",
  politics: "/stories/defaults/politics.svg",
  "weird america": "/stories/defaults/weird-america.svg",
  documentary: "/stories/defaults/exploration.svg",
};

function categoryDefault(category: string): string {
  const key = category.toLowerCase();
  return CATEGORY_DEFAULTS[key] ?? "/stories/defaults/weird-america.svg";
}

function localCardExists(cardPath: string): boolean {
  if (!cardPath.startsWith("/stories/")) return false;
  return existsSync(join(process.cwd(), "public", cardPath.replace(/^\//, "")));
}

/** Allowed remote hosts for archive story images (public-domain institutions). */
export const STORY_IMAGE_HOSTS = [
  "loc.gov",
  "cdn.loc.gov",
  "tile.loc.gov",
  "www.loc.gov",
  "si.edu",
  "ids.si.edu",
  "nara.gov",
  "catalog.archives.gov",
];

const BLOCKED_STORY_IMAGE_HOSTS = ["guides.loc.gov"];

export function isPlaceholderStoryImage(path: string): boolean {
  return path.includes("/stories/defaults/") || path.endsWith(".svg");
}

export function isAllowedStoryImageUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (BLOCKED_STORY_IMAGE_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
      return false;
    }
    if (url.includes("guides.loc.gov") || url.includes("/ndnp:")) return false;
    return STORY_IMAGE_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

type LocSearchResult = {
  imageUrl?: string;
  pageUrl?: string;
  title?: string;
};

/** Search Library of Congress for a public-domain image (JSON API). */
export async function searchLibraryOfCongressImage(
  query: string
): Promise<LocSearchResult | null> {
  const q = query.slice(0, 120).trim();
  if (!q) return null;

  try {
    const params = new URLSearchParams({
      q,
      fo: "json",
      at: "results",
      c: "8",
      sp: "1",
    });
    const res = await fetch(`https://www.loc.gov/search/?${params}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      results?: Array<{
        title?: string;
        url?: string;
        image_url?: string | string[];
      }>;
    };

    for (const item of data.results ?? []) {
      const raw = item.image_url;
      const imageUrl = Array.isArray(raw) ? raw[0] : raw;
      if (!imageUrl || !isAllowedStoryImageUrl(imageUrl)) continue;
      return {
        imageUrl,
        pageUrl: item.url,
        title: item.title,
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function buildImagePrompt(article: Pick<Article, "title" | "category" | "excerpt">): string {
  return `Historic editorial illustration for "${article.title}". Category: ${article.category}. Scene: ${article.excerpt}. Style: period-accurate, muted earth tones, painterly, no text overlays, no logos, suitable as article hero image.`;
}

export function resolveStoryImage(
  article: Article,
  options?: { youtubeThumbnail?: string }
): ResolvedStoryImage {
  const img = article.image;
  const alt = img?.alt ?? article.title;

  if (img?.card && localCardExists(img.card)) {
    return {
      src: img.card,
      alt,
      credit: img.credit,
      sourcePageUrl: img.sourcePageUrl,
      isRemote: false,
    };
  }

  if (
    img?.card &&
    img.card.startsWith("https://") &&
    !isPlaceholderStoryImage(img.card) &&
    isAllowedStoryImageUrl(img.card)
  ) {
    return {
      src: img.card,
      alt,
      credit: img.credit ?? "Library of Congress",
      sourcePageUrl: img.sourcePageUrl,
      isRemote: true,
    };
  }

  if (img?.hero && localCardExists(img.hero)) {
    return {
      src: img.hero,
      alt,
      credit: img.credit,
      sourcePageUrl: img.sourcePageUrl,
      isRemote: false,
    };
  }

  if (options?.youtubeThumbnail && article.relatedVideoId) {
    return {
      src: options.youtubeThumbnail,
      alt: `${article.title} — SeeStew video`,
      credit: "SeeStew / YouTube",
      isRemote: true,
    };
  }

  return {
    src: categoryDefault(article.category),
    alt,
    credit: img?.credit,
    sourcePageUrl: img?.sourcePageUrl,
    isRemote: false,
  };
}
