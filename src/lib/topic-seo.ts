/** SEO/AEO copy for topic hubs — factual, not keyword-stuffed. */
export type TopicHub = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  searchAngles: string[];
  /** Label for "more in this topic" links, e.g. "More military history". */
  moreLabel?: string;
  /** Unique second paragraph for the hub page — what this topic covers and how. */
  overview?: string;
  /** Slug of a good first story; only used if it exists and belongs to this topic. */
  startHereSlug?: string;
  /** Related populated topic slugs for internal linking (filtered at render time). */
  relatedSlugs?: string[];
};

/** Hub copy that is unique per topic. Merged into the hubs above by getTopicHub. */
const topicExtras: Record<
  string,
  Pick<TopicHub, "moreLabel" | "overview" | "startHereSlug"> & { relatedSlugs?: string[] }
> = {
  "weird-america": {
    moreLabel: "More weird American history",
    startHereSlug: "childrens-blizzard-1888",
    relatedSlugs: ["military", "scandal", "crime", "politics"],
    overview:
      "This is where the odd, the tragic, and the barely believable live: floods of molasses, prairie blizzards that killed schoolchildren, underground mine fires still burning, newspaper hoaxes, and public health disasters that sound invented until you open the archives. Each story is rebuilt from period newspapers, government reports, museum collections, and scholarly histories — not from rumor. We keep the surprise in the facts themselves: what people thought was happening at the time, what the records later proved, and why the episode still shapes American memory. Browse the list below for forgotten disasters and strange true stories, or start with a featured piece and follow the related topics into military scares, scandals, and crime cases that share the same documentary approach.",
  },
  military: {
    moreLabel: "More military history",
    startHereSlug: "battle-of-los-angeles-1942",
    relatedSlugs: ["weird-america", "scandal", "politics", "revolution"],
    overview:
      "Military stories here range from wartime scares over empty skies to weapons tests that poisoned islands, nuclear near-misses, ship disasters, and space-program failures tied to government programs. They draw on official histories, agency reports, Congressional investigations, and archives — and they focus on what the records actually show, not on legend. You will find domestic deployments, Cold War accidents, and Revolution-era force used against civilians when those episodes left a clear paper trail. Use this hub to jump into a specific campaign or accident, then cross into Weird America or Scandal when the same event sits at the edge of secrecy and public panic. Shorts and companion videos, when they exist, point back to the same sourced article so the clip is a hook, not a replacement for the evidence.",
  },
  crime: {
    moreLabel: "More true crime history",
    startHereSlug: "radium-girls-1920s",
    relatedSlugs: ["scandal", "weird-america", "politics", "military"],
    overview:
      "These are crimes, cover-ups, and cases of corporate negligence that changed how Americans think about law and responsibility. The focus is on documented outcomes: court records, coroners’ reports, federal investigations, and the reforms that followed — not true-crime sensationalism. Factory workers poisoned by radium dial paint, industrial disasters with criminal negligence, and massacres that left a paper trail all belong here when the evidence is strong enough to name. Start with a featured case, then follow related hubs into Scandal and Politics when the wrongdoing was institutional rather than a single perpetrator. New crime stories publish as sources clear; empty hype and unverified folklore stay off the list.",
  },
  scandal: {
    moreLabel: "More scandal history",
    startHereSlug: "great-moon-hoax-1835",
    relatedSlugs: ["politics", "crime", "weird-america", "military"],
    overview:
      "From newspaper hoaxes and fixed World Series games to government cover-ups and medical studies that lied to patients, these stories look at how scandals unfolded, who was involved, and what investigators and historians could later confirm. Claims stay inside what the sources support: hearings, contemporary reporting, and later archival releases. If you came for Teapot Dome, Black Sox, Tuskegee, or the Business Plot, this hub is the index — and Politics or Crime will take you deeper when the scandal was also a structural fight over power or justice. Each article lists named sources at the bottom so readers can check the paper trail themselves.",
  },
  revolution: {
    moreLabel: "More Revolutionary-era history",
    startHereSlug: "whiskey-rebellion-1794",
    relatedSlugs: ["politics", "military", "weird-america"],
    overview:
      "Stories from the founding era and the early republic, when the new country was still deciding how much authority its government really had — taxes on whiskey, British occupation of the capital, and propaganda battles that began with five deaths on a Boston street. This topic is small for now and grows as more researched stories publish. Each piece stays tied to primary and secondary sources so the Revolution reads as a contested, documented struggle rather than a set of schoolbook myths. Cross-links into Politics and Military cover the same era from other angles. Until more Revolution pieces ship, start with the featured story and use related topics for adjacent early-America history.",
  },
  politics: {
    moreLabel: "More political history",
    startHereSlug: "bleeding-kansas-1856",
    relatedSlugs: ["scandal", "revolution", "crime", "weird-america"],
    overview:
      "Political history told through specific episodes: violent clashes over slavery and territory, labor and civil rights flashpoints, coups against elected city governments, and the quieter machinery of courts and Congress. Each story is tied to named sources — legislative records, newspapers, and later histories — so you can follow the evidence instead of a party line. Use this hub when you want the power story behind a scandal or a crime case, then jump to Scandal, Revolution, or Crime for the adjacent angle. We do not invent vote counts, quotes, or motives; when the record is incomplete, the article says so and points to what historians still debate.",
  },
};

