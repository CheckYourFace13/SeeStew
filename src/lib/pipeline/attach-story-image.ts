import type { Article, ArticleImage } from "@/lib/articles";
import {
  buildImagePrompt,
  searchLibraryOfCongressImage,
} from "@/lib/story-images";

/** Attach archive image metadata or illustration prompt before saving a story. */
export async function attachStoryImage(article: Article): Promise<Article> {
  if (article.image?.card) return article;

  const query = `${article.title} ${article.category} American history`;
  const loc = await searchLibraryOfCongressImage(query);

  const image: ArticleImage = loc?.imageUrl
    ? {
        card: loc.imageUrl,
        alt: loc.title ?? article.title,
        credit: "Library of Congress",
        sourcePageUrl: loc.pageUrl,
      }
    : {
        imagePrompt: buildImagePrompt(article),
        alt: article.title,
      };

  return { ...article, image };
}
