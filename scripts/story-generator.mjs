/**
 * Shared story-generation core used by the daily generator and the
 * regeneration script. No side effects on import: create a generator with
 * createGenerator({ apiKey }) and call generateForQueueItem(queueItem).
 *
 * A "queueItem" here is any object with:
 *   { id, title, hook, category, angle, keywords[], requiredSources[],
 *     sourceExcerpts?[] }
 * requiredSources: [{ title, publisher, url, year? }]
 * sourceExcerpts (optional, for grounding): [{ index, title, publisher, text }]
 */

import {
  validateStory,
  finalizeMarkdownContent,
  countWords,
  countInlineCitations,
  getArticleBody,
} from "./article-validation.mjs";

export const MIN_WORDS = 1500;
export const TARGET_WORDS = 2200;
export const MIN_CITATIONS = 4;
export const QR_MIN_WORDS = 280;
export const QR_TARGET_WORDS = 400;
export const QR_MAX_WORDS = 550;
export const QR_MIN_CITATIONS = 2;
const MAX_TOKENS = 16384;
const DEFAULT_FALLBACK_MODEL = "anthropic/claude-3.5-haiku";

export class ModelError extends Error {
  constructor(message, opts = {}) {
    super(message);
    this.name = "ModelError";
    Object.assign(this, opts);
  }
}

export const MARKDOWN_SYSTEM = `You are a staff writer for SeeStew — hard-to-believe TRUE U.S. history stories written for readers who search Google for forgotten disasters, scandals, and documented oddities.

OUTPUT RULES (strict):
- Return ONLY Markdown article text. No JSON. No YAML. No metadata block.
- Do not wrap output in code fences.
- Use ## for section headings (H2). Headings must be specific and searchable (include a concrete place, year, person, or event — never "Introduction", "Conclusion", "Overview", or "Final Thoughts").
- Do NOT open with a heading that just restates the article title; start with a concrete scene, date, or documented fact.
- Short paragraphs. Vivid but accurate prose.
- U.S. history only.

SEARCH / READABILITY (help people who found this via Google):
- In the first 2–3 paragraphs, clearly answer what happened, where, and when.
- Naturally weave the topic keywords from the user prompt into headings and early paragraphs — no keyword stuffing.
- Prefer plain-language explanations of why the event mattered (policy change, death toll, cover-up, court case) over vague drama.
- Include enough named places, dates, and institutions that a skimming reader can verify the story against the Sources list.

FACTUAL ACCURACY (critical — this is a nonfiction history site):
- Never invent names of people, newspapers, organizations, court cases, dates, dollar amounts, casualty counts, or quotations.
- Only state specific names, numbers, and quotes that are well-established historical fact and consistent with the listed sources. If you are not certain of an exact figure or name, describe it qualitatively ("dozens", "a Senate investigation") rather than fabricating a specific.
- Do not attribute the "breaking" of a story to a specific journalist or outlet unless it is a firmly established, verifiable fact.
- When in doubt, leave it out. A shorter, accurate sentence is always better than a confident-sounding invented one.

STYLE — write like a human historian, not an AI. Do NOT use these clichés:
"stands as a (dark) chapter", "serves as a (chilling/stark/poignant/cautionary) reminder", "this article delves/explores into", "would forever alter/change the landscape", "left an indelible mark", "testament to", "in the annals of", "rich tapestry", "plays a pivotal role", "not only... but also...". Vary sentence structure; prefer plain, specific language.

CITATIONS:
- Use inline markers [1], [2], [3], etc. after factual claims in the body.
- Use ONLY the source numbers provided in the user message.
- Include at least 10 inline citations spread through the article body.
- End with a ## Sources section listing each provided source in order (title, publisher, link).

LENGTH: Target ${TARGET_WORDS} words in the article body (minimum ${MIN_WORDS} before Sources).`;

export const QUICK_READ_SYSTEM = `You are a staff writer for SeeStew Quick Reads — short, sourced U.S. history pieces (~1–3 minutes).

OUTPUT RULES (strict):
- Return ONLY Markdown. No JSON. No code fences.
- About ${QR_TARGET_WORDS} words in the body (hard range roughly ${QR_MIN_WORDS}–${QR_MAX_WORDS} before ## Sources).
- Open with one concrete, surprising documented fact (date, place, or detail) — no vague teaser.
- Give enough context that a reader understands what happened and why it mattered.
- Do NOT summarize or compress an existing full SeeStew article; write an original short piece on one focused angle.
- Use 1–3 short ## headings with specific names/years (never "Introduction" / "Conclusion").
- U.S. history only. Named author context: published under Chris on SeeStew.

FACTUAL ACCURACY:
- Never invent names, quotes, numbers, or sources.
- Only use the provided source numbers for citations.
- If unsure of a detail, omit it rather than fabricate.

CITATIONS:
- Use inline [1], [2], … after factual claims.
- At least ${QR_MIN_CITATIONS} distinct citation markers in the body.
- End with ## Sources listing every provided source in order.

STYLE: plain, specific, human. Avoid AI clichés ("dark chapter", "stands as a reminder", "delves into").`;

