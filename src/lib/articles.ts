import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

export type ArticleReference = {
  title: string;
  publisher: string;
  url: string;
  year?: string;
};

/** Story imagery — local paths under /public or licensed archive metadata. */
export type ArticleImage = {
  /** Card/thumbnail path e.g. /stories/my-slug/card.jpg */
  card?: string;
  /** Optional hero on story page */
  hero?: string;
  alt?: string;
  credit?: string;
  /** Page URL for archive image (LOC, NARA, Smithsonian, etc.) */
  sourcePageUrl?: string;
  /** Prompt for a future generated illustration if no archive match */
  imagePrompt?: string;
};

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  readMinutes: number;
  category: string;
  content: string;
  references?: ArticleReference[];
  image?: ArticleImage;
  relatedVideoId?: string | null;
  sourceVideoId?: string;
  createdAt?: string;
};

/** Stories index shows up to this many cards. */
export const STORIES_PAGE_SIZE = 12;

const CONTENT_DIR = join(process.cwd(), "content", "articles");

function loadArticleFile(filename: string): Article | null {
  try {
    const raw = readFileSync(join(CONTENT_DIR, filename), "utf-8");
    const data = JSON.parse(raw) as Article;
    return { ...data, slug: data.slug || filename.replace(/\.json$/, "") };
  } catch {
    return null;
  }
}

export function getAllArticles(): Article[] {
  if (!existsSync(CONTENT_DIR)) return [];
  return readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".json"))
    .map(loadArticleFile)
    .filter((a): a is Article => a !== null)
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}

export function getArticle(slug: string): Article | undefined {
  const file = join(CONTENT_DIR, `${slug}.json`);
  if (!existsSync(file)) return undefined;
  return loadArticleFile(`${slug}.json`) ?? undefined;
}

export function getArticlesByCategory(category: string): Article[] {
  return getAllArticles().filter(
    (a) => a.category.toLowerCase() === category.toLowerCase()
  );
}

export function getAllCategories(): string[] {
  const cats = new Set(getAllArticles().map((a) => a.category));
  return [...cats].sort();
}

export function getArticlesForStoriesPage(limit = STORIES_PAGE_SIZE): Article[] {
  return getAllArticles().slice(0, limit);
}

export function saveArticle(article: Article): void {
  mkdirSync(CONTENT_DIR, { recursive: true });
  const withMeta = {
    ...article,
    createdAt: article.createdAt ?? new Date().toISOString(),
  };
  writeFileSync(
    join(CONTENT_DIR, `${article.slug}.json`),
    JSON.stringify(withMeta, null, 2),
    "utf-8"
  );
}
