#!/usr/bin/env node
/**
 * Daily story generator — uses curated topic/source queue.
 * Model writes article body only; sources are fixed in content/story-queue.json.
 */

import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import {
  validateStory,
  enforceCuratedReferences,
  countWords,
} from "./article-validation.mjs";
import {
  initQueueFileIfNeeded,
  loadQueue,
  saveQueue,
  pickNextQueueItem,
  markQueueItemPublished,
} from "./story-queue.mjs";

const CONTENT_DIR = join(process.cwd(), "content", "articles");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const PRIMARY_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
const FALLBACK_MODEL = "anthropic/claude-3.5-haiku";
const MAX_TOKENS = 16384;
const MIN_WORDS = 1500;
const TARGET_WORDS = 2200;

if (!OPENROUTER_API_KEY) {
  console.error("ERROR: OPENROUTER_API_KEY is required.");
  process.exit(1);
}

class ModelError extends Error {
  constructor(message, opts = {}) {
    super(message);
    this.name = "ModelError";
    Object.assign(this, opts);
  }
}

class ParseError extends Error {
  constructor(message) {
    super(message);
    this.name = "ParseError";
  }
}

function getExistingSlugs() {
  if (!existsSync(CONTENT_DIR)) return new Set();
  return new Set(
    readdirSync(CONTENT_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""))
  );
}

function stripControlChars(s) {
  return s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
}

function extractJsonObject(raw) {
  let s = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/gi, "").trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return stripControlChars(s.slice(start, end + 1));
}

function parseStoryJson(raw) {
  const extracted = extractJsonObject(raw);
  if (!extracted) {
    console.error("  No JSON object found.");
    console.error("  First 500:", raw.slice(0, 500));
    throw new ParseError("No JSON object in response");
  }
  try {
    return JSON.parse(extracted);
  } catch (e) {
    console.error(`  JSON.parse failed: ${e.message}`);
    console.error("  First 500:", extracted.slice(0, 500));
    console.error("  Last 500:", extracted.slice(-500));
    throw new ParseError(e.message);
  }
}

async function callOpenRouter(messages, { model, maxTokens = MAX_TOKENS, temperature = 0.35 } = {}) {
  console.log(`  OpenRouter → ${model}`);
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://seestew.com",
      "X-Title": "SeeStew Daily Story",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = (await res.text()).slice(0, 1000);
    let msg = text;
    try {
      const p = JSON.parse(text);
      msg = p.error?.message || text;
    } catch {}
    console.error(`  [FAILED] status=${res.status} model=${model}`);
    console.error(`  ${String(msg).slice(0, 400)}`);
    throw new ModelError(`HTTP ${res.status}: ${String(msg).slice(0, 200)}`, {
      status: res.status,
      model,
    });
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new ModelError("Empty model response", { model });
  return content;
}

const WRITER_SYSTEM = `You are a staff writer for SeeStew — unbelievable TRUE U.S. history stories.

OUTPUT: Return ONLY one valid JSON object. No markdown fences. No text outside JSON.
Escape newlines in "content" as \\n. Do not truncate.

CITATIONS: Use ONLY the numbered sources provided in the user message.
- Cite with [1], [2], [3], etc. matching those numbers exactly.
- At least 10 inline citations in the body.
- End "content" with ## Sources listing each provided source in order.

WRITING:
- Target ${TARGET_WORDS} words in "content" (never under ${MIN_WORDS}).
- U.S. history only. No invented quotes or facts.
- Vivid, accurate prose. Short paragraphs. Use ## headings.

The "references" array in your JSON must copy the provided sources exactly (same titles, publishers, URLs in order).`;

function formatSourceList(sources) {
  return sources
    .map((s, i) => `[${i + 1}] ${s.title} | ${s.publisher} | ${s.url}`)
    .join("\n");
}

function buildWritePrompt(queueItem) {
  return `TOPIC (write this story):
Title: ${queueItem.title}
Hook: ${queueItem.hook}
Category: ${queueItem.category}
Angle: ${queueItem.angle}
Keywords: ${queueItem.keywords.join(", ")}

ALLOWED SOURCES — you may ONLY cite these (copy exactly into "references"):
${formatSourceList(queueItem.requiredSources)}

Return JSON:
{
  "title": "compelling headline (can refine queue title)",
  "slug": "${queueItem.id}",
  "excerpt": "max 160 chars",
  "category": "${queueItem.category}",
  "content": "full markdown article, ${TARGET_WORDS}+ words, inline [1][2]... citations, ends with ## Sources",
  "references": [ copy each source object above in order with title, publisher, url ]
}

Do not add sources. Do not change URLs. Write ${TARGET_WORDS}+ words.`;
}

function buildExpandPrompt(story, queueItem) {
  return `Expand this article to 1800–2200 words in "content".
Keep the same JSON schema, same slug "${queueItem.id}", and the SAME references (do not change URLs).

ALLOWED SOURCES (only these):
${formatSourceList(queueItem.requiredSources)}

Current draft JSON:
${JSON.stringify({
  title: story.title,
  slug: queueItem.id,
  excerpt: story.excerpt,
  category: story.category,
  content: story.content?.slice(0, 60000),
  references: queueItem.requiredSources,
})}

Return the complete expanded JSON only.`;
}

