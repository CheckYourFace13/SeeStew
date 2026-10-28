/**
 * Curated anniversary dates for existing articles only.
 * Month/day must be historically established — do not invent dates.
 * /on-this-day ships only when ANNIVERSARIES.length >= MIN_ANNIVERSARIES.
 *
 * Calendar display /today use America/New_York so U.S. readers share one “today.”
 * Never treat article createdAt as an event anniversary.
 */

export const MIN_ANNIVERSARIES = 8;

/** Consistent site calendar timezone for /today and anniversary “now.” */
export const SITE_CALENDAR_TZ = "America/New_York";

export type Anniversary = {
  slug: string;
  /** 1–12 */
  month: number;
  /** 1–31 */
  day: number;
  label: string;
};

/** Only include slugs that exist in content/articles. */
export const ANNIVERSARIES: Anniversary[] = [
  { slug: "boston-massacre-1770", month: 3, day: 5, label: "Boston Massacre (1770)" },
  { slug: "triangle-shirtwaist-fire-1911", month: 3, day: 25, label: "Triangle Shirtwaist Fire (1911)" },
  { slug: "great-molasses-flood-1919", month: 1, day: 15, label: "Great Molasses Flood (1919)" },
  { slug: "eastland-disaster-1915", month: 7, day: 24, label: "Eastland Disaster (1915)" },
  { slug: "johnstown-flood-1889", month: 5, day: 31, label: "Johnstown Flood (1889)" },
  { slug: "black-tom-explosion-1916", month: 7, day: 30, label: "Black Tom Explosion (1916)" },
  { slug: "challenger-disaster-1986", month: 1, day: 28, label: "Challenger Disaster (1986)" },
  { slug: "kent-state-shootings-1970", month: 5, day: 4, label: "Kent State Shootings (1970)" },
  { slug: "stonewall-riots-1969", month: 6, day: 28, label: "Stonewall Riots (1969)" },
  { slug: "watergate-break-in-1972", month: 6, day: 17, label: "Watergate Break-in (1972)" },
  { slug: "three-mile-island-1979", month: 3, day: 28, label: "Three Mile Island (1979)" },
  { slug: "hurricane-katrina-2005", month: 8, day: 29, label: "Hurricane Katrina landfall (2005)" },
  { slug: "san-francisco-earthquake-1906", month: 4, day: 18, label: "San Francisco Earthquake (1906)" },
  { slug: "galveston-hurricane-1900", month: 9, day: 8, label: "Galveston Hurricane (1900)" },
  { slug: "uss-indianapolis-1945", month: 7, day: 30, label: "USS Indianapolis sunk (1945)" },
  { slug: "cocoanut-grove-fire-1942", month: 11, day: 28, label: "Cocoanut Grove Fire (1942)" },
  { slug: "hartford-circus-fire-1944", month: 7, day: 6, label: "Hartford Circus Fire (1944)" },
  { slug: "whiskey-rebellion-1794", month: 8, day: 7, label: "Whiskey Rebellion climax (1794)" },
  { slug: "tulsa-race-massacre-1921", month: 5, day: 31, label: "Tulsa Race Massacre begins (1921)" },
  // Verified from article body (month + day + eventYear) + named sources. Not publication dates.
  { slug: "apollo-1-fire-1967", month: 1, day: 27, label: "Apollo 1 fire (1967)" },
  { slug: "childrens-blizzard-1888", month: 1, day: 12, label: "Children’s Blizzard (1888)" },
  { slug: "goldsboro-nuclear-accident-1961", month: 1, day: 24, label: "Goldsboro B-52 accident (1961)" },
  { slug: "palomares-incident-1966", month: 1, day: 17, label: "Palomares nuclear accident (1966)" },
  { slug: "thule-b52-crash-1968", month: 1, day: 21, label: "Thule B-52 crash (1968)" },
  { slug: "california-gold-rush-1848", month: 1, day: 24, label: "Marshall finds gold at Sutter’s Mill (1848)" },
  { slug: "battle-of-los-angeles-1942", month: 2, day: 25, label: "Battle of Los Angeles (1942)" },
  { slug: "buffalo-creek-flood-1972", month: 2, day: 26, label: "Buffalo Creek flood (1972)" },
  { slug: "great-baltimore-fire-1904", month: 2, day: 7, label: "Great Baltimore Fire (1904)" },
  { slug: "japanese-american-incarceration-wwii", month: 2, day: 19, label: "Executive Order 9066 (1942)" },
  { slug: "battle-of-the-alamo-1836", month: 3, day: 6, label: "Fall of the Alamo (1836)" },
  { slug: "brown-v-board-1954", month: 5, day: 17, label: "Brown v. Board decided (1954)" },
  { slug: "castle-bravo-fallout-1954", month: 3, day: 1, label: "Castle Bravo (1954)" },
  { slug: "exxon-valdez-oil-spill-1989", month: 3, day: 24, label: "Exxon Valdez oil spill (1989)" },
  { slug: "lindbergh-kidnapping-1932", month: 3, day: 1, label: "Lindbergh kidnapping (1932)" },
  { slug: "my-lai-massacre-1968", month: 3, day: 16, label: "My Lai massacre (1968)" },
  { slug: "scottsboro-boys", month: 3, day: 25, label: "Scottsboro Boys arrests (1931)" },
  { slug: "selma-to-montgomery-1965", month: 3, day: 7, label: "Bloody Sunday in Selma (1965)" },
  { slug: "deepwater-horizon-2010", month: 4, day: 20, label: "Deepwater Horizon explosion (2010)" },
  { slug: "louisiana-purchase-1803", month: 4, day: 30, label: "Louisiana Purchase treaty (1803)" },
  { slug: "oklahoma-city-bombing-1995", month: 4, day: 19, label: "Oklahoma City bombing (1995)" },
  { slug: "pony-express-1860", month: 4, day: 3, label: "Pony Express begins (1860)" },
  { slug: "sultana-disaster-1865", month: 4, day: 27, label: "Sultana explodes (1865)" },
  { slug: "texas-city-disaster-1947", month: 4, day: 16, label: "Texas City disaster (1947)" },
  { slug: "bath-school-disaster-1927", month: 5, day: 18, label: "Bath School disaster (1927)" },
  { slug: "move-bombing-1985", month: 5, day: 13, label: "MOVE bombing (1985)" },
  { slug: "great-seattle-fire-1889", month: 6, day: 6, label: "Great Seattle Fire (1889)" },
  { slug: "little-bighorn-1876", month: 6, day: 25, label: "Battle of the Little Bighorn (1876)" },
  { slug: "apollo-11-moon-landing-1969", month: 7, day: 20, label: "Apollo 11 landing (1969)" },
  { slug: "hyatt-regency-walkway-collapse-1981", month: 7, day: 17, label: "Hyatt Regency walkway collapse (1981)" },
  { slug: "port-chicago-explosion-1944", month: 7, day: 17, label: "Port Chicago explosion (1944)" },
  { slug: "uss-forrestal-fire-1967", month: 7, day: 29, label: "USS Forrestal fire (1967)" },
  { slug: "gulf-of-tonkin-1964", month: 8, day: 4, label: "Gulf of Tonkin (1964)" },
  { slug: "march-on-washington-1963", month: 8, day: 28, label: "March on Washington (1963)" },
  { slug: "nineteenth-amendment-1920", month: 8, day: 18, label: "Nineteenth Amendment certified (1920)" },
  { slug: "white-house-burning-1814", month: 8, day: 24, label: "Burning of Washington (1814)" },
  { slug: "hinckley-fire-1894", month: 9, day: 1, label: "Hinckley firestorm (1894)" },
  { slug: "titan-ii-damascus-1980", month: 9, day: 19, label: "Damascus Titan II accident (1980)" },
  { slug: "great-chicago-fire-1871", month: 10, day: 8, label: "Great Chicago Fire (1871)" },
  { slug: "peshtigo-fire-1871", month: 10, day: 8, label: "Peshtigo Fire (1871)" },
  { slug: "lake-peigneur-1980", month: 11, day: 20, label: "Lake Peigneur disaster (1980)" },
  { slug: "iroquois-theatre-fire-1903", month: 12, day: 30, label: "Iroquois Theatre fire (1903)" },
  { slug: "monongah-mining-disaster-1907", month: 12, day: 6, label: "Monongah mine disaster (1907)" },
  { slug: "montgomery-bus-boycott-1955", month: 12, day: 1, label: "Rosa Parks arrested (1955)" },
  { slug: "our-lady-of-the-angels-fire-1958", month: 12, day: 1, label: "Our Lady of the Angels fire (1958)" },
  { slug: "silver-bridge-collapse-1967", month: 12, day: 15, label: "Silver Bridge collapse (1967)" },
  { slug: "winecoff-hotel-fire-1946", month: 12, day: 7, label: "Winecoff Hotel fire (1946)" },
  { slug: "wounded-knee-massacre-1890", month: 12, day: 29, label: "Wounded Knee Massacre (1890)" },
];

