#!/usr/bin/env node
/**
 * Standalone daily story generator for SeeStew.
 *
 * Required: OPENROUTER_API_KEY
 * Optional: OPENROUTER_MODEL (default: openai/gpt-4o-mini)
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { validateStory } from "./article-validation.mjs";

const CONTENT_DIR = join(process.cwd(), "content", "articles");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const PRIMARY_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

/** Long-form JSON reliability: GPT first, Claude second, Gemini last */
const FALLBACK_MODELS = [
  "openai/gpt-4o-mini",
  "anthropic/claude-3.5-haiku",
  "google/gemini-2.0-flash-001",
];

const MAX_TOKENS = 16384;
const ATTEMPTS_PER_MODEL = 2;

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
    this.name = "ModelError";
    this.model = model;
    this.status = status;
    this.retryable = retryable;
  }
}

class ParseError extends Error {
  constructor(message) {
    super(message);
    this.name = "ParseError";
  }
}

// --- JSON extraction / repair ---

function stripControlChars(s) {
  return s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
}

function extractJsonObject(raw) {
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/gi, "").trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return stripControlChars(s.slice(start, end + 1));
}

function parseStoryJson(raw, { logOnFail = true } = {}) {
  const extracted = extractJsonObject(raw);
  if (!extracted) {
    if (logOnFail) {
      console.error("  No JSON object found in response.");
      console.error("  First 500 chars:", raw.slice(0, 500));
    }
    throw new ParseError("No JSON object found in model output");
  }

  try {
    return JSON.parse(extracted);
  } catch (e) {
    if (logOnFail) {
      console.error(`  JSON.parse failed: ${e.message}`);
      console.error("  First 500 chars of cleaned JSON:", extracted.slice(0, 500));
      console.error("  Last 500 chars of cleaned JSON:", extracted.slice(-500));
    }
    throw new ParseError(e.message);
  }
}

// --- OpenRouter ---

async function callOpenRouter(messages, { model, maxTokens = MAX_TOKENS, temperature = 0.3, jsonMode = true } = {}) {
  const useModel = model || PRIMARY_MODEL;
  console.log(`  Calling model: ${useModel} (max_tokens=${maxTokens})`);

  const body = {
    model: useModel,
    messages,
    max_tokens: maxTokens,
    temperature,
  };
  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://seestew.com",
      "X-Title": "SeeStew Daily Story",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let errorBody = "";
    try {
      errorBody = (await res.text()).slice(0, 1000);
    } catch {}

    let errorMsg = errorBody;
    try {
      const parsed = JSON.parse(errorBody);
      errorMsg = parsed.error?.message || parsed.error?.code || errorBody;
    } catch {}

    console.error(`  [OpenRouter FAILED] model=${useModel} status=${res.status}`);
    console.error(`  Error: ${String(errorMsg).slice(0, 500)}`);

    const retryable = res.status >= 500 || res.status === 429;
    throw new ModelError(`OpenRouter ${res.status}: ${String(errorMsg).slice(0, 200)}`, {
      model: useModel,
      status: res.status,
      retryable,
    });
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new ModelError("Empty response — no content in choices", { model: useModel, retryable: true });
  }
  return content;
}

async function repairJsonWithModel(raw, model) {
  console.log(`  Requesting JSON repair from ${model}...`);
  const repaired = await callOpenRouter(
    [
      {
        role: "system",
        content:
          "You fix malformed JSON. Return ONLY a single valid JSON object. No markdown. No code fences. No comments. Escape newlines inside strings as \\n.",
      },
      {
        role: "user",
        content: `Convert this into valid JSON only, preserving all story content and references:\n\n${raw.slice(0, 80000)}`,
      },
    ],
    { model, maxTokens: MAX_TOKENS, temperature: 0, jsonMode: true }
  );
  return parseStoryJson(repaired, { logOnFail: true });
}

// --- Prompts ---