async function writeStory(queueItem, model, { expand = false, draft = null } = {}) {
  const userContent = expand ? buildExpandPrompt(draft, queueItem) : buildWritePrompt(queueItem);
  const raw = await callOpenRouter(
    [
      { role: "system", content: WRITER_SYSTEM },
      { role: "user", content: userContent },
    ],
    { model, temperature: expand ? 0.25 : 0.35 }
  );
  return parseStoryJson(raw);
}

async function searchLocImage(terms) {
  const query = (Array.isArray(terms) ? terms.join(" ") : terms).slice(0, 120);
  try {
    const params = new URLSearchParams({ q: query, fo: "json", at: "results", c: "5", sp: "1" });
    const res = await fetch(`https://www.loc.gov/search/?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    for (const item of data.results || []) {
      const raw = item.image_url;
      const imageUrl = Array.isArray(raw) ? raw[0] : raw;
      if (imageUrl?.includes("loc.gov")) {
        return { imageUrl, pageUrl: item.url, title: item.title };
      }
    }
  } catch {}
  return null;
}

async function attachImage(queueItem, story) {
  const loc = await searchLocImage(queueItem.imageSearchTerms);
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
    imagePrompt: `Historic editorial illustration: ${queueItem.title}. ${queueItem.angle}. Period-accurate, muted tones, no text, no logos.`,
    alt: story.title,
  };
}

async function generateForQueueItem(queueItem) {
  const models = [PRIMARY_MODEL];
  if (!models.includes(FALLBACK_MODEL)) models.push(FALLBACK_MODEL);

  let lastError = "";

  for (const model of models) {
    for (let pass = 0; pass < 2; pass++) {
      try {
        console.log(`\nGenerating [${queueItem.id}] with ${model} (pass ${pass + 1})...`);
        let parsed = await writeStory(queueItem, model);

        parsed.slug = queueItem.id;
        parsed = enforceCuratedReferences(parsed, queueItem.requiredSources);

        let words = countWords(parsed.content);
        console.log(`  Draft: ${words} words`);

        if (words < MIN_WORDS) {
          console.log(`  Below ${MIN_WORDS} words — expansion call...`);
          parsed = await writeStory(queueItem, model, { expand: true, draft: parsed });
          parsed.slug = queueItem.id;
          parsed = enforceCuratedReferences(parsed, queueItem.requiredSources);
          words = countWords(parsed.content);
          console.log(`  After expand: ${words} words`);
        }

        const validation = validateStory(parsed, {
          allowedSources: queueItem.requiredSources,
        });

        if (!validation.ok) {
          lastError = validation.errors.join("; ");
          console.log(`  Validation: ${lastError}`);
          if (pass === 0) continue;
          break;
        }

        return parsed;
      } catch (e) {
        lastError = e.message;
        console.log(`  Error: ${lastError}`);
        if (e instanceof ModelError && [402, 403, 404].includes(e.status)) break;
      }
    }
  }

  throw new Error(lastError || "All models failed");
}

async function main() {
  console.log("=== SeeStew Daily Story Generator (curated queue) ===\n");

  mkdirSync(CONTENT_DIR, { recursive: true });
  initQueueFileIfNeeded();

  const queue = loadQueue();
  const existingSlugs = getExistingSlugs();
  const queueItem = pickNextQueueItem(queue, existingSlugs);

  if (!queueItem) {
    console.error("No pending queue topics available.");
    console.error(`  Pending in file: ${queue.items.filter((i) => i.status === "pending").length}`);
    console.error(`  Existing articles: ${existingSlugs.size}`);
    process.exit(1);
  }

  console.log(`Queue topic: ${queueItem.id}`);
  console.log(`Title: ${queueItem.title}`);
  console.log(`Sources: ${queueItem.requiredSources.length} curated`);
  console.log(`Primary model: ${PRIMARY_MODEL}\n`);

  let story;
  try {
    story = await generateForQueueItem(queueItem);
  } catch (e) {
    console.error(`\nFAILED: ${e.message}`);
    console.error("Run npm run validate:queue to check queue items.");
    process.exit(1);
  }

  const slug = queueItem.id;
  const finalCheck = validateStory(story, { allowedSources: queueItem.requiredSources });
  if (!finalCheck.ok) {
    console.error(`Refusing to save: ${finalCheck.errors.join("; ")}`);
    process.exit(1);
  }

  console.log(`\nFinal: ${finalCheck.stats.words} words, ${finalCheck.stats.refs} refs, ${finalCheck.stats.citations} citations`);

  const image = await attachImage(queueItem, story);
  console.log(`Image: ${image.card ? "LOC" : "imagePrompt"}`);

  const article = {
    slug,
    title: story.title || queueItem.title,
    excerpt: story.excerpt || queueItem.hook,
    readMinutes: Math.max(5, Math.ceil(finalCheck.stats.words / 220)),
    category: story.category || queueItem.category,
    content: story.content,
    references: story.references,
    image,
    relatedVideoId: null,
    autoGenerated: true,
    queueId: queueItem.id,
    createdAt: new Date().toISOString(),
  };

  writeFileSync(join(CONTENT_DIR, `${slug}.json`), JSON.stringify(article, null, 2), "utf-8");
  markQueueItemPublished(queue, queueItem.id, slug);
  saveQueue(queue);

  console.log(`\nSaved: content/articles/${slug}.json`);
  console.log(`Updated: content/story-queue.json (${queueItem.id} → published)`);
  console.log("\nDone.");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