export function onThisDayEnabled(existingSlugs: Set<string>): boolean {
  const live = ANNIVERSARIES.filter((a) => existingSlugs.has(a.slug));
  return live.length >= MIN_ANNIVERSARIES;
}

export function liveAnniversaries(existingSlugs: Set<string>): Anniversary[] {
  return ANNIVERSARIES.filter((a) => existingSlugs.has(a.slug)).sort(
    (a, b) => a.month - b.month || a.day - b.day
  );
}

export function anniversariesForDate(
  month: number,
  day: number,
  existingSlugs: Set<string>
): Anniversary[] {
  return liveAnniversaries(existingSlugs).filter((a) => a.month === month && a.day === day);
}

export function upcomingAnniversaries(
  existingSlugs: Set<string>,
  from: Date = new Date(),
  limit = 12
): Anniversary[] {
  const live = liveAnniversaries(existingSlugs);
  const { month, day } = todayPartsInSiteTz(from);
  const start = (month - 1) * 100 + day;
  const scored = live.map((a) => {
    const key = (a.month - 1) * 100 + a.day;
    const delta = key >= start ? key - start : key + 1300 - start;
    return { a, delta };
  });
  scored.sort((x, y) => x.delta - y.delta);
  return scored.slice(0, limit).map((x) => x.a);
}

