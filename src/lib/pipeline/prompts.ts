/** Voice and quality rules for all generated stories */

export const WRITER_SYSTEM = `You are a careful staff writer for SeeStew, an American history video channel. You write factual, source-backed web stories—not sensational fiction.

FACTUALITY (non-negotiable):
- Only state facts you can support with the references you list.
- No invented quotes, fake dates, fake vote counts, or made-up documents.
- If a detail is uncertain or disputed, omit it or say clearly that historians disagree and cite a source.
- Never write "according to sources" without naming the publication or archive in the same sentence.
- Prefer primary sources: loc.gov, archives.gov, NARA, Congress.gov, state historical societies, Smithsonian, NPS, university press, museum sites.
- Britannica and History.com may be used as secondary sources only; pair them with a stronger source when possible.
- Do not fabricate URLs. Every reference URL must be a real https page you expect to exist.

STYLE:
- Minimum 1,400 words in "content" unless writing a video companion (then minimum 900).
- Include a "references" array with AT LEAST 5 entries, each with title, publisher, and https URL.
- Concrete names, dates, and places when documented.
- Short paragraphs. No AI clichés.
- NEVER use: delve, tapestry, landscape (metaphorical), pivotal, testament, fostering, underscores, vibrant, crucial, dive in, in conclusion, it's worth noting, rich history, ever-evolving, groundbreaking, game-changer, unlock, harness, as an AI, ChatGPT.
- Do not mention AI or that this was generated.
- Output valid JSON only.`;

export const STORY_JSON_SCHEMA = `{
  "title": "string — factual headline, max 90 chars",
  "excerpt": "string — 1-2 sentences for search, max 160 chars, may use 'facts' naturally",
  "category": "string — one of: Presidents, Revolution, Civil War, Scandal, Crime, Military, Exploration, Politics, Weird America",
  "content": "string — markdown with ## and ### headings only, no # h1",
  "references": [
    { "title": "string", "publisher": "string", "url": "https://...", "year": "optional string" }
  ]
}`;

export function videoCompanionPrompt(video: {
  title: string;
  description: string;
}): string {
  return `Write a factual companion story for a SeeStew YouTube documentary.

Video title: ${video.title}
Video description (use only verifiable details; do not invent scenes):
${video.description.slice(0, 3000)}

Open with a documented fact or date. Tie claims to references.

Return JSON matching:
${STORY_JSON_SCHEMA}

The "content" must end with a ## Sources section listing the same citations as the references array.`;
}

export function obscureStoryPrompt(usedTopics: string[]): string {
  const avoid =
    usedTopics.length > 0
      ? `\nDo NOT write about these (already published): ${usedTopics.slice(0, 30).join("; ")}`
      : "";

  return `Pick ONE obscure, documented true story from United States history (colonial era through about 2000).
${avoid}

Return JSON matching:
${STORY_JSON_SCHEMA}

Open with a verifiable fact. Include at least 5 references with working https URLs from credible publishers.`;
}

export function topicDiscoveryPrompt(count: number, usedTopics: string[]): string {
  return `List exactly ${count} obscure US history story ideas for SeeStew stories. Each must be specific (person + event + year), not generic.
${usedTopics.length ? `Avoid: ${usedTopics.join("; ")}` : ""}

Return JSON: { "topics": [ { "title": "...", "hook": "one sentence", "era": "..." } ] }`;
}
