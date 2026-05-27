/**
 * Shared article validation for daily generator and validate:articles script.
 */

const CREDIBLE_PATTERNS = [
  /\.gov$/i,
  /\.edu$/i,
  /loc\.gov/i,
  /archives\.gov/i,
  /smithsonian/i,
  /si\.edu/i,
  /museum/i,
  /congress\.gov/i,
  /nps\.gov/i,
  /pbs\.org/i,
  /npr\.org/i,
  /nytimes\.com/i,
  /washingtonpost\.com/i,
];

const PLACEHOLDER_URL = [/example\.com/i, /placeholder/i, /lorem/i, /localhost/i];

export function countWords(text) {
  return (text || "").split(/\s+/).filter(Boolean).length;
}

export function countInlineCitations(content) {
  const matches = (content || "").match(/\[\d+\]/g);
  return matches ? new Set(matches).size : 0;
}

export function countCredibleRefs(refs) {
  return (refs || []).filter((r) => {
    try {
      const host = new URL(r.url).hostname.replace(/^www\./, "");
      return CREDIBLE_PATTERNS.some((p) => p.test(host));
    } catch {
      return false;
    }
  }).length;
}

export function validateStory(story) {
  const errors = [];
  const content = story.content || "";
  const refs = story.references || [];
  const words = countWords(content);

  if (words < 1500) errors.push(`Content is ${words} words (need 1500+)`);
  if (refs.length < 4) errors.push(`Only ${refs.length} references (need 4+)`);

  const credible = countCredibleRefs(refs);
  if (credible < 2) errors.push(`Only ${credible} credible sources (need 2+)`);

  const citations = countInlineCitations(content);
  if (citations < 4) errors.push(`Only ${citations} inline citations (need 4+)`);

  if (!/##\s*Sources/i.test(content)) errors.push("Missing ## Sources section");

  if (!story.title || story.title.length < 10) errors.push("Title too short");
  if (!story.excerpt || story.excerpt.length < 30) errors.push("Excerpt too short");
  if (!story.category) errors.push("Missing category");

  for (const r of refs) {
    if (!r.url?.startsWith("https://")) errors.push(`Reference "${r.title || "?"}" has no https URL`);
    if (PLACEHOLDER_URL.some((p) => p.test(r.url || ""))) errors.push(`Placeholder URL: ${r.url}`);
    if (!r.title || r.title.length < 4) errors.push("Reference with missing/short title");
    if (!r.publisher || r.publisher.length < 2) errors.push("Reference with missing publisher");
  }

  return {
    ok: errors.length === 0,
    errors,
    stats: { words, refs: refs.length, credible, citations },
  };
}

export function validateArticleFile(article) {
  return validateStory({
    title: article.title,
    excerpt: article.excerpt,
    category: article.category,
    content: article.content,
    references: article.references,
  });
}
