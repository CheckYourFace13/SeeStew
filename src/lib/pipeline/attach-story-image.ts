import type { Article, ArticleImage } from "@/lib/articles";
import {
  buildImagePrompt,
  searchLibraryOfCongressImage,
} from "@/lib/story-images";

/**
 * Build a search query that targets the specific story — not just a generic category.
 * Extracts key signals: people, places, years, event name.
 */
function buildImageQuery(article: Article): string {
  const yearMatch = article.content?.match(/\b(1[5-9]\d{2}|200\d)\b/);
  const year = yearMatch ? yearMatch[0] : "";

  const titleWords = article.title
    .replace(/[—–:]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !/^(the|and|for|that|this|from|with|how|was|were)$/i.test(w))
    .slice(0, 5)
    .join(" ");

  const parts = [titleWords, year, article.category].filter(Boolean);
  return parts.join(" ").slice(0, 120);
}

/** Attach archive image metadata or illustration prompt before saving a story. */
export async function attachStoryImage(article: Article): Promise<Article> {
  if (article.image?.card) return article;

  const query = buildImageQuery(article);
  const loc = await searchLibraryOfCongressImage(query);

  let image: ArticleImage;

  if (loc?.imageUrl) {
    image = {
      card: loc.imageUrl,
      hero: loc.imageUrl,
      alt: loc.title ?? article.title,
      credit: "Library of Congress",
      sourcePageUrl: loc.pageUrl,
    };
  } else {
    image = {
      imagePrompt: buildImagePrompt(article),
      alt: article.title,
    };
  }

  return { ...article, image };
}
