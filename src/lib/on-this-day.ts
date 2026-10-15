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
