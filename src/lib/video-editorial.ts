import type { YouTubeVideo } from "./youtube";
import { siteConfig } from "./config";

/**
 * Original editorial notes for long-form videos.
 * Prefer 250–400 words when the subject warrants it; never pad with filler.
 * World-history episodes may link to other videos/topics instead of forcing
 * a mismatched American-history article.
 */
const EDITORIAL: Record<string, string> = {
  BrNGqid8_tY: `Theodore Roosevelt became president in September 1901 after the assassination of William McKinley. He entered office already famous as a Rough Rider, reform governor, and conservationist — and he intended to make the United States behave like a first-rank power.

**“Speak softly and carry a big stick”** was not a throwaway line. For Roosevelt it meant building a modern navy, keeping diplomacy active, and being ready to intervene when talks failed. He mediated the end of the Russo-Japanese War (work that earned him the 1905 Nobel Peace Prize), dispatched the Great White Fleet on a world cruise to advertise American sea power, and asserted a firmer U.S. role in the Caribbean through the Roosevelt Corollary to the Monroe Doctrine.

At home he pressed antitrust cases and used the presidency as a “bully pulpit.” Abroad, the Panama Canal project and crises in the Caribbean showed how quickly naval power and presidential initiative could reshape geography and politics. Critics then and now argue about whether Big Stick statecraft stabilized the hemisphere or entrenched interventionism.

This film walks through Roosevelt’s ranch years, trust-busting fights, and the foreign crises that still shape debates over when America should project force. For written American history on the same era of industrial conflict and presidential power, start with SeeStew stories such as [the Homestead Strike](/articles/homestead-strike-1892) and [the Pullman Strike](/articles/pullman-strike-1894), or browse the [Postwar & Cold War](/hubs/postwar-cold-war) and [Reconstruction & Gilded Age](/hubs/reconstruction-gilded-age) hubs for nearby decades.

More long-form history lives on the [Videos](/videos) index and on [YouTube @SeeStew](${siteConfig.social.youtubeUrl}).`,

  mLuyPuMyVMc: `Long before Jamestown became the textbook English foothold, France tried to plant a colony on the Atlantic coast of Florida. **René Goulaine de Laudonnière** led the Fort Caroline venture near present-day Jacksonville in the mid-1560s — a fragile outpost of hunger, mutiny, religious tension, and imperial rivalry.

Spain already claimed the region. In 1565 Pedro Menéndez de Avilés struck the French settlement, founded St. Augustine, and ended France’s first serious bid for that stretch of coast. The clash was about maps and monarchs, but also about whether Protestant and Catholic empires could coexist in the same waters. Menéndez’s campaign and the founding of St. Augustine are still among the oldest continuous European colonial milestones in what became the United States.

Survivors’ accounts and later colonial records frame how historians narrate early Florida: supply failures, diplomacy with Indigenous neighbors, and the sudden violence of an imperial contest. The film above follows those people and places without pretending the story is a simple U.S. founding myth.

This episode is broader Atlantic history than most SeeStew written Stories, which focus on the later United States. There is no matching article that retells Fort Caroline in full — and we do not invent one. For adjacent colonial reading on this site, see [the Lost Colony of Roanoke](/articles/lost-colony-roanoke) and the [Colonial America](/hubs/colonial-america) hub. For more film-length history, return to [Videos](/videos) or [YouTube @SeeStew](${siteConfig.social.youtubeUrl}).`,

  HCzHfSU_95E: `Antonio Pigafetta sailed with Ferdinand Magellan and lived to finish one of the few firsthand journals of the first circumnavigation. His notes record islands, courts, languages, and shipboard discipline in a level of detail most official reports never attempted.

Magellan died in the Philippines in 1521 during fighting at Mactan. The remaining ships pressed on; Pigafetta was among those who made it back to Europe and completed the narrative that scholars still cite when reconstructing the voyage’s route, encounters, and human cost. The journal matters because it is partial and human — a Venetian observer writing what he saw, including Indigenous societies and the grind of a multi-year voyage, not a polished modern encyclopedia entry.

That perspective is why filmmakers and historians return to Pigafetta when they tell the Magellan story: without his manuscript, large stretches of the expedition would be known only through thinner administrative traces.

This subject is world exploration history, not a U.S. domestic event, so SeeStew does not force a mismatched American article link. Watch the companion long-form films on [Videos](/videos), including the Fort Caroline episode on early colonial rivalry, or explore written American colonial stories via [Colonial America](/hubs/colonial-america). The full upload also lives on [YouTube @SeeStew](${siteConfig.social.youtubeUrl}).`,
};

function paragraphsFromDescription(description: string): string {
  const cleaned = description
    .replace(/#\w+/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!cleaned || cleaned.length < 40) {
    return "";
  }

  const chunks = cleaned.split(/\n\n+/).filter((p) => p.trim().length > 20);
  return chunks
    .slice(0, 4)
    .map((p) => p.trim())
    .join("\n\n");
}

function defaultEditorial(video: YouTubeVideo): string {
  const fromDesc = paragraphsFromDescription(video.description);
  const lead =
    video.format === "short"
      ? `This is a SeeStew short on **${video.title}**. It is pulled straight from our [YouTube channel](${siteConfig.social.youtubeUrl}) and plays here so you can watch without switching apps.`
      : `**${video.title}** is a SeeStew documentary-length history film. We host it here with notes and links; the upload also lives on [YouTube](${siteConfig.social.youtubeUrl}).`;

  const body =
    fromDesc ||
    (video.format === "short"
      ? "We post these when a story needs a quick hook before the full episode goes up. Check the long-form section on this site or the main channel feed for the complete version."
      : "The episode covers the people, turning points, and context for this subject. Details and sources appear in the YouTube description where available.");

  const footer = `Browse more on the [Videos](/videos) page, or read [Stories](/articles) for sourced American-history articles. Follow [@see.stew](${siteConfig.social.instagramUrl}) on Instagram and [TikTok](${siteConfig.social.tiktokUrl}) for clips.`;

  return `${lead}\n\n${body}\n\n${footer}`;
}

export function getVideoEditorial(video: YouTubeVideo): string {
  return EDITORIAL[video.id] ?? defaultEditorial(video);
}

const UNIQUE_SUMMARIES: Record<string, string> = {
  BrNGqid8_tY:
    "Theodore Roosevelt took office in 1901 and used a strong navy — Big Stick diplomacy — to back American talks abroad.",
  mLuyPuMyVMc:
    "Before Jamestown dominated the story, France tried to hold Fort Caroline near today's Jacksonville; Spain destroyed it in 1565.",
  HCzHfSU_95E:
    "Antonio Pigafetta sailed with Magellan and wrote one of the only eyewitness accounts of the first voyage around the world.",
};

/** One or two sentences from the video's own description — never invented facts. */
export function getVideoSummary(video: YouTubeVideo): string {
  if (UNIQUE_SUMMARIES[video.id]) return UNIQUE_SUMMARIES[video.id];

  const cleaned = video.description
    .replace(/#\w+/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length >= 40) {
    const first = cleaned.split(/(?<=[.!?])\s+/)[0] ?? cleaned;
    return first.length > 280 ? `${first.slice(0, 277).replace(/\s+\S*$/, "")}…` : first;
  }

  return video.format === "short"
    ? `A SeeStew history short on ${video.title}.`
    : `A SeeStew documentary on ${video.title}.`;
}
