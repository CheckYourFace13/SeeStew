#!/usr/bin/env node
/**
 * Daily story generator — curated queue + Markdown-only model output.
 * Script owns metadata, references, and final JSON. Model writes article body only.
 */

import { readdirSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import {
  validateStory,
  finalizeMarkdownContent,
  countWords,
  countInlineCitations,
  getArticleBody,
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
const MIN_CITATIONS = 4;

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

/** Extract plain Markdown from model response (no JSON). */
function cleanMarkdown(raw) {
  let s = raw.trim();
  if (s.startsWith("{") && s.includes('"content"')) {
    try {
      const parsed = JSON.parse(s.replace(/^```json\s*/i, "").replace(/```\s*$/i, ""));
      if (typeof parsed.content === "string") {
        console.log("  Note: model returned JSON — extracted content field only.");
        s = parsed.content.replace(/\\n/g, "\n");
      }
    } catch {
      /* use raw */
    }
  }
  s = s.replace(/^```(?:markdown|md)?\s*/i, "").replace(/\s*```\s*$/gi, "").trim();
  return stripControlChars(s);
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
  return cleanMarkdown(content);
}

const MARKDOWN_SYSTEM = `You are a staff writer for SeeStew — unbelievable TRUE U.S. history stories.

OUTPUT RULES (strict):
- Return ONLY Markdown article text. No JSON. No YAML. No metadata block.
- Do not wrap output in code fences.
- Use ## for section headings (H2).
- Short paragraphs. Vivid but accurate prose.
- U.S. history only. No invented quotes or facts.

CITATIONS:
- Use inline markers [1], [2], [3], etc. after factual claims in the body.
- Use ONLY the source numbers provided in the user message.
- Include at least 10 inline citations spread through the article body.
- End with a ## Sources section listing each provided source in order (title, publisher, link).

LENGTH: Target ${TARGET_WORDS} words in the article body (minimum ${MIN_WORDS} before Sources).`;

function formatSourceList(sources) {
  return sources
    .map((s, i) => `[${i + 1}] ${s.title} — ${s.publisher} — ${s.url}`)
    .join("\n");
}

function buildMetadata(queueItem) {
  const excerpt = queueItem.hook.length > 160 ? `${queueItem.hook.slice(0, 157)}...` : queueItem.hook;
  return {
    title: queueItem.title,
    slug: queueItem.id,
    excerpt,
    category: queueItem.category,
  };
}

function buildWritePrompt(queueItem) {
  const n = queueItem.requiredSources.length;
  return `Write a full article in Markdown only.

TOPIC: ${queueItem.title}
HOOK: ${queueItem.hook}
CATEGORY: ${queueItem.category}
ANGLE: ${queueItem.angle}
KEYWORDS: ${queueItem.keywords.join(", ")}

ALLOWED SOURCES — cite ONLY with [1] through [${n}]:
${formatSourceList(queueItem.requiredSources)}

Requirements:
- ${TARGET_WORDS}+ words in the body (before ## Sources)
- At least 10 inline [n] citations in factual paragraphs
- Multiple ## section headings
- End with ## Sources listing all ${n} sources above in order
- Markdown only — no JSON`;
}

function buildExpandPrompt(queueItem, markdown) {
  const body = getArticleBody(markdown);
  return `Expand this Markdown article to 1800–2200 words.
Preserve existing facts and citations. Add more inline [1]–[${queueItem.requiredSources.length}] markers.
Return Markdown only (include ## Sources at end).

ALLOWED SOURCES:
${formatSourceList(queueItem.requiredSources)}

CURRENT ARTICLE:
${body.slice(0, 55000)}`;
}

function buildCitationRepairPrompt(queueItem, markdown) {
  const n = queueItem.requiredSources.length;
  const body = getArticleBody(markdown);
  return `Add inline citation markers [1] through [${n}] throughout this article.
Place [n] immediately after factual claims. Use ONLY the sources below.
Do not remove content. Return the full Markdown article including ## Sources.

SOURCES:
${formatSourceList(queueItem.requiredSources)}

ARTICLE:
${body.slice(0, 55000)}`;
}

function buildArticleDraft(queueItem, markdown) {
  const meta = buildMetadata(queueItem);
  const { content, references } = finalizeMarkdownContent(markdown, queueItem.requiredSources);
  return { ...meta, content, references };
}

async function writeMarkdown(queueItem, model) {
  return callOpenRouter(
    [
      { role: "system", content: MARKDOWN_SYSTEM },
      { role: "user", content: buildWritePrompt(queueItem) },
    ],
    { model }
  );
}

async function expandMarkdown(queueItem, markdown, model) {
  return callOpenRouter(
    [
      { role: "system", content: MARKDOWN_SYSTEM },
      { role: "user", content: buildExpandPrompt(queueItem, markdown) },
    ],
    { model, temperature: 0.25 }
  );
}

async function repairCitations(queueItem, markdown, model) {
  return callOpenRouter(
    [
      {
        role: "system",
        content:
          "You add inline citation markers to historical articles. Return Markdown only. No JSON. No fences.",
      },
      { role: "user", content: buildCitationRepairPrompt(queueItem, markdown) },
    ],
    { model, temperature: 0.2 }
  );
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

async function attachImage(queueItem, title) {
  const loc = await searchLocImage(queueItem.imageSearchTerms);
  if (loc?.imageUrl) {
    return {
      card: loc.imageUrl,
      hero: loc.imageUrl,
      alt: loc.title || title,
      credit: "Library of Congress",
      sourcePageUrl: loc.pageUrl,
    };
  }
  return {
    imagePrompt: `Historic editorial illustration: ${queueItem.title}. ${queueItem.angle}. Period-accurate, muted tones, no text, no logos.`,
    alt: title,
  };
}

function logDraftStats(label, draft) {
  const words = countWords(draft.content);
  const bodyWords = countWords(getArticleBody(draft.content));
  const citations = countInlineCitations(draft.content);
  console.log(`  ${label}: ${words} total words, ${bodyWords} body words, ${citations} citation markers`);
}

async function refineMarkdown(queueItem, markdown, model) {
  let current = markdown;
  let draft = buildArticleDraft(queueItem, current);
  logDraftStats("Initial draft", draft);

  const bodyWords = countWords(getArticleBody(draft.content));
  if (bodyWords < MIN_WORDS) {
    console.log(`  Body under ${MIN_WORDS} words — expansion call...`);
    current = await expandMarkdown(queueItem, current, model);
    draft = buildArticleDraft(queueItem, current);
    logDraftStats("After expansion", draft);
  }

  let citations = countInlineCitations(draft.content);
  if (citations < MIN_CITATIONS) {
    console.log(`  Only ${citations} citations — repair call...`);
    current = await repairCitations(queueItem, current, model);
    draft = buildArticleDraft(queueItem, current);
    logDraftStats("After citation repair", draft);
    citations = countInlineCitations(draft.content);
  }

  if (citations < MIN_CITATIONS) {
    console.log(`  Still ${citations} citations — second repair attempt...`);
    current = await repairCitations(queueItem, current, model);
    draft = buildArticleDraft(queueItem, current);
    logDraftStats("After 2nd citation repair", draft);
  }

  const finalBodyWords = countWords(getArticleBody(draft.content));
  if (finalBodyWords < MIN_WORDS) {
    console.log(`  Still under ${MIN_WORDS} body words — second expansion...`);
    current = await expandMarkdown(queueItem, current, model);
    draft = buildArticleDraft(queueItem, current);
    logDraftStats("After 2nd expansion", draft);
  }

  return draft;
}

async function generateForQueueItem(queueItem) {
  const models = [PRIMARY_MODEL];
  if (!models.includes(FALLBACK_MODEL)) models.push(FALLBACK_MODEL);

  let lastError = "";

  for (const model of models) {
    try {
      console.log(`\nGenerating [${queueItem.id}] with ${model}...`);
      const markdown = await writeMarkdown(queueItem, model);
      const draft = await refineMarkdown(queueItem, markdown, model);

      const validation = validateStory(draft, {
        allowedSources: queueItem.requiredSources,
      });

      if (!validation.ok) {
        lastError = validation.errors.join("; ");
        console.log(`  Validation failed: ${lastError}`);
        continue;
      }

      return draft;
    } catch (e) {
      lastError = e.message;
      console.log(`  Error: ${lastError}`);
      if (e instanceof ModelError && [402, 403, 404].includes(e.status)) break;
    }
  }

  throw new Error(lastError || "All models failed");
}

async function main() {
  console.log("=== SeeStew Daily Story Generator (Markdown) ===\n");

  mkdirSync(CONTENT_DIR, { recursive: true });
  initQueueFileIfNeeded();

  const queue = loadQueue();
  const existingSlugs = getExistingSlugs();
  const queueItem = pickNextQueueItem(queue, existingSlugs);

  if (!queueItem) {
    console.error("No pending queue topics available.");
    console.error(`  Pending: ${queue.items.filter((i) => i.status === "pending").length}`);
    process.exit(1);
  }

  console.log(`Queue topic: ${queueItem.id}`);
  console.log(`Title: ${queueItem.title}`);
  console.log(`Curated sources: ${queueItem.requiredSources.length}`);
  console.log(`Primary model: ${PRIMARY_MODEL}\n`);

  let draft;
  try {
    draft = await generateForQueueItem(queueItem);
  } catch (e) {
    console.error(`\nFAILED: ${e.message}`);
    process.exit(1);
  }

  const now = new Date().toISOString();
  const stats = validateStory(draft, { allowedSources: queueItem.requiredSources }).stats;

  console.log(`\nFinal: ${stats.words} words, ${stats.citations} citations, ${stats.refs} refs`);

  const image = await attachImage(queueItem, draft.title);
  console.log(`Image: ${image.card ? "LOC" : "imagePrompt"}`);

  const article = {
    slug: draft.slug,
    title: draft.title,
    excerpt: draft.excerpt,
    readMinutes: Math.max(5, Math.ceil(stats.words / 220)),
    category: draft.category,
    content: draft.content,
    references: draft.references,
    image,
    relatedVideoId: null,
    autoGenerated: true,
    queueId: queueItem.id,
    createdAt: now,
    updatedAt: now,
  };

  writeFileSync(join(CONTENT_DIR, `${draft.slug}.json`), JSON.stringify(article, null, 2), "utf-8");
  markQueueItemPublished(queue, queueItem.id, draft.slug);
  saveQueue(queue);

  console.log(`\nSaved: content/articles/${draft.slug}.json`);
  console.log(`Updated: content/story-queue.json`);
  console.log("\nDone.");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