const WRITER_SYSTEM = `You are a staff writer for SeeStew — unbelievable TRUE stories from United States history.

OUTPUT FORMAT (strict):
- Return ONLY valid JSON. One root object.
- No markdown outside JSON. No code fences. No comments before or after.
- The "content" field MUST be a JSON string (escape internal quotes and newlines as \\n).
- The "references" field MUST be a JSON array of objects.
- Do not truncate. Complete the full JSON object.

STORY RULES:
- U.S. history only (1600–2000). Unbelievable but documented true events.
- No invented quotes, dialogue, dates, or documents.
- Use inline citation markers [1], [2], [3], [4], [5], [6] after factual claims (10+ total).
- End "content" with a ## Sources section matching citation numbers.

LENGTH (write long — validation rejects short drafts):
- Target 1,800+ words in "content" (minimum 1,500 to pass validation).
- Target 6+ entries in "references" (minimum 4 to pass; at least 2 from .gov or .edu).

Never use: delve, tapestry, pivotal, testament, fostering, underscores, rich history, groundbreaking, game-changer.`;

const STORY_JSON_SCHEMA = `{
  "title": "string, max 90 chars",
  "excerpt": "string, max 160 chars",
  "category": "Presidents | Revolution | Civil War | Scandal | Crime | Military | Exploration | Politics | Weird America",
  "content": "string — full article markdown with ## headings, inline [1][2] citations, ends with ## Sources",
  "references": [
    { "title": "string", "publisher": "string", "url": "https://...", "year": "optional" }
  ]
}`;

function buildPrompt(usedTopics, { retryReason = null } = {}) {
  const avoid =
    usedTopics.length > 0
      ? `\nAlready published (do NOT repeat): ${usedTopics.slice(0, 40).join("; ")}`
      : "";

  let extra = "";
  if (retryReason) {
    extra = `\n\nYOUR PREVIOUS DRAFT FAILED. Fix exactly:\n${retryReason}\n\nReturn ONLY valid JSON. No fences. Target 1800+ words and 6+ references.`;
  }

  return `Write ONE unbelievable but 100% documented true U.S. history story.
${avoid}

Return a single JSON object matching this schema:
${STORY_JSON_SCHEMA}

HARD REQUIREMENTS:
- 1800+ words in "content" (never under 1500)
- 6+ references with https URLs (at least 2 from .gov or .edu)
- 10+ inline [n] citation markers in the body
- ## Sources section at end of "content"
- Open with a specific date and place
- JSON only — complete the entire object${extra}`;
}

const JSON_RETRY_INSTRUCTION = `

CRITICAL: Your last response was NOT valid JSON or was truncated.
Return ONLY one complete valid JSON object.
- No markdown fences
- No text outside the JSON
- Escape newlines in "content" as \\n
- Include the full article — do not stop mid-string
- 1800+ words, 6+ references`;

// --- Image metadata ---