function stripControlChars(s) {
  return s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
}

/** Extract plain Markdown from a model response (tolerates stray JSON/fences). */
export function cleanMarkdown(raw) {
  let s = raw.trim();
  if (s.startsWith("{") && s.includes('"content"')) {
    try {
      const parsed = JSON.parse(s.replace(/^```json\s*/i, "").replace(/```\s*$/i, ""));
      if (typeof parsed.content === "string") {
        s = parsed.content.replace(/\\n/g, "\n");
      }
    } catch {
      /* use raw */
    }
  }
  s = s.replace(/^```(?:markdown|md)?\s*/i, "").replace(/\s*```\s*$/gi, "").trim();
  return stripControlChars(s);
}

export function formatSourceList(sources) {
  return sources.map((s, i) => `[${i + 1}] ${s.title} — ${s.publisher} — ${s.url}`).join("\n");
}

function formatSourceExcerpts(excerpts) {
  if (!excerpts?.length) return "";
  const usable = excerpts.filter((e) => e.text && e.text.trim().length > 40);
  if (!usable.length) return "";
  return usable
    .map((e) => `[${e.index}] ${e.title} — ${e.publisher}:\n"""\n${e.text.trim()}\n"""`)
    .join("\n\n");
}

function buildMetadata(queueItem) {
  const hook = queueItem.hook || "";
  const primaryKeyword = (queueItem.keywords || [])[0];
  // Prefer a search-friendly description: hook + primary query phrase when space allows.
  let excerpt = hook;
  if (primaryKeyword && !hook.toLowerCase().includes(primaryKeyword.toLowerCase())) {
    const withKw = `${hook} (${primaryKeyword})`;
    if (withKw.length <= 160) excerpt = withKw;
  }
  if (excerpt.length > 160) excerpt = `${excerpt.slice(0, 157)}...`;

  // SERP title: lead with the #1 search phrase / short event name (≤ ~48 chars before brand).
  let seoTitle = primaryKeyword || queueItem.title;
  if (seoTitle.length > 48) {
    seoTitle = seoTitle.slice(0, 48).replace(/\s+\S*$/, "");
  }

  let seoDescription = excerpt;
  if (seoDescription.length < 110) {
    seoDescription = `${seoDescription} Documented American history with named sources.`;
  }
  if (seoDescription.length > 155) {
    seoDescription = `${seoDescription.slice(0, 152).replace(/\s+\S*$/, "")}...`;
  }

  return {
    title: queueItem.title,
    slug: queueItem.id,
    excerpt,
    seoTitle,
    seoDescription,
    category: queueItem.category,
  };
}

function buildWritePrompt(queueItem) {
  const n = queueItem.requiredSources.length;
  const excerptBlock = formatSourceExcerpts(queueItem.sourceExcerpts);
  return `Write a full article in Markdown only.

TOPIC: ${queueItem.title}
HOOK: ${queueItem.hook}
CATEGORY: ${queueItem.category}
ANGLE: ${queueItem.angle}
KEYWORDS: ${(queueItem.keywords || []).join(", ")}

ALLOWED SOURCES — cite ONLY with [1] through [${n}]:
${formatSourceList(queueItem.requiredSources)}
${
  excerptBlock
    ? `\nSOURCE MATERIAL — base every specific fact (names, dates, numbers, quotations) on these excerpts and well-established history. If a specific detail is NOT supported by this material, describe it qualitatively or leave it out. Do not copy sentences verbatim; write in your own words.\n\n${excerptBlock}\n`
    : ""
}
Requirements:
- ${TARGET_WORDS}+ words in the body (before ## Sources)
- At least 10 inline [n] citations in factual paragraphs
- Multiple ## section headings that a searcher would understand (include year/place/person where natural)
- Open by stating what happened, where, and when in plain English
- End with ## Sources listing all ${n} sources above in order
- Markdown only — no JSON`;
}

function buildExpandPrompt(queueItem, markdown) {
  const body = getArticleBody(markdown);
  return `Expand this Markdown article to 1800–2200 words.
Preserve existing facts and citations. Do not invent new names, dates, numbers, or quotes. Add more inline [1]–[${queueItem.requiredSources.length}] markers.
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
Do not remove content. Do not invent new facts. Return the full Markdown article including ## Sources.

SOURCES:
${formatSourceList(queueItem.requiredSources)}

ARTICLE:
${body.slice(0, 55000)}`;
}

