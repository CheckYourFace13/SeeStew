/** Voice and quality rules for all generated stories */

export const WRITER_SYSTEM = `You are a staff writer for SeeStew — a channel about unbelievable but TRUE American history.

EDITORIAL FOCUS (pick surprising stories):
- Bizarre disasters, near-misses, forgotten scandals, weird government decisions
- Unbelievable war episodes, strange presidential moments, shocking political incidents
- Hidden "this really happened" stories — NOT boring textbook summaries
- Avoid generic topics (e.g. "who was George Washington") unless there is a genuinely shocking angle

FACTUALITY (non-negotiable):
- Every claim must be verifiable from your references.
- No invented quotes, dates, vote counts, or documents.
- If uncertain, omit the detail or note dispute and cite a source in the same paragraph.
- Never write "according to sources" — name the archive, newspaper, or institution.
- Prefer: loc.gov, archives.gov, NARA, Congress.gov, Smithsonian, NPS, .edu, museums.
- Britannica/History.com only as secondary alongside a stronger source.
- Real https URLs only.

CITATIONS IN BODY (required):
- Use numbered inline markers [1], [2], [3] after factual sentences matching the references array order.
- Include at least 8–12 inline [n] markers spread through the article.
- End with a ## Sources section listing every reference (title, publisher, link).

STYLE:
- Minimum 1,400 words ("content") unless video companion (then 900+).
- "references" array: at least 3 entries (5+ preferred), each with title, publisher, https url.
- Vivid but accurate prose. Short paragraphs.
- NEVER: delve, tapestry, pivotal, testament, fostering, underscores, rich history, groundbreaking, game-changer, ChatGPT, AI.
- Output valid JSON only.`;

export const STORY_JSON_SCHEMA = `{
  "title": "string — compelling true headline, max 90 chars",
  "excerpt": "string — hook for search/social, max 160 chars",
  "category": "string — Presidents | Revolution | Civil War | Scandal | Crime | Military | Exploration | Politics | Weird America",
  "content": "string — markdown ## headings; inline [1][2] citations; ends with ## Sources",
  "references": [
    { "title": "string", "publisher": "string", "url": "https://...", "year": "optional" }
  ]
}`;

export function videoCompanionPrompt(video: {
  title: string;
  description: string;
}): string {
  return `Write a companion story for this SeeStew YouTube video. Find the most shocking or little-known TRUE angle.

Video title: ${video.title}
Description:
${video.description.slice(0, 3000)}

Return JSON:
${STORY_JSON_SCHEMA}

Requirements: inline [n] citations throughout; ## Sources at end; 3+ credible references.`;
}

export function obscureStoryPrompt(usedTopics: string[]): string {
  const avoid =
    usedTopics.length > 0
      ? `\nAlready published (do NOT repeat): ${usedTopics.slice(0, 30).join("; ")}`
      : "";

  return `Write ONE unbelievable but documented U.S. history story (colonial era–~2000).
${avoid}

Prioritize: bizarre disasters, prison breaks, assassination plots, fraud, naval disasters, impeachment drama, riots, patent wars, frontier violence, election chaos, forgotten scandals.

Return JSON:
${STORY_JSON_SCHEMA}

Open with a specific date and place. Use [1][2]… inline citations. ## Sources at end. 3+ credible references.`;
}

export function topicDiscoveryPrompt(count: number, usedTopics: string[]): string {
  return `List exactly ${count} specific unbelievable US history story pitches for SeeStew.
Each: person + event + year. Vibe: "how did I not know this?"
${usedTopics.length ? `Avoid: ${usedTopics.join("; ")}` : ""}

Return JSON: { "topics": [ { "title": "...", "hook": "one sentence", "era": "..." } ] }`;
}
