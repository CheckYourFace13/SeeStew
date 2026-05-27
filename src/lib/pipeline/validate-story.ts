import type { Article, ArticleReference } from "@/lib/articles";

const CREDIBLE_DOMAIN_PATTERNS = [
  /\.gov$/i,
  /\.edu$/i,
  /loc\.gov/i,
  /archives\.gov/i,
  /smithsonian/i,
  /nps\.gov/i,
  /nationalarchives/i,
  /senate\.gov/i,
  /house\.gov/i,
  /si\.edu/i,
  /museum/i,
  /jstor\.org/i,
  /pbs\.org/i,
  /npr\.org/i,
  /nytimes\.com/i,
  /washingtonpost\.com/i,
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
  if (!refs || refs.length < 4) {
    errors.push("At least 4 cited sources with https URLs are required.");
    return { ok: false, errors };
  }

  for (let i = 0; i < refs.length; i++) {
    if (!isValidReference(refs[i])) {
      errors.push(`Source ${i + 1} is missing title, publisher, or a valid https URL.`);
    }
  }

  const credibleCount = refs.filter((r) => isCredibleUrl(r.url)).length;
  if (credibleCount < 2) {
    errors.push("At least 2 sources must be from .gov, .edu, museum, archives, or major institution.");
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
    errors.push("Excerpt is missing or too short (40+ chars).");
  }

  const wordCount = (article.content ?? "").split(/\s+/).length;
  if (wordCount < 1500) {
    errors.push(`Body is ${wordCount} words — minimum is 1500.`);
  }

  if (!article.category?.trim()) {
    errors.push("Category is required.");
  }

  const refCheck = validateReferences(article.references);
  errors.push(...refCheck.errors);

  const body = article.content ?? "";

  if (!/##\s*Sources/i.test(body)) {
    errors.push('Body must contain a "## Sources" section.');
  }

  const inlineCount = countInlineCitations(body);
  if (inlineCount < 4) {
    errors.push(`Body needs at least 4 unique inline citation markers [1], [2], etc. Found ${inlineCount}.`);
  }

  for (const re of VAGUE_SOURCE_PHRASES) {
    if (re.test(body)) {
      errors.push(`Body contains vague sourcing phrase: "${re.source}".`);
      break;
    }
  }

  if (/\b(lorem ipsum|TODO|TBD|\[insert)\b/i.test(body)) {
    errors.push("Body contains placeholder text.");
  }

  return { ok: errors.length === 0, errors };
}