async function searchLocImage(query) {
  try {
    const params = new URLSearchParams({
      q: query.slice(0, 120),
      fo: "json",
      at: "results",
      c: "5",
      sp: "1",
    });
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
  const queryWords = story.title
    .replace(/[—–:]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 5)
    .join(" ");
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

// --- Generation attempt ---

async function generateOnce({ model, usedTitles, retryReason, jsonRetry, rawForRepair }) {
  if (rawForRepair) {
    const parsed = await repairJsonWithModel(rawForRepair, model);
    return { parsed, raw: rawForRepair };
  }

  const userPrompt = buildPrompt(usedTitles, { retryReason }) + (jsonRetry ? JSON_RETRY_INSTRUCTION : "");

  const raw = await callOpenRouter(
    [
      { role: "system", content: WRITER_SYSTEM },
      { role: "user", content: userPrompt },
    ],
    { model, maxTokens: MAX_TOKENS, temperature: jsonRetry ? 0.2 : 0.35 }
  );

  const parsed = parseStoryJson(raw);
  return { parsed, raw };
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
  console.log(`Model queue: ${modelQueue.join(" → ")}`);
  console.log(`Max tokens per call: ${MAX_TOKENS}`);
  console.log("");

  let story = null;
  let lastError = "";
  let totalAttempts = 0;
  const failedModels = new Set();
  let lastRaw = "";

  for (const model of modelQueue) {
    if (story) break;

    let retryReason = null;
    let jsonRetry = false;
    let rawForRepair = null;

    for (let attempt = 0; attempt < ATTEMPTS_PER_MODEL; attempt++) {
      totalAttempts++;
      console.log(`\nAttempt ${totalAttempts} [${model}] (${attempt + 1}/${ATTEMPTS_PER_MODEL} for this model)...`);

      try {
        const { parsed, raw } = await generateOnce({
          model,
          usedTitles,
          retryReason,
          jsonRetry,
          rawForRepair,
        });

        lastRaw = raw;
        rawForRepair = null;
        jsonRetry = false;

        const validation = validateStory(parsed);
        if (!validation.ok) {
          lastError = validation.errors.join("; ");
          console.log(`  Validation failed: ${lastError}`);
          console.log(
            `  Stats: ${validation.stats.words} words, ${validation.stats.refs} refs, ${validation.stats.citations} citations`
          );

          if (attempt < ATTEMPTS_PER_MODEL - 1) {
            retryReason = validation.errors.map((e) => `- ${e}`).join("\n");
            continue;
          }
          break;
        }

        story = parsed;
        console.log(`  Success with ${model}: ${validation.stats.words} words, ${validation.stats.refs} refs`);
        break;
      } catch (e) {
        lastError = e.message;

        if (e instanceof ModelError) {
          if (!e.retryable || e.status === 402 || e.status === 403 || e.status === 404) {
            console.log(`  Model ${model} unavailable (${e.status ?? "error"}), next model...`);
            failedModels.add(model);
            break;
          }
          console.log(`  Provider error: ${lastError}`);
          if (attempt < ATTEMPTS_PER_MODEL - 1) continue;
          failedModels.add(model);
          break;
        }

        if (e instanceof ParseError) {
          console.log(`  Parse error: ${lastError}`);
          if (lastRaw && attempt < ATTEMPTS_PER_MODEL - 1) {
            rawForRepair = lastRaw;
            continue;
          }
          if (attempt < ATTEMPTS_PER_MODEL - 1) {
            jsonRetry = true;
            continue;
          }
          break;
        }

        console.log(`  Error: ${lastError}`);
        if (attempt < ATTEMPTS_PER_MODEL - 1) {
          jsonRetry = true;
        }
      }
    }
  }

  if (!story) {
    console.error(`\nFAILED after ${totalAttempts} attempt(s) across ${modelQueue.length} model(s).`);
    console.error(`Last error: ${lastError}`);
    if (failedModels.size > 0) {
      console.error(`Models unavailable or exhausted: ${[...failedModels].join(", ")}`);
    }
    console.error("\nTroubleshooting:");
    console.error("  - Malformed JSON: set OPENROUTER_MODEL=openai/gpt-4o-mini");
    console.error("  - Too short / no refs: model may have truncated — check max_tokens and retry");
    console.error("  - Credits: https://openrouter.ai/credits");
    console.error("  - Validate existing articles: npm run validate:articles");
    process.exit(1);
  }

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

  const finalCheck = validateStory(story);
  if (!finalCheck.ok) {
    console.error(`\nRefusing to save — final validation failed: ${finalCheck.errors.join("; ")}`);
    process.exit(1);
  }

  console.log(`\nStory: "${story.title}"`);
  console.log(`Slug: ${slug}`);
  console.log(`Words: ${finalCheck.stats.words}`);
  console.log(`References: ${finalCheck.stats.refs}`);

  console.log("\nSearching for archive image...");
  const image = await attachImage(story);
  console.log(`Image: ${image.card ? "LOC archive" : "AI prompt generated"}`);

  const article = {
    slug,
    title: story.title,
    excerpt: story.excerpt,
    readMinutes: Math.max(5, Math.ceil(finalCheck.stats.words / 220)),
    category: story.category || "Weird America",
    content: story.content,
    references: story.references,
    image,
    relatedVideoId: null,
    autoGenerated: true,
    createdAt: new Date().toISOString(),
  };

  const filePath = join(CONTENT_DIR, `${slug}.json`);
  writeFileSync(filePath, JSON.stringify(article, null, 2), "utf-8");
  console.log(`\nSaved: ${filePath}`);
  console.log("\nDone! Story is ready for commit.");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
