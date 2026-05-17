import type { Article, ArticleReference } from "@/lib/articles";

const CREDIBLE_DOMAIN_PATTERNS = [
  /\.gov$/i,
  /\.edu$/i,
  /loc\.gov/i,
  /archives\.gov/i,
  /smithsonian/i,
  /nps\.gov/i,
  /nationalarchives/i,
  /history\.gov/i,
  /senate\.gov/i,
  /house\.gov/i,
  /britannica\.com/i,
  /history\.com/i,
  /si\.edu/i,
  /museum/i,
  /jstor\.org/i,
  /pbs\.org/i,
  /npr\.org/i,
];

const PLACEHOLDER_URL_PATTERNS = [
  /example\.com/i,
  /placeholder/i,
  /lorem/i,
  /your-?url/i,
  /insert-?url/i,
  /localhost/i,
];

const VAGUE_SOURCE_PHRASES = [
  /\baccording to sources\b/i,
  /\baccording to some\b/i,
  /\bmany experts believe\b/i,
  /\bit is said that\b/i,
  /\brumors suggest\b/i,
  /\bsources claim\b/i,
];

const FABRICATED_QUOTE_PATTERN =
  /[""][^""]{10,}[""][^.]*\bsaid\b|\bsaid\s+[""]/i;

export type StoryValidationResult = {
  ok: boolean;
  errors: string[];
};

function isCredibleUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return CREDIBLE_DOMAIN_PATTERNS.some((re) => re.test(host));
  } catch {
    return false;
  }
}

function isValidReference(ref: ArticleReference): boolean {
  if (!ref.title?.trim() || ref.title.length < 4) return false;
  if (!ref.publisher?.trim() || ref.publisher.length < 2) return false;
  if (!ref.url?.startsWith("https://")) return false;
  if (ref.url.length < 16) return false;
  if (PLACEHOLDER_URL_PATTERNS.some((re) => re.test(ref.url))) return false;
  return true;
}

export function validateReferences(refs: ArticleReference[] | undefined): StoryValidationResult {
  const errors: string[] = [];
  if (!refs || refs.length < 3) {
    errors.push("At least 3 cited sources with https URLs are required.");
    return { ok: false, errors };
  }

  for (let i = 0; i < refs.length; i++) {
    if (!isValidReference(refs[i])) {
      errors.push(`Source ${i + 1} is missing title, publisher, or a valid https URL.`);
    }
  }

  const credibleCount = refs.filter((r) => isCredibleUrl(r.url)).length;
  if (credibleCount < 2) {
    errors.push("At least 2 sources should be from credible domains (.gov, .edu, museum, archives).");
  }

  return { ok: errors.length === 0, errors };
}

function countInlineCitations(body: string): number {
  const markers = body.match(/\[\d+\]/g);
  return markers ? new Set(markers).size : 0;
}

export function validateArticleForPublish(article: Article): StoryValidationResult {
  const errors: string[] = [];

  if (!article.title?.trim() || article.title.length < 8) {
    errors.push("Title is missing or too short.");
  }
  if (!article.slug?.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) {
    errors.push("Slug is missing or invalid.");
  }
  if (!article.excerpt?.trim() || article.excerpt.length < 40) {
    errors.push("Summary/excerpt is missing or too short.");
  }
  if (!article.content?.trim() || article.content.split(/\s+/).length < 200) {
    errors.push("Body is missing or too short.");
  }
  if (!article.category?.trim()) {
    errors.push("Category is required.");
  }

  const refCheck = validateReferences(article.references);
  errors.push(...refCheck.errors);

  const body = article.content ?? "";

  if (!/##\s*Sources/i.test(body)) {
    errors.push('Body must end with a "## Sources" section.');
  }

  const inlineCount = countInlineCitations(body);
  if (inlineCount < 3) {
    errors.push("Body needs at least 3 inline citation markers like [1], [2], [3].");
  }

  for (const re of VAGUE_SOURCE_PHRASES) {
    if (re.test(body)) {
      errors.push(`Body contains vague sourcing (${re.source}).`);
      break;
    }
  }

  if (FABRICATED_QUOTE_PATTERN.test(body)) {
    errors.push("Body may contain unsourced direct quotes.");
  }

  if (/\b(lorem ipsum|TODO|TBD|\[insert)\b/i.test(body)) {
    errors.push("Body contains placeholder text.");
  }

  return { ok: errors.length === 0, errors };
}
