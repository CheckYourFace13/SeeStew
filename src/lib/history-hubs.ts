/**
 * Content-rich decade / era / state hubs. Hubs only surface when ≥ MIN articles match.
 * Years come from slug/title. State tags only from title/slug (not body) to cut false hits.
 */

import type { Article } from "./articles";

export const HUB_MIN_ARTICLES = 3;

export type HistoryHubKind = "decade" | "era" | "state";

export type HistoryHub = {
  slug: string;
  kind: HistoryHubKind;
  title: string;
  description: string;
  intro: string;
  decade?: number;
  stateCode?: string;
};

const DECADE_COPY: Record<number, { title: string; description: string; intro: string }> = {
  1870: {
    title: "1870s American History",
    description:
      "Documented American history from the 1870s — fires, floods, and flashpoints with named sources.",
    intro:
      "The 1870s brought industrial disasters, prairie fires, and political violence that left a paper trail. These SeeStew stories stick to archives and contemporary reporting.",
  },
  1880: {
    title: "1880s American History",
    description:
      "American history stories from the 1880s — labor clashes, disasters, and forgotten episodes with citations.",
    intro:
      "From prairie blizzards to labor showdowns, the 1880s left records that still surprise. Each story below cites named sources.",
  },
  1890: {
    title: "1890s American History",
    description:
      "American history from the 1890s — massacres, strikes, and turn-of-the-century disasters with documented sources.",
    intro:
      "The 1890s closed with violence, labor conflict, and disasters that remade cities and policy. These articles stay inside what the records support.",
  },
  1900: {
    title: "1900s American History",
    description:
      "Early 1900s American history — disasters, scandals, and Progressive Era flashpoints with named sources.",
    intro:
      "The first decade of the 1900s mixed Progressive reform with industrial catastrophe. Browse documented stories from that decade.",
  },
  1910: {
    title: "1910s American History",
    description:
      "1910s American history — World War I sabotage, disasters, and labor violence with archival citations.",
    intro:
      "The 1910s pulled America toward world war and workplace tragedy. These stories draw on archives, hearings, and contemporary reporting.",
  },
  1920: {
    title: "1920s American Scandals & Disasters",
    description:
      "1920s American history — scandals, industrial disasters, and crime cases with named sources.",
    intro:
      "The Jazz Age also meant Teapot Dome, factory poisonings, and disasters that rewrote safety rules. Every story lists sources.",
  },
  1930: {
    title: "1930s American History",
    description:
      "1930s American history — Depression-era politics, disasters, and crime with documented sources.",
    intro:
      "From Bonus Army camps to Dust Bowl hardship, the 1930s left a dense paper trail. These articles stick to it.",
  },
  1940: {
    title: "1940s American History",
    description:
      "1940s American history — wartime scares, disasters, and home-front episodes with named sources.",
    intro:
      "World War II and its home front produced near-misses, fires, and secrecy fights. These stories cite official and archival sources.",
  },
  1950: {
    title: "1950s American History",
    description:
      "1950s American history — Cold War accidents, civil rights flashpoints, and scandals with citations.",
    intro:
      "The 1950s mixed suburban calm with nuclear risk and civil rights struggle. SeeStew covers the documented episodes.",
  },
  1960: {
    title: "1960s American History",
    description:
      "1960s American history — Cold War crises, protests, and disasters with named sources.",
    intro:
      "From missile crises to campus shootings, the 1960s left contested records. These articles name their sources.",
  },
  1970: {
    title: "1970s American History",
    description:
      "1970s American history — scandals, disasters, and political flashpoints with archival citations.",
    intro:
      "Watergate, prison uprisings, and industrial accidents defined parts of the 1970s. Each story below is sourced.",
  },
  1980: {
    title: "1980s American History",
    description:
      "1980s American history — disasters, Cold War leftovers, and political scandals with named sources.",
    intro:
      "The 1980s still hold nuclear near-misses, environmental crises, and political scandals. These articles stay evidence-bound.",
  },
};

const STATE_COPY: Record<
  string,
  { title: string; description: string; intro: string; patterns: RegExp[] }
