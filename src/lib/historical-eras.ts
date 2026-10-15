/**
 * Historical Era — second classification axis (independent of topic category).
 * Years are event years, never article publish dates.
 * Hub routes live under /hubs/<slug> (reuse existing hubs system).
 */

export type HistoricalEra = {
  slug: string;
  title: string;
  shortTitle: string;
  /** Inclusive start year */
  startYear: number;
  /** Inclusive end year */
  endYear: number;
  description: string;
  intro: string;
};

/** Canonical eras for browse/filter (ordered chronologically). */
export const HISTORICAL_ERAS: HistoricalEra[] = [
  {
    slug: "colonial-america",
    title: "Colonial America",
    shortTitle: "Colonial",
    startYear: 1492,
    endYear: 1774,
    description:
      "American history before 1775 — colonial settlements, conflict, and early flashpoints with named sources.",
    intro:
      "Stories set before the Revolutionary War. Each article cites archives, museums, or established scholarship.",
  },
  {
    slug: "revolution-early-republic",
    title: "Revolution & Early Republic",
    shortTitle: "Revolution",
    startYear: 1775,
    endYear: 1820,
    description:
      "American Revolution and Early Republic (1775–1820) — founding crises and early national flashpoints with citations.",
    intro:
      "From independence through the Early Republic. These SeeStew stories stick to named sources.",
  },
  {
    slug: "antebellum-civil-war",
    title: "Antebellum & Civil War",
    shortTitle: "Civil War era",
    startYear: 1821,
    endYear: 1865,
    description:
      "Antebellum America and the Civil War (1821–1865) — conflict, slavery, and wartime episodes with named sources.",
    intro:
      "Expansion, sectional crisis, and Civil War. Browse documented stories from 1821–1865.",
  },
  {
    slug: "reconstruction-gilded-age",
    title: "Reconstruction & Gilded Age",
    shortTitle: "Gilded Age",
    startYear: 1866,
    endYear: 1900,
    description:
      "Reconstruction and Gilded Age America (1866–1900) — industrial disasters, coups, and labor conflict with citations.",
    intro:
      "Reconstruction violence, industrial catastrophe, and Gilded Age politics — each article lists sources.",
  },
  {
    slug: "progressive-wwi",
    title: "Progressive Era & World War I",
    shortTitle: "Progressive / WWI",
    startYear: 1901,
    endYear: 1919,
    description:
      "Progressive Era and World War I (1901–1919) — reform, sabotage, and disasters with archival citations.",
    intro:
      "Workplace reform, wartime sabotage, and early-20th-century disasters. Sourced SeeStew stories only.",
  },
  {
    slug: "twenties-depression",
    title: "Roaring Twenties & Great Depression",
    shortTitle: "1920s–30s",
    startYear: 1920,
    endYear: 1938,
    description:
      "1920s–1930s American history — scandals, disasters, and Depression-era flashpoints with named sources.",
    intro:
      "Jazz Age corruption, industrial poisonings, and Depression politics — documented, not folklore.",
  },
  {
    slug: "world-war-ii",
    title: "World War II",
    shortTitle: "WWII",
    startYear: 1939,
    endYear: 1945,
    description:
      "World War II American history (1939–1945) — home front, wartime disasters, and military episodes with citations.",
    intro:
      "Home-front crises and wartime episodes from 1939–1945. Every story lists named sources.",
  },
  {
    slug: "postwar-cold-war",
    title: "Postwar & Cold War",
    shortTitle: "Cold War",
    startYear: 1946,
    endYear: 1991,
    description:
      "Postwar and Cold War America (1946–1991) — nuclear near-misses, civil rights, and scandals with named sources.",
    intro:
      "From early Cold War secrecy to late-century crises. These articles stay inside the documentary record.",
  },
  {
    slug: "modern-america",
    title: "Modern America",
    shortTitle: "Modern",
    startYear: 1992,
    endYear: 2099,
    description:
      "Modern American history (1992–present) — documented disasters, scandals, and flashpoints with named sources.",
    intro:
      "Recent American episodes that still sound unlikely — each piece cites named sources.",
  },
];

export function getHistoricalEra(slug: string): HistoricalEra | undefined {
  return HISTORICAL_ERAS.find((e) => e.slug === slug);
}

/** Primary era for a calendar year (event year). */
export function eraForYear(year: number): HistoricalEra | undefined {
  return HISTORICAL_ERAS.find((e) => year >= e.startYear && year <= e.endYear);
}

/**
 * Extract a likely event year from slug/title.
 * Prefers a 4-digit year in the slug (e.g. triangle-shirtwaist-fire-1911).
 */
export function eventYearFromText(slug: string, title: string): number | null {
  const slugYear = slug.match(/(?:^|-)((?:1[6-9]\d{2}|20[0-2]\d))(?:-|$)/);
  if (slugYear) return Number(slugYear[1]);
  const titleYear = `${title} ${slug}`.match(/\b((?:1[6-9]\d{2}|20[0-2]\d))\b/);
  return titleYear ? Number(titleYear[1]) : null;
}

/** Manual overrides when slug/title year is missing or misleading. */
export const EVENT_YEAR_OVERRIDES: Record<string, number> = {
  "project-mkultra": 1953,
  "tuskegee-syphilis-study": 1932,
  "iran-contra-affair": 1985,
  "operation-paperclip": 1945,
  "operation-northwoods-1962": 1962,
  "minuteman-missile-accidents": 1980,
  "demon-core-los-alamos": 1945,
  "cutter-polio-vaccine-incident-1955": 1955,
  "flint-water-crisis": 2014,
  "deepwater-horizon-2010": 2010,
  "whiskey-rebellion-1794": 1794,
  "amistad-revolt-1839": 1839,
  "underground-railroad": 1850,
  "trail-of-tears": 1838,
  "pony-express-1860": 1860,
  "lewis-and-clark-expedition": 1804,
  "bonus-army-1932": 1932,
  "sacco-vanzetti-trial": 1921,
  "teapot-dome-scandal-1920s": 1922,
  "radium-girls-1920s": 1922,
  "black-sox-scandal-1919": 1919,
  "osage-murders-reign-of-terror": 1921,
  "dust-bowl-1930s": 1935,
  "ghost-army-wwii": 1944,
  "greenbrier-bunker": 1959,
  "hanford-radiation-releases": 1945,
  "japanese-american-incarceration-wwii": 1942,
  "libby-montana-asbestos": 1999,
  "lost-colony-roanoke": 1587,
  "manhattan-project": 1942,
  "operation-midnight-climax": 1953,
  "poison-squad-wiley": 1902,
};

export function resolveEventYear(slug: string, title: string, explicit?: number | null): number | null {
  if (explicit != null && Number.isFinite(explicit)) return explicit;
  if (EVENT_YEAR_OVERRIDES[slug] != null) return EVENT_YEAR_OVERRIDES[slug];
  return eventYearFromText(slug, title);
}
