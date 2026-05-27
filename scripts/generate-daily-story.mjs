#!/usr/bin/env node
/**
 * Standalone daily story generator for SeeStew.
 * Runs without a web server — safe for GitHub Actions or local use.
 *
 * Required env vars:
 *   OPENROUTER_API_KEY  — OpenRouter API key
 *   OPENROUTER_MODEL    — (optional, default: openai/gpt-4o-mini)
 *
 * Usage:
 *   node scripts/generate-daily-story.mjs
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const CONTENT_DIR = join(process.cwd(), "content", "articles");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const PRIMARY_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

const FALLBACK_MODELS = [
  "openai/gpt-4o-mini",
  "google/gemini-2.0-flash-001",
  "anthropic/claude-3.5-haiku",
];

function getModelQueue() {
  const models = [PRIMARY_MODEL];
  for (const fb of FALLBACK_MODELS) {
    if (!models.includes(fb)) models.push(fb);
  }
  return models;
}

if (!OPENROUTER_API_KEY) {
  console.error("ERROR: OPENROUTER_API_KEY is required.");
  process.exit(1);
}

// --- Helpers ---

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 55);
}

function getAllExistingArticles() {
  if (!existsSync(CONTENT_DIR)) return [];
  return readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      try {
        return JSON.parse(readFileSync(join(CONTENT_DIR, f), "utf-8"));
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

class ModelError extends Error {
  constructor(message, { model, status, retryable = true } = {}) {
    super(message);
    this.model = model;
    this.status = status;
    this.retryable = retryable;
  }
}

async function callOpenRouter(messages, { model, maxTokens = 12000, temperature = 0.3 } = {}) {
  const useModel = model || PRIMARY_MODEL;
  console.log(`  Calling model: ${useModel}`);

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://seestew.com",
      "X-Title": "SeeStew Daily Story",
    },
    body: JSON.stringify({
      model: useModel,
      messages,
      max_tokens: maxTokens,
      temperature,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    let errorBody = "";
    try {
      const text = await res.text();
      errorBody = text.slice(0, 1000);
    } catch {}

    let errorMsg = "";
    try {
      const parsed = JSON.parse(errorBody);
      errorMsg = parsed.error?.message || parsed.error?.code || errorBody;
    } catch {
      errorMsg = errorBody || `HTTP ${res.status}`;
    }

    console.error(`  [OpenRouter FAILED] model=${useModel} status=${res.status}`);
    console.error(`  Error: ${errorMsg.slice(0, 500)}`);

    const retryable = res.status >= 500 || res.status === 429;
    throw new ModelError(
      `OpenRouter ${res.status}: ${errorMsg.slice(0, 200)}`,
      { model: useModel, status: res.status, retryable }
    );
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new ModelError("Empty response — no content in choices", { model: useModel, retryable: true });
  }
  return content;
}

// --- Prompts ---

const WRITER_SYSTEM = `You are a staff writer for SeeStew — a channel about unbelievable TRUE stories from United States history.

YOUR JOB: Write stories that make people say "Wait… that actually happened?"

TOPIC SELECTION:
- Forgotten U.S. disasters, bizarre political scandals, strange presidential episodes
- Shocking court cases, military near-misses, weird laws, forgotten crimes
- Strange survival stories, hidden Revolutionary War episodes, Civil War oddities
- Cold War near-disasters, Gilded Age corruption, "this really happened" moments
- NEVER write generic textbook summaries or boring overviews

FACTUALITY (non-negotiable):
- Every claim must be backed by your references
- No invented quotes or dialogue
- No invented dates, names, or documents
- No fake dramatic details
- Never write "according to sources" — name the specific institution

CITATIONS (required in body):
- Use numbered inline markers [1], [2], [3], [4] etc. after factual claims
- Spread at least 10 inline citations throughout the article
- End with ## Sources section listing every reference matching the numbers

STRUCTURE:
- Minimum 1,500 words in "content" field
- "references" array: at least 4 entries, each with title, publisher, https url
- At least 2 references from .gov or .edu domains
- Open with a specific date, place, and action
- Use ## and ### headings, short paragraphs, vivid but accurate prose
- NEVER: delve, tapestry, pivotal, testament, fostering, underscores, rich history, groundbreaking, game-changer

OUTPUT: valid JSON only.`;

const STORY_JSON_SCHEMA = `{
  "title": "string — compelling headline about something unbelievable-but-true, max 90 chars",
  "excerpt": "string — hook that makes reader want to click, max 160 chars",
  "category": "string — Presidents | Revolution | Civil War | Scandal | Crime | Military | Exploration | Politics | Weird America",
  "content": "string — markdown with ## headings; inline [1][2][3][4] citations; ends with ## Sources",
  "references": [
    { "title": "string", "publisher": "string", "url": "https://...", "year": "optional" }
  ]
}`;

function buildPrompt(usedTopics) {
  const avoid = usedTopics.length > 0
    ? `\nAlready published (do NOT repeat): ${usedTopics.slice(0, 40).join("; ")}`
    : "";

  return `Write ONE unbelievable but 100% documented true story from United States history (1600–2000).
${avoid}

Pick from categories like:
- A forgotten disaster that killed dozens but nobody remembers today
- A president who did something so bizarre it was covered up
- A government decision so strange it sounds like satire
- A military near-miss that almost changed history
- A political scandal wilder than fiction
- A crime so audacious people refused to believe it happened
- A court case with an insane twist
- A Cold War incident that nearly ended civilization
- A Gilded Age fraud that bankrupted thousands

Return JSON:
${STORY_JSON_SCHEMA}

HARD REQUIREMENTS:
- 1500+ words in content
- 4+ references with https URLs (at least 2 from .gov or .edu)
- 10+ inline [n] citation markers spread through the article
- ## Sources section at end
- Open with a specific date and place`;
}

// --- Validation ---

const CREDIBLE_PATTERNS = [/\.gov$/i, /\.edu$/i, /loc\.gov/i, /archives\.gov/i, /smithsonian/i, /si\.edu/i, /museum/i, /congress\.gov/i, /nps\.gov/i, /pbs\.org/i, /npr\.org/i];

function validate(story) {
  const errors = [];
  const words = (story.content || "").split(/\s+/).length;
  if (words < 1500) errors.push(`Content is ${words} words (need 1500+)`);

  const refs = story.references || [];
  if (refs.length < 4) errors.push(`Only ${refs.length} references (need 4+)`);

  const credible = refs.filter((r) => {
    try {
      const host = new URL(r.url).hostname.replace(/^www\./, "");
      return CREDIBLE_PATTERNS.some((p) => p.test(host));
    } catch { return false; }
  }).length;
  if (credible < 2) errors.push(`Only ${credible} credible sources (need 2+)`);

  const citations = (story.content || "").match(/\[\d+\]/g);
  const unique = citations ? new Set(citations).size : 0;
  if (unique < 4) errors.push(`Only ${unique} inline citations (need 4+)`);

  if (!/##\s*Sources/i.test(story.content || "")) errors.push("Missing ## Sources section");

  if (!story.title || story.title.length < 10) errors.push("Title too short");
  if (!story.excerpt || story.excerpt.length < 30) errors.push("Excerpt too short");
  if (!story.category) errors.push("Missing category");

  for (const r of refs) {
    if (!r.url?.startsWith("https://")) errors.push(`Reference "${r.title}" has no https URL`);
    if (!r.title || r.title.length < 4) errors.push("Reference with missing/short title");
    if (!r.publisher || r.publisher.length < 2) errors.push("Reference with missing publisher");
  }

  return { ok: errors.length === 0, errors };
}

// --- Image metadata ---

async function searchLocImage(query) {
  try {
    const params = new URLSearchParams({ q: query.slice(0, 120), fo: "json", at: "results", c: "5", sp: "1" });
    const res = await fetch(`https://www.loc.gov/search/?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    for (const item of data.results || []) {
      const raw = item.image_url;
      const imageUrl = Array.isArray(raw) ? raw[0] : raw;
      if (imageUrl && imageUrl.includes("loc.gov")) {
        return { imageUrl, pageUrl: item.url, title: item.title };
      }
    }
  } catch {}
  return null;
}

function buildImagePrompt(story) {
  return `Historic editorial illustration for "${story.title}". Category: ${story.category}. Scene: ${story.excerpt}. Style: period-accurate, muted earth tones, painterly, no text overlays, no logos, suitable as article hero image.`;
}

async function attachImage(story) {
  const yearMatch = (story.content || "").match(/\b(1[5-9]\d{2}|200\d)\b/);
  const year = yearMatch ? yearMatch[0] : "";
  const queryWords = story.title.replace(/[—–:]/g, " ").split(/\s+/).filter((w) => w.length > 3).slice(0, 5).join(" ");
  const query = [queryWords, year, story.category].filter(Boolean).join(" ");

  const loc = await searchLocImage(query);

  if (loc?.imageUrl) {
    return {
      card: loc.imageUrl,
      hero: loc.imageUrl,
      alt: loc.title || story.title,
      credit: "Library of Congress",
      sourcePageUrl: loc.pageUrl,
    };
  }
  return {
    imagePrompt: buildImagePrompt(story),
    alt: story.title,
  };
}

// --- Main ---

async function main() {
  console.log("=== SeeStew Daily Story Generator ===\n");

  mkdirSync(CONTENT_DIR, { recursive: true });

  const existing = getAllExistingArticles();
  const usedTitles = existing.map((a) => a.title);
  const existingSlugs = new Set(existing.map((a) => a.slug));

  const modelQueue = getModelQueue();
  console.log(`Existing articles: ${existing.length}`);
  console.log(`Primary model: ${PRIMARY_MODEL}`);
  console.log(`Fallback models: ${modelQueue.slice(1).join(", ") || "(none)"}`);
  console.log("");

  const RETRY_MSG = `\n\nYour last draft FAILED validation. Fix these issues:
- 1500+ words in content field
- 4+ references with real https URLs (2+ from .gov/.edu)
- 10+ inline [1][2][3] markers spread through the body
- ## Sources section at the end
Return JSON ONLY.`;

  let story = null;
  let lastError = "";
  let totalAttempts = 0;
  const MAX_TOTAL_ATTEMPTS = 6;
  const failedModels = new Set();

  for (const model of modelQueue) {
    if (story) break;
    if (totalAttempts >= MAX_TOTAL_ATTEMPTS) break;

    const attemptsForModel = model === PRIMARY_MODEL ? 2 : 1;

    for (let attempt = 0; attempt < attemptsForModel; attempt++) {
      if (totalAttempts >= MAX_TOTAL_ATTEMPTS) break;
      totalAttempts++;

      console.log(`\nAttempt ${totalAttempts}/${MAX_TOTAL_ATTEMPTS} [${model}]...`);

      const prompt = buildPrompt(usedTitles) + (attempt > 0 ? RETRY_MSG : "");

      try {
        const raw = await callOpenRouter(
          [
            { role: "system", content: WRITER_SYSTEM },
            { role: "user", content: prompt },
          ],
          { model, maxTokens: 12000, temperature: 0.3 + attempt * 0.05 }
        );

        const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
        const parsed = JSON.parse(cleaned);

        const validation = validate(parsed);
        if (!validation.ok) {
          lastError = validation.errors.join("; ");
          console.log(`  Validation failed: ${lastError}`);
          continue;
        }

        story = parsed;
        console.log(`  Success with model: ${model}`);
        break;
      } catch (e) {
        lastError = e.message;
        if (e instanceof ModelError && !e.retryable) {
          console.log(`  Non-retryable error on ${model}, moving to next model...`);
          failedModels.add(model);
          break;
        }
        if (e instanceof ModelError && (e.status === 402 || e.status === 404 || e.status === 403)) {
          console.log(`  Model ${model} unavailable (${e.status}), moving to next model...`);
          failedModels.add(model);
          break;
        }
        console.log(`  Error: ${lastError}`);
      }
    }
  }

  if (!story) {
    console.error(`\nFAILED after ${totalAttempts} attempts across ${modelQueue.length} model(s).`);
    console.error(`Last error: ${lastError}`);
    if (failedModels.size > 0) {
      console.error(`Models that failed: ${[...failedModels].join(", ")}`);
    }
    console.error("\nTroubleshooting:");
    console.error("  - Check OpenRouter credits: https://openrouter.ai/credits");
    console.error("  - Verify model availability: https://openrouter.ai/models");
    console.error("  - Ensure OPENROUTER_API_KEY has billing enabled");
    process.exit(1);
  }

  // Ensure ## Sources section
  if (!/##\s*Sources/i.test(story.content)) {
    const block = story.references
      .map((r, i) => `${i + 1}. ${r.title} — *${r.publisher}*. [Link](${r.url})`)
      .join("\n");
    story.content = `${story.content.trim()}\n\n## Sources\n\n${block}`;
  }

  const slug = slugify(story.title);
  if (existingSlugs.has(slug)) {
    console.error(`\nDuplicate slug: ${slug} — story already exists.`);
    process.exit(1);
  }

  console.log(`\nStory: "${story.title}"`);
  console.log(`Slug: ${slug}`);
  console.log(`Words: ${story.content.split(/\s+/).length}`);
  console.log(`References: ${story.references.length}`);

  // Attach image
  console.log("\nSearching for archive image...");
  const image = await attachImage(story);
  console.log(`Image: ${image.card ? "LOC archive" : "AI prompt generated"}`);

  // Build article JSON
  const article = {
    slug,
    title: story.title,
    excerpt: story.excerpt,
    readMinutes: Math.max(5, Math.ceil(story.content.split(/\s+/).length / 220)),
    category: story.category || "Weird America",
    content: story.content,
    references: story.references,
    image,
    relatedVideoId: null,
    autoGenerated: true,
    createdAt: new Date().toISOString(),
  };

  // Save
  const filePath = join(CONTENT_DIR, `${slug}.json`);
  writeFileSync(filePath, JSON.stringify(article, null, 2), "utf-8");
  console.log(`\nSaved: ${filePath}`);
  console.log("\nDone! Story is ready for commit.");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