> = {
  california: {
    title: "Weird California History",
    description:
      "Documented California history stories — disasters, scandals, and strange true episodes with named sources.",
    intro:
      "California stories that sound invented until you open the archives: quakes, dam failures, and political flashpoints. Each piece cites sources.",
    patterns: [/\bcalifornia\b/i, /\blos angeles\b/i, /\bsan francisco\b/i],
  },
  "new-york": {
    title: "Weird New York History",
    description: "Documented New York history — disasters, crime, and scandals with named sources.",
    intro:
      "New York Harbor sabotage, factory fires, and political crises that left a paper trail. Browse sourced SeeStew stories set in New York.",
    patterns: [/\bnew york\b/i, /\bmanhattan\b/i, /\bbuffalo\b/i, /\battica\b/i],
  },
  illinois: {
    title: "Weird Illinois History",
    description:
      "Documented Illinois history — Chicago disasters, labor violence, and strange true stories with citations.",
    intro:
      "From the Eastland to Haymarket and beyond, Illinois left records of disaster and protest. These articles stick to named sources.",
    patterns: [/\billinois\b/i, /\bchicago\b/i],
  },
  pennsylvania: {
    title: "Weird Pennsylvania History",
    description:
      "Documented Pennsylvania history — mine fires, floods, and industrial disasters with named sources.",
    intro:
      "Pennsylvania’s industrial past includes mine fires and floods that remade towns. Each story below cites archives and reports.",
    patterns: [/\bpennsylvania\b/i, /\bjohnstown\b/i, /\bcentralia\b/i, /\bthree mile island\b/i],
  },
  massachusetts: {
    title: "Weird Massachusetts History",
    description:
      "Documented Massachusetts history — disasters, trials, and strange true episodes with citations.",
    intro:
      "Boston fires, molasses floods, and courtroom dramas from Massachusetts — retold from named sources.",
    patterns: [/\bmassachusetts\b/i, /\bboston\b/i, /\bsalem\b/i],
  },
  texas: {
    title: "Weird Texas History",
    description: "Documented Texas history — disasters and flashpoints with named sources.",
    intro:
      "Texas disasters and political flashpoints that left a paper trail. Browse sourced SeeStew stories tied to the state.",
    patterns: [/\btexas\b/i, /\bgalveston\b/i, /\bwaco\b/i],
  },
  ohio: {
    title: "Weird Ohio History",
    description: "Documented Ohio history stories with named sources.",
    intro:
      "Ohio episodes that sound unlikely until you check the records. Each article lists sources.",
    patterns: [/\bohio\b/i, /\bcleveland\b/i],
  },
};

function allHubDefinitions(): HistoryHub[] {
  const defs: HistoryHub[] = [];
  for (const [decadeStr, copy] of Object.entries(DECADE_COPY)) {
    const decade = Number(decadeStr);
    defs.push({
      slug: `${decade}s`,
      kind: "decade",
      decade,
      title: copy.title,
      description: copy.description,
      intro: copy.intro,
    });
  }
  defs.push({
    slug: "cold-war",
    kind: "era",
    title: "Cold War America",
    description:
      "Cold War American history — nuclear near-misses, secrecy, and crises from 1947–1991 with named sources.",
    intro:
      "From Castle Bravo to domestic disasters tied to the arms race, these stories cover Cold War America with archival citations. Years roughly span 1947–1991.",
  });
  for (const [code, copy] of Object.entries(STATE_COPY)) {
    defs.push({
      slug: code,
      kind: "state",
      stateCode: code,
      title: copy.title,
      description: copy.description,
      intro: copy.intro,
    });
  }
  return defs;
}

export function yearFromArticle(article: Article): number | null {
  const blob = `${article.slug} ${article.title}`;
  const m = blob.match(/\b(1[789]\d{2}|20[0-2]\d)\b/);
  return m ? Number(m[1]) : null;
}

export function decadeFromYear(year: number): number {
  return Math.floor(year / 10) * 10;
}

function titleSlugText(article: Article): string {
  return `${article.title} ${article.slug.replace(/-/g, " ")}`;
}

export function statesForArticle(article: Article): string[] {
  const text = titleSlugText(article);
  const out: string[] = [];
  for (const [code, meta] of Object.entries(STATE_COPY)) {
    if (meta.patterns.some((p) => p.test(text))) out.push(code);
  }
  return out;
}

export function isColdWarYear(year: number): boolean {
  return year >= 1947 && year <= 1991;
}

export function getHistoryHub(slug: string): HistoryHub | undefined {
  return allHubDefinitions().find((h) => h.slug === slug);
}

export function getArticlesForHub(hub: HistoryHub, articles: Article[]): Article[] {
  if (hub.kind === "decade" && hub.decade != null) {
    return articles.filter((a) => {
      const y = yearFromArticle(a);
      return y != null && decadeFromYear(y) === hub.decade;
    });
  }
  if (hub.kind === "era" && hub.slug === "cold-war") {
    return articles.filter((a) => {
      const y = yearFromArticle(a);
      return y != null && isColdWarYear(y);
    });
  }
  if (hub.kind === "state" && hub.stateCode) {
    return articles.filter((a) => statesForArticle(a).includes(hub.stateCode!));
  }
  return [];
}

/** Hubs that currently meet the minimum article threshold. */
export function getPopulatedHistoryHubs(
  articles: Article[]
): Array<HistoryHub & { count: number }> {
  return allHubDefinitions()
    .map((hub) => ({ ...hub, count: getArticlesForHub(hub, articles).length }))
    .filter((h) => h.count >= HUB_MIN_ARTICLES)
    .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title));
}