export function buildArticleDraft(queueItem, markdown) {
  const meta = buildMetadata(queueItem);
  const { content, references } = finalizeMarkdownContent(markdown, queueItem.requiredSources);
  return { ...meta, content, references };
}

/**
 * Create a generator bound to an OpenRouter API key.
 * @param {{ apiKey: string, primaryModel?: string, fallbackModel?: string, log?: Function }} opts
 */
export function createGenerator({
  apiKey,
  primaryModel = "openai/gpt-4o-mini",
  fallbackModel = DEFAULT_FALLBACK_MODEL,
  log = console.log,
} = {}) {
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is required to create a generator");

  async function callOpenRouter(messages, { model, maxTokens = MAX_TOKENS, temperature = 0.35 } = {}) {
    log(`  OpenRouter → ${model}`);
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://seestew.com",
        "X-Title": "SeeStew Story Generator",
      },
      body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature }),
    });

    if (!res.ok) {
      const text = (await res.text()).slice(0, 1000);
      let msg = text;
      try {
        msg = JSON.parse(text).error?.message || text;
      } catch {}
      log(`  [FAILED] status=${res.status} model=${model}`);
      log(`  ${String(msg).slice(0, 400)}`);
      throw new ModelError(`HTTP ${res.status}: ${String(msg).slice(0, 200)}`, { status: res.status, model });
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new ModelError("Empty model response", { model });
    return cleanMarkdown(content);
  }

  function writeMarkdown(queueItem, model) {
    return callOpenRouter(
      [
        { role: "system", content: MARKDOWN_SYSTEM },
        { role: "user", content: buildWritePrompt(queueItem) },
      ],
      { model, temperature: 0.3 }
    );
  }

  function expandMarkdown(queueItem, markdown, model) {
    return callOpenRouter(
      [
        { role: "system", content: MARKDOWN_SYSTEM },
        { role: "user", content: buildExpandPrompt(queueItem, markdown) },
      ],
      { model, temperature: 0.25 }
    );
  }

  function repairCitations(queueItem, markdown, model) {
    return callOpenRouter(
      [
        {
          role: "system",
          content:
            "You add inline citation markers to historical articles. Return Markdown only. No JSON. No fences. Do not invent facts.",
        },
        { role: "user", content: buildCitationRepairPrompt(queueItem, markdown) },
      ],
      { model, temperature: 0.2 }
    );
  }

  function logDraftStats(label, draft) {
    const words = countWords(draft.content);
    const bodyWords = countWords(getArticleBody(draft.content));
    const citations = countInlineCitations(draft.content);
    log(`  ${label}: ${words} total words, ${bodyWords} body words, ${citations} citation markers`);
  }

  async function refineMarkdown(queueItem, markdown, model) {
    let current = markdown;
    let draft = buildArticleDraft(queueItem, current);
    logDraftStats("Initial draft", draft);

    if (countWords(getArticleBody(draft.content)) < MIN_WORDS) {
      log(`  Body under ${MIN_WORDS} words — expansion call...`);
      current = await expandMarkdown(queueItem, current, model);
      draft = buildArticleDraft(queueItem, current);
      logDraftStats("After expansion", draft);
    }

    let citations = countInlineCitations(draft.content);
    if (citations < MIN_CITATIONS) {
      log(`  Only ${citations} citations — repair call...`);
      current = await repairCitations(queueItem, current, model);
      draft = buildArticleDraft(queueItem, current);
      logDraftStats("After citation repair", draft);
      citations = countInlineCitations(draft.content);
    }

    if (citations < MIN_CITATIONS) {
      log(`  Still ${citations} citations — second repair attempt...`);
      current = await repairCitations(queueItem, current, model);
      draft = buildArticleDraft(queueItem, current);
      logDraftStats("After 2nd citation repair", draft);
    }

    if (countWords(getArticleBody(draft.content)) < MIN_WORDS) {
      log(`  Still under ${MIN_WORDS} body words — second expansion...`);
      current = await expandMarkdown(queueItem, current, model);
      draft = buildArticleDraft(queueItem, current);
      logDraftStats("After 2nd expansion", draft);
    }

    return draft;
  }

  async function generateForQueueItem(queueItem) {
    const models = [primaryModel];
    if (!models.includes(fallbackModel)) models.push(fallbackModel);

    let lastError = "";
    for (const model of models) {
      try {
        log(`\nGenerating [${queueItem.id}] with ${model}...`);
        const markdown = await writeMarkdown(queueItem, model);
        const draft = await refineMarkdown(queueItem, markdown, model);

        const validation = validateStory(draft, { allowedSources: queueItem.requiredSources });
        if (!validation.ok) {
          lastError = validation.errors.join("; ");
          log(`  Validation failed: ${lastError}`);
          continue;
        }
        return draft;
      } catch (e) {
        lastError = e.message;
        log(`  Error: ${lastError}`);
        if (e instanceof ModelError && [402, 403, 404].includes(e.status)) break;
      }
    }
    throw new Error(lastError || "All models failed");
  }

  function buildQuickReadPrompt(queueItem) {
    const n = queueItem.requiredSources.length;
    return `Write a SeeStew Quick Read in Markdown only.

TOPIC: ${queueItem.title}
HOOK: ${queueItem.hook}
CATEGORY: ${queueItem.category}
ANGLE (focus — do not expand into a full survey): ${queueItem.angle}
KEYWORDS: ${(queueItem.keywords || []).join(", ")}
EVENT YEAR: ${queueItem.eventYear ?? "unknown"}
ERA: ${queueItem.historicalEra ?? "unknown"}

ALLOWED SOURCES — cite ONLY with [1] through [${n}]:
${formatSourceList(queueItem.requiredSources)}

Requirements:
- Body about ${QR_TARGET_WORDS} words (${QR_MIN_WORDS}–${QR_MAX_WORDS})
- Strong factual opening with what / where / when
- One surprising documented detail, then brief context
- At least ${QR_MIN_CITATIONS} inline citations
- ## Sources with all ${n} sources in order
- Original prose — not a condensed remake of a longer SeeStew article
- Markdown only — no JSON`;
  }

  async function generateQuickReadForQueueItem(queueItem) {
    const models = [primaryModel];
    if (!models.includes(fallbackModel)) models.push(fallbackModel);
    const n = queueItem.requiredSources?.length || 0;
    if (n < 2) throw new Error("Quick Read queue item needs ≥2 curated sources");

    let lastError = "";
    for (const model of models) {
      try {
        log(`\nGenerating Quick Read [${queueItem.id}] with ${model}...`);
        const markdown = await callOpenRouter(
          [
            { role: "system", content: QUICK_READ_SYSTEM },
            { role: "user", content: buildQuickReadPrompt(queueItem) },
          ],
          { model, temperature: 0.3, maxTokens: 4096 }
        );
        let draft = buildArticleDraft(queueItem, markdown);
        log(
          `  Draft: ${countWords(getArticleBody(draft.content))} body words, ${countInlineCitations(draft.content)} citations`
        );

        let bodyWords = countWords(getArticleBody(draft.content));
        if (bodyWords < QR_MIN_WORDS) {
          log(`  Under ${QR_MIN_WORDS} words — brief expand...`);
          const expanded = await callOpenRouter(
            [
              { role: "system", content: QUICK_READ_SYSTEM },
              {
                role: "user",
                content: `Expand this Quick Read to about ${QR_TARGET_WORDS} words. Do not invent facts. Keep ## Sources. Markdown only.\n\n${getArticleBody(draft.content).slice(0, 20000)}`,
              },
            ],
            { model, temperature: 0.25, maxTokens: 4096 }
          );
          draft = buildArticleDraft(queueItem, expanded);
          bodyWords = countWords(getArticleBody(draft.content));
        }

        if (bodyWords > QR_MAX_WORDS + 80) {
          lastError = `Quick Read too long (${bodyWords} words)`;
          log(`  ${lastError}`);
          continue;
        }

        let citations = countInlineCitations(draft.content);
        if (citations < QR_MIN_CITATIONS) {
          log(`  Only ${citations} citations — repair...`);
          const repaired = await callOpenRouter(
            [
              {
                role: "system",
                content:
                  "Add inline [n] citations to this Quick Read. Use only the listed sources. Markdown only. Do not invent facts.",
              },
              {
                role: "user",
                content: `SOURCES:\n${formatSourceList(queueItem.requiredSources)}\n\nARTICLE:\n${getArticleBody(draft.content).slice(0, 20000)}`,
              },
            ],
            { model, temperature: 0.2, maxTokens: 4096 }
          );
          draft = buildArticleDraft(queueItem, repaired);
        }

        const validation = validateStory(draft, {
          allowedSources: queueItem.requiredSources,
          format: "quick-read",
        });
        if (!validation.ok) {
          lastError = validation.errors.join("; ");
          log(`  Validation failed: ${lastError}`);
          continue;
        }
        return draft;
      } catch (e) {
        lastError = e.message;
        log(`  Error: ${lastError}`);
        if (e instanceof ModelError && [402, 403, 404].includes(e.status)) break;
      }
    }
    throw new Error(lastError || "All models failed for Quick Read");
  }

  return { generateForQueueItem, generateQuickReadForQueueItem, callOpenRouter };
}
