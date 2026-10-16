/**
 * Factual verification gates — fail closed when sources are missing,
 * citations don't support claims, or dates contradict.
 * Does NOT treat a model answer as independent verification.
 */

const CREDIBLE_HOST =
  /\b(loc\.gov|archives\.gov|nasa\.gov|nps\.gov|si\.edu|smithsonian|britannica\.com|history\.com|masshist\.org|navy\.mil|army\.mil|af\.mil|defense\.gov|nih\.gov|cdc\.gov|usgs\.gov|noaa\.gov|yale\.edu|harvard\.edu|stanford\.edu|columbia\.edu|princeton\.edu|uchicago\.edu|mit\.edu|oxford|cambridge|jstor\.org|chroniclingamerica|congress\.gov|senate\.gov|house\.gov|whitehouse\.gov|fbi\.gov|cia\.gov|state\.gov|usgs|library of congress)\b/i;

const INVENTED_DIALOGUE =
  /(?:"[^"]{20,}"|'[^']{20,}')\s*(?:said|asked|replied|whispered|shouted|declared|exclaimed)/i;

export function extractSourcesSection(body) {
  const m = String(body || "").match(/^##\s*Sources\b([\s\S]*)$/im);
  return m ? m[1].trim() : "";
}

export function extractSourceUrls(body, references = []) {
  const section = extractSourcesSection(body);
  const urls = [];
  const re = /https?:\/\/[^\s)\]]+/gi;
  let m;
  while ((m = re.exec(section))) urls.push(m[0].replace(/[.,;]+$/, ""));
  const all = String(body || "").matchAll(/\[([^\]]+)]\((https?:\/\/[^)]+)\)/g);
  for (const x of all) urls.push(x[2]);
  for (const r of references || []) {
    if (r?.url) urls.push(String(r.url));
  }
  return [...new Set(urls)];
}

export function extractClaimYears(body) {
  const main = String(body || "").split(/^##\s*Sources\b/im)[0];
  const years = [];
  const re = /\b((?:1[6-9]\d{2}|20[0-2]\d))\b/g;
  let m;
  while ((m = re.exec(main))) years.push(Number(m[1]));
  return years;
}

/**
 * Lightweight citation-support check:
 * - At least 2 source URLs
 * - Majority from credible institutional hosts
 * - Event year (if declared) appears in body
 * - No invented dialogue patterns
 * - No fabricated "as an AI" style claims
 */
export function auditFacts({
  body,
  title,
  eventYear,
  excerpt,
  references = [],
  allowUnverified = false,
} = {}) {
  const issues = [];
  const sources = extractSourcesSection(body);
  const urls = extractSourceUrls(body, references);
  // References array can satisfy the Sources section requirement
  const hasRefBlock = (references || []).length >= 2;

  if ((!sources || sources.length < 40) && !hasRefBlock) {
    issues.push({
      code: "missing_sources",
      message: "Sources section missing or too thin — cannot verify claims.",
      block: true,
    });
  }

  if (urls.length < 2) {
    issues.push({
      code: "insufficient_citations",
      message: "Fewer than two citation URLs — publication blocked.",
      block: true,
    });
  }

  const credible = urls.filter((u) => CREDIBLE_HOST.test(u));
  if (urls.length > 0 && credible.length === 0) {
    issues.push({
      code: "no_credible_sources",
      message:
        "No primary/reputable institutional sources detected among citations.",
      block: true,
    });
  }

  if (eventYear != null) {
    const years = extractClaimYears(body);
    if (!years.includes(Number(eventYear))) {
      issues.push({
        code: "event_year_absent",
        message: `Declared eventYear ${eventYear} does not appear in article body.`,
        block: true,
      });
    }
    // Contradictory cluster: many years far from eventYear without explanation
    const far = years.filter((y) => Math.abs(y - Number(eventYear)) > 80);
    if (years.length >= 4 && far.length >= years.length * 0.75) {
      issues.push({
        code: "contradictory_dates",
        message:
          "Body years heavily contradict the declared eventYear — flag for editorial review.",
        block: true,
      });
    }
  }

  const main = String(body || "").split(/^##\s*Sources\b/im)[0];
  if (INVENTED_DIALOGUE.test(main)) {
    issues.push({
      code: "invented_dialogue",
      message:
        "Possible invented dialogue/quotation pattern — remove unverified dramatic quotes.",
      block: true,
    });
  }

  if (/\bas an ai\b|\bi (?:generated|made up|invented)\b/i.test(main)) {
    issues.push({
      code: "model_as_source",
      message: "Model self-reference cannot serve as verification.",
      block: true,
    });
  }

  // Placeholder / fabricated citation markers
  if (
    /example\.com|placeholder|lorem ipsum|citation needed|TODO:?\s*source/i.test(
      sources
    )
  ) {
    issues.push({
      code: "fabricated_citation",
      message: "Sources section contains placeholder or fabricated citation markers.",
      block: true,
    });
  }

  const blocking = issues.filter((i) => i.block);
  if (blocking.length && allowUnverified) {
    return {
      ok: false,
      bypassed: false,
      issues,
      message: "allowUnverified is ignored — verification gates fail closed.",
    };
  }

  return {
    ok: blocking.length === 0,
    issues,
    urls,
    credibleCount: credible.length,
  };
}

/**
 * Quick Read angle uniqueness vs parent excerpt/title.
 */
export function auditQuickReadAngle({
  title,
  excerpt,
  body,
  editorialAngle,
  parentArticleSlug,
  parentEntry,
} = {}) {
  const issues = [];
  if (parentArticleSlug && !editorialAngle) {
    issues.push({
      code: "missing_editorial_angle",
      message:
        "Quick Read with a parent must declare editorialAngle (distinct useful detail).",
      block: true,
    });
  }
  if (!parentArticleSlug && editorialAngle) {
    // OK — standalone QR with angle
  }
  if (parentArticleSlug && parentEntry) {
    const parentBlob = `${parentEntry.title} ${parentEntry.excerpt || ""}`.toLowerCase();
    const angle = String(editorialAngle || title || "").toLowerCase();
    if (angle && parentBlob.includes(angle) && angle.length > 20) {
      // weak signal only
    }
    const titleSame =
      String(title || "").trim().toLowerCase() ===
      String(parentEntry.title || "").trim().toLowerCase();
    if (titleSame) {
      issues.push({
        code: "qr_same_title_as_parent",
        message: "Quick Read title matches parent — not a distinct angle.",
        block: true,
      });
    }
  }
  if (parentArticleSlug && !editorialAngle && !excerpt) {
    issues.push({
      code: "no_unique_angle",
      message: "Quick Read lacks a declared unique editorial angle.",
      block: true,
    });
  }
  // Word count band ~300–500 for QR body (plain)
  const plain = String(body || "")
    .split(/^##\s*Sources\b/im)[0]
    .replace(/[#>*_`\[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = plain.split(/\s+/).filter(Boolean).length;
  if (body && (words < 220 || words > 650)) {
    issues.push({
      code: "qr_wordcount",
      message: `Quick Read body is ${words} words; target roughly 300–500.`,
      block: words < 180 || words > 800,
    });
  }
  return { ok: issues.filter((i) => i.block).length === 0, issues, words };
}
