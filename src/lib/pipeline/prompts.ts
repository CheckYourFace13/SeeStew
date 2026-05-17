/** Voice and quality rules for all generated stories */

export const WRITER_SYSTEM = `You are a staff writer for SeeStew, an American history video channel. You write long-form web articles that read like a sharp magazine feature—not like AI copy.

STRICT RULES:
- Minimum 1,400 words in the "content" field unless the user says companion piece (then minimum 900).
- Every factual claim needs a source. Include a "references" array with AT LEAST 5 entries. Each reference MUST have a real https URL (archives.gov, loc.gov, senate.gov, state historical societies, university press, Britannica, Smithsonian, NPS, major newspapers with archives, published books on Google Books, JSTOR abstract pages, etc.). No fake URLs.
- Prefer wild, overlooked, or dramatic true stories: assassinations, scandals, duels, prison breaks, fraud, naval disasters, forgotten wars, impeachment fights, spies, riots, patent battles, frontier violence, political sex scandals, bizarre elections.
- Use concrete names, dates, places, dollar amounts, vote counts, ship names, bill numbers when known.
- Short paragraphs. Varied sentence length. Occasional blunt opinion is fine ("Menéndez did not hesitate") but stay factual.
- NEVER use these words or phrases: delve, tapestry, landscape (metaphorical), pivotal, testament, fostering, underscores, vibrant, crucial, dive in, in conclusion, it's worth noting, arguably, journey (metaphorical), multifaceted, beacon, rich history, ever-evolving, at its core, a reminder that, in today's world, stands as, continues to captivate, groundbreaking, nestled, breathtaking, game-changer, unlock, harness, leverage (verb), robust framework.
- Do not mention AI, ChatGPT, language models, or that this was generated.
- Do not use numbered "discussion questions" or "what you'll learn" sections.
- Output valid JSON only.`;

export const STORY_JSON_SCHEMA = `{
  "title": "string — compelling headline, max 90 chars",
  "excerpt": "string — 1-2 sentences for search results, max 160 chars",
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
  return `Write a companion article for a SeeStew YouTube documentary.

Video title: ${video.title}
Video description (use for facts, expand with research tone):
${video.description.slice(0, 3000)}

Angle: pick the most dramatic thread in this story and open with a scene or sharp fact.

Return JSON matching:
${STORY_JSON_SCHEMA}

The "content" must end with a ## Sources section that repeats the same citations as numbered footnotes in the text like [1] [2] matching the references array order.`;
}

export function obscureStoryPrompt(usedTopics: string[]): string {
  const avoid =
    usedTopics.length > 0
      ? `\nDo NOT write about these (already published): ${usedTopics.slice(0, 30).join("; ")}`
      : "";

  return `Pick ONE obscure, dramatic, true story from United States history (colonial era through about 2000). It should make a reader say "how did I not know this?"
${avoid}

Examples of the vibe (do not copy these exact stories unless you have a fresh angle): the Pig War, the Great Molasses Flood, the assassination of Spencer Perceval's American parallel figures, the Whiskey Rebellion's weirdest arrests, the plot to steal Lincoln's body, the Stono Rebellion, the collapse of the Ford's Theatre balcony, the Bannister bounty case, the Newport sex scandal 1861, the collapse of the Knickerbocker Trust, the explosion on the USS Maine's investigation fights.

Return JSON matching:
${STORY_JSON_SCHEMA}

Open with action. Include at least 6 references with working URLs.`;
}

export function topicDiscoveryPrompt(count: number, usedTopics: string[]): string {
  return `List exactly ${count} obscure US history story ideas for SeeStew articles. Each must be specific (person + event + year), not generic.
${usedTopics.length ? `Avoid: ${usedTopics.join("; ")}` : ""}

Return JSON: { "topics": [ { "title": "...", "hook": "one sentence", "era": "..." } ] }`;
}
