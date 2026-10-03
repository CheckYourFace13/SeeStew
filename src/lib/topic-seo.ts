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
};

/** Hub copy that is unique per topic. Merged into the hubs above by getTopicHub. */
const topicExtras: Record<string, Pick<TopicHub, "moreLabel" | "overview" | "startHereSlug">> = {
  "weird-america": {
    moreLabel: "More weird American history",
    startHereSlug: "childrens-blizzard-1888",
    overview:
      "This is where the odd, the tragic, and the barely believable live: floods, fires, mine fires, hoaxes, and strange public episodes that left a paper trail. Each story is rebuilt from archives, period newspapers, and scholarly histories, and placed in context instead of being played for a punchline.",
  },
  military: {
    moreLabel: "More military history",
    startHereSlug: "battle-of-los-angeles-1942",
    overview:
      "Military stories here range from wartime scares and domestic deployments to weapons tests and space-program disasters tied to government programs. They draw on official histories, agency reports, and archives, and they focus on what the records actually show.",
  },
  crime: {
    moreLabel: "More true crime history",
    startHereSlug: "radium-girls-1920s",
    overview:
      "These are crimes, cover-ups, and cases of corporate negligence that changed how Americans think about law and responsibility. The focus is on documented outcomes: court records, investigations, and the reforms that followed.",
  },
  scandal: {
    moreLabel: "More scandal history",
    startHereSlug: "great-moon-hoax-1835",
    overview:
      "From hoaxes and fixed games to government cover-ups, these stories look at how scandals unfolded, who was involved, and what investigators and historians could later confirm. Claims are kept to what the sources support.",
  },
  revolution: {
    moreLabel: "More Revolutionary-era history",
    startHereSlug: "whiskey-rebellion-1794",
    overview:
      "Stories from the founding era and the early republic, when the new country was still deciding how much authority its government really had. This topic is small for now and grows as more researched stories publish.",
  },
  politics: {
    moreLabel: "More political history",
    startHereSlug: "bleeding-kansas-1856",
    overview:
      "Political history told through specific episodes: violent clashes over slavery and territory, labor and civil rights flashpoints, and the quieter machinery of government. Each one is tied to named sources so you can follow the evidence.",
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
      "From Lexington to Yorktown, these stories cover the fight for independence with dates, places, and documented sources — not myths.",
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
      "Real scandals, hearings, and cover-ups from U.S. history. We stick to what records support and name our sources.",
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
      "Odd but true: molasses floods, border wars, bizarre elections, and stories your textbook skipped. If we cannot verify a detail, we leave it out.",
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
      "Understand how American politics evolved through real episodes: filibusters, impeachments, redistricting fights, and landmark legislation.",
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
      "Battles, regiments, and strategy from the Revolution through the 20th century, tied to documented accounts.",
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
      "True crime from the American past: cover-ups, workplace catastrophes, and violence that left a paper trail. Every story names its sources.",
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