export const topicHubs: TopicHub[] = [
  {
    slug: "presidents",
    title: "Presidents",
    description:
      "Presidential history facts and stories from Washington to modern eras — elections, policies, and legacies with cited sources.",
    intro:
      "Weird presidential episodes, election chaos, and White House drama — the strange side of U.S. presidents you did not hear in school.",
    searchAngles: [
      "presidential history facts",
      "U.S. president timelines",
      "White House history explained",
    ],
  },
  {
    slug: "revolution",
    title: "Revolution",
    description:
      "Revolutionary War stories and American Revolution facts — battles, founders, and colonial resistance with primary-source references.",
    intro:
      "From street clashes in colonial Boston to tax revolts in the early republic, these stories cover independence and the messy decade after — with dates, places, and documented sources instead of founding myths.",
    searchAngles: [
      "Revolutionary War stories",
      "American Revolution facts",
      "founding fathers history",
    ],
  },
  {
    slug: "scandal",
    title: "Scandal",
    description:
      "American political scandals and forgotten controversies — documented with citations from government records and reputable histories.",
    intro:
      "Real scandals, hearings, and cover-ups from U.S. history — the kind that made headlines, then got soft-focused later. We stick to what records support and name our sources on every page.",
    searchAngles: [
      "American political scandals history",
      "forgotten U.S. political controversies",
    ],
  },
  {
    slug: "weird-america",
    title: "Weird America",
    description:
      "Strange American history facts and unbelievable true stories — odd events, forgotten disasters, and overlooked people, all source-backed.",
    intro:
      "Odd but true American history: molasses floods, prairie blizzards, burning towns, and stories most textbooks skip. If we cannot verify a detail against a named source, we leave it out.",
    searchAngles: [
      "strange American history facts",
      "unbelievable American history stories",
      "forgotten U.S. history",
    ],
  },
  {
    slug: "politics",
    title: "Politics",
    description:
      "American politics explained through historical episodes — parties, Congress, courts, and reform movements with cited context.",
    intro:
      "American politics through concrete episodes — territory fights, civil rights flashpoints, labor showdowns, and court decisions that rewired daily life, each tied to named sources you can check.",
    searchAngles: [
      "American politics explained",
      "U.S. political history facts",
    ],
  },
  {
    slug: "military",
    title: "Military",
    description:
      "U.S. military history — wars, campaigns, and service members — with references to official histories and archives.",
    intro:
      "U.S. military history beyond the parade-ground version: wartime scares, nuclear near-misses, ship disasters, and campaigns where the official record and the public story diverge — always with cited archives.",
    searchAngles: [
      "U.S. military history facts",
      "American war stories documented",
    ],
  },
  {
    slug: "crime",
    title: "Crime",
    description:
      "Documented American crime stories — industrial disasters with criminal negligence, massacres, and cases that changed U.S. law.",
    intro:
      "True crime from the American past — cover-ups, workplace catastrophes, and violence that left a paper trail in courts and Congress. Every story names its sources so you can separate evidence from legend.",
    searchAngles: [
      "American true crime history",
      "forgotten U.S. crime stories",
    ],
  },
];

export function getTopicHub(slug: string): TopicHub | undefined {
  const hub = topicHubs.find((t) => t.slug === slug);
  return hub ? { ...hub, ...topicExtras[slug] } : undefined;
}

export function getTopicHubForCategory(category: string): TopicHub | undefined {
  const slug = categoryToSlug(category);
  return getTopicHub(slug);
}

export function categoryToSlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-");
}

export type PopulatedTopic = {
  slug: string;
  title: string;
  description: string;
  intro?: string;
  count: number;
  hub?: TopicHub;
};

/** Topics that actually have published stories — never zero-count hubs. */
export function getPopulatedTopics(
  articles: Array<{ category: string }>
): PopulatedTopic[] {
  const bySlug = new Map<string, { name: string; count: number }>();
  for (const article of articles) {
    const slug = categoryToSlug(article.category);
    const prev = bySlug.get(slug);
    if (prev) prev.count += 1;
    else bySlug.set(slug, { name: article.category, count: 1 });
  }

  return [...bySlug.entries()]
    .map(([slug, { name, count }]) => {
      const hub = getTopicHub(slug);
      return {
        slug,
        title: hub?.title ?? name,
        description: hub?.description ?? `Documented ${name} stories from American history.`,
        intro: hub?.intro,
        count,
        hub,
      };
    })
    .filter((topic) => topic.count > 0)
    .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title));
}