const MONTH_SLUGS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const;

export function monthName(month: number): string {
  return new Date(Date.UTC(2000, month - 1, 1)).toLocaleString("en-US", {
    month: "long",
    timeZone: "UTC",
  });
}

/** URL segment like october-10 */
export function datePathSlug(month: number, day: number): string {
  return `${MONTH_SLUGS[month - 1]}-${day}`;
}

/** Days in month; Feb uses 29 so february-29 is parseable (leap-day anniversaries). */
export function daysInMonth(month: number): number {
  if (month < 1 || month > 12) return 0;
  return [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1]!;
}

export function parseDatePathSlug(
  slug: string
): { month: number; day: number } | null {
  const m = slug.toLowerCase().match(
    /^(january|february|march|april|may|june|july|august|september|october|november|december)-(\d{1,2})$/
  );
  if (!m) return null;
  const month = MONTH_SLUGS.indexOf(m[1] as (typeof MONTH_SLUGS)[number]) + 1;
  const day = Number(m[2]);
  if (month < 1 || day < 1 || day > daysInMonth(month)) return null;
  return { month, day };
}

/** Unique month/day pairs that have at least one live curated anniversary. */
export function contentRichDateSlugs(existingSlugs: Set<string>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const a of liveAnniversaries(existingSlugs)) {
    const path = datePathSlug(a.month, a.day);
    if (seen.has(path)) continue;
    seen.add(path);
    out.push(path);
  }
  return out.sort((a, b) => {
    const pa = parseDatePathSlug(a)!;
    const pb = parseDatePathSlug(b)!;
    return pa.month - pb.month || pa.day - pb.day;
  });
}

/** Month/day in SITE_CALENDAR_TZ (not UTC, not server local). */
export function todayPartsInSiteTz(now: Date = new Date()): {
  month: number;
  day: number;
} {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: SITE_CALENDAR_TZ,
    month: "numeric",
    day: "numeric",
  });
  const parts = fmt.formatToParts(now);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return { month, day };
}

/** Prev/next among content-rich dates only (wraps the year). */
export function adjacentContentRichDates(
  month: number,
  day: number,
  existingSlugs: Set<string>
): { prev: string | null; next: string | null } {
  const list = contentRichDateSlugs(existingSlugs);
  if (list.length === 0) return { prev: null, next: null };
  const current = datePathSlug(month, day);
  const idx = list.indexOf(current);
  if (idx < 0) {
    // Nearest previous/next by calendar order among curated dates
    const key = (month - 1) * 100 + day;
    let prev: string | null = null;
    let next: string | null = null;
    for (const slug of list) {
      const p = parseDatePathSlug(slug)!;
      const k = (p.month - 1) * 100 + p.day;
      if (k < key) prev = slug;
      if (k > key && !next) next = slug;
    }
    return {
      prev: prev ?? list[list.length - 1]!,
      next: next ?? list[0]!,
    };
  }
  return {
    prev: list[(idx - 1 + list.length) % list.length]!,
    next: list[(idx + 1) % list.length]!,
  };
}

/** Curated anniversary row for an article slug, if any. */
export function anniversaryForSlug(
  slug: string,
  existingSlugs: Set<string>
): Anniversary | undefined {
  return liveAnniversaries(existingSlugs).find((a) => a.slug === slug);
}

/**
 * Other curated stories sharing this article’s anniversary calendar date.
 * Uses curated ANNIVERSARIES only — never article publication date.
 */
export function alsoOnThisDay(
  articleSlug: string,
  existingSlugs: Set<string>
): Anniversary[] {
  const self = anniversaryForSlug(articleSlug, existingSlugs);
  if (!self) return [];
  return anniversariesForDate(self.month, self.day, existingSlugs).filter(
    (a) => a.slug !== articleSlug
  );
}
