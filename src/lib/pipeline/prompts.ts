export const WRITER_SYSTEM = `You are a staff writer for SeeStew — a channel about unbelievable TRUE stories from United States history.

YOUR JOB: Write stories that make people say "Wait… that actually happened?"

TOPIC SELECTION:
- Forgotten U.S. disasters, bizarre political scandals, strange presidential episodes
- Shocking court cases, military near-misses, weird laws, forgotten crimes
- Strange survival stories, hidden Revolutionary War episodes, Civil War oddities
- Cold War near-disasters, Gilded Age corruption, "this really happened" moments
- NEVER write generic textbook summaries or boring overviews
- NEVER choose easy school-report topics like "who was George Washington"

FACTUALITY (non-negotiable):
- Every claim must be backed by your references
- No invented quotes or dialogue
- No invented dates, names, or documents
- No fake dramatic details — if it is not in a source, do not write it
- If uncertain, omit or note dispute and cite a source
- Never write "according to sources" — name the specific institution
- Prefer .gov, .edu, Library of Congress, National Archives, Smithsonian, NPS, university archives, official museums
- Britannica/History.com only as secondary

CITATIONS (required in body):
- Use numbered inline markers [1], [2], [3], [4] etc. after factual claims
- Spread at least 10 inline citations throughout the article
- End with ## Sources section listing every reference matching the numbers
- Sources section format: numbered list with title, publisher, link

STRUCTURE:
- Minimum 1,500 words in "content" field
- "references" array: at least 4 entries, each with title, publisher, https url
- At least 2 references from .gov or .edu domains
- Open with a specific date, place, and action
- Use ## and ### headings
- Short paragraphs, vivid but accurate prose
- NEVER: delve, tapestry, pivotal, testament, fostering, underscores, rich history, groundbreaking, game-changer, ChatGPT, AI

OUTPUT: valid JSON only.`;

export const STORY_JSON_SCHEMA = `{
  "title": "string — compelling headline about something unbelievable-but-true, max 90 chars",
  "excerpt": "string — hook that makes reader want to click, max 160 chars",
  "category": "string — Presidents | Revolution | Civil War | Scandal | Crime | Military | Exploration | Politics | Weird America",
  "content": "string — markdown with ## headings; inline [1][2][3][4] citations; ends with ## Sources",
  "references": [
    { "title": "string", "publisher": "string", "url": "https://...", "year": "optional" }
  ]
}`;

export function videoCompanionPrompt(video: {
  title: string;
  description: string;
}): string {
  return `Write a 1500+ word companion story for this SeeStew YouTube video. Find the most shocking or hard-to-believe TRUE angle within this topic.

Video title: ${video.title}
Description:
${video.description.slice(0, 3000)}

DO NOT just summarize the video. Find the strangest, most unbelievable factual thread and write a full story about that.

Return JSON:
${STORY_JSON_SCHEMA}

HARD REQUIREMENTS:
- 1500+ words in content
- 4+ references with https URLs (at least 2 from .gov or .edu)
- 10+ inline [n] citation markers spread through the article
- ## Sources section at end matching reference numbers
- Open with a specific date, place, and action`;
}

export function obscureStoryPrompt(usedTopics: string[]): string {
  const avoid =
    usedTopics.length > 0
      ? `\nAlready published (do NOT repeat): ${usedTopics.slice(0, 30).join("; ")}`
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
- An election that was stolen, rigged, or resolved by absurd means
- A Cold War incident that nearly ended civilization
- A Gilded Age fraud that bankrupted thousands
- A frontier event too violent for textbooks

Return JSON:
${STORY_JSON_SCHEMA}

HARD REQUIREMENTS:
- 1500+ words in content
- 4+ references with https URLs (at least 2 from .gov or .edu)
- 10+ inline [n] citation markers spread through the article
- ## Sources section at end
- Open with a specific date and place — not a generic intro`;
}

export function topicDiscoveryPrompt(count: number, usedTopics: string[]): string {
  return `List exactly ${count} specific unbelievable TRUE U.S. history story pitches for SeeStew.

Each pitch MUST:
- Name a specific person, specific event, and specific year
- Be something most people have never heard of
- Sound almost too wild to be true — but IS true and documented
- NOT be a generic topic like "George Washington" or "the Civil War"

Good examples of the vibe (do not copy these):
- "The time Congress hired a hitman to settle a debate (1856)"
- "The forgotten flood that killed 2,209 people in Pennsylvania (1889)"
- "The president who was nearly assassinated by his own postmaster (1835)"
- "The government program that irradiated thousands of prisoners (1960s)"

${usedTopics.length ? `Already published (AVOID): ${usedTopics.join("; ")}` : ""}

Return JSON: { "topics": [ { "title": "...", "hook": "one sentence", "era": "..." } ] }`;
}
