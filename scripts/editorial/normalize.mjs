/**
 * Shared text normalization for editorial originality checks.
 */

const STOP = new Set(
  `a an the and or of to in on for with from by at as is was were be been being that this these those it its their his her who whom which into over under after before during about against between through during while where when what why how not no nor so if then than too very can could would should may might must will just also only own same such`.split(
    /\s+/
  )
);

const GENERIC_HOOKS = [
  /\byou won'?t believe\b/i,
  /\bhistory forgot\b/i,
  /\bwhat if i told you\b/i,
  /\bfew people know\b/i,
  /\bmost people don'?t know\b/i,
  /\bthe untold story\b/i,
  /\bthe forgotten story\b/i,
  /\bshocking truth\b/i,
  /\bin this article we(?: will)? (?:explore|delve)\b/i,
  /\bstands as a (?:dark |chilling )?chapter\b/i,
  /\bserves as a (?:stark |chilling |poignant )?reminder\b/i,
];

export function stripMarkdown(text) {
  return (text || "")
    .split(/^##\s*Sources\b/im)[0]
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[#>*_`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(text) {
  return stripMarkdown(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

export function shingles(tokens, n = 3) {
  const out = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    out.push(tokens.slice(i, i + n).join(" "));
  }
  return out;
}

export function jaccard(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  if (!A.size && !B.size) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter);
}

export function yearFromText(text) {
  const m = String(text || "").match(/\b((?:1[6-9]\d{2}|20[0-2]\d))\b/);
  return m ? Number(m[1]) : null;
}

/** Stable-ish event key from slug + year (not a historical assertion). */
export function canonicalEventIdFromSlug(slug, eventYear) {
  const stem = String(slug || "")
    .toLowerCase()
    .replace(/-?\d{4}$/, "")
    .replace(/^qr-/, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const y = eventYear ?? yearFromText(slug) ?? "undated";
  return `${stem}::${y}`;
}

export function titleEventKey(title, eventYear) {
  const tokens = tokenize(title).filter((t) => !/^\d{4}$/.test(t));
  const core = tokens.slice(0, 8).join("-");
  const y = eventYear ?? yearFromText(title) ?? "undated";
  return `${core}::${y}`;
}

const PLACE_HINTS =
  /\b(boston|chicago|new york|philadelphia|washington|atlanta|dallas|houston|seattle|portland|san francisco|los angeles|detroit|cleveland|pittsburgh|baltimore|orleans|galveston|alaska|hawaii|texas|california|ohio|illinois|massachusetts|pennsylvania|virginia|alabama|mississippi|montana|oregon|florida|georgia|colorado|arizona|nevada|utah|idaho|kansas|nebraska|oklahoma|arkansas|louisiana|tennessee|kentucky|indiana|michigan|wisconsin|minnesota|iowa|missouri|north carolina|south carolina|west virginia|rhode island|connecticut|vermont|new hampshire|maine|delaware|maryland|new jersey|new mexico|north dakota|south dakota|wyoming|natchez|dayton|collinwood|hinckley|johnstown|triangle|selma|montgomery|tuskegee|wounded knee|little rock|pearl harbor|west point|thule|palomares)\b/gi;

export function extractPlaces(text) {
  const found = new Set();
  const blob = String(text || "");
  let m;
  const re = new RegExp(PLACE_HINTS.source, "gi");
  while ((m = re.exec(blob))) found.add(m[0].toLowerCase());
  return [...found];
}

/** Rough proper-noun-ish tokens from title (capitalized runs). */
export function extractNamedHints(title) {
  const words = String(title || "").split(/\s+/);
  const out = [];
  for (const w of words) {
    const clean = w.replace(/[^A-Za-z0-9'-]/g, "");
    if (clean.length < 3) continue;
    if (/^[A-Z][a-z]+/.test(clean) || /^[A-Z]{2,}$/.test(clean)) {
      out.push(clean.toLowerCase());
    }
  }
  return [...new Set(out)].filter((w) => !STOP.has(w));
}

export function openingSentences(text, max = 2) {
  const plain = stripMarkdown(text);
  const parts = plain.split(/(?<=[.!?])\s+/).filter(Boolean);
  return parts.slice(0, max).join(" ");
}

export function hasGenericHook(text) {
  const open = openingSentences(text, 2);
  return GENERIC_HOOKS.some((re) => re.test(open));
}

export function genericHookHits(text) {
  const open = openingSentences(text, 2);
  return GENERIC_HOOKS.filter((re) => re.test(open)).map((re) => re.source);
}

export { GENERIC_HOOKS, STOP };
