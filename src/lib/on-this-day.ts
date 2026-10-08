/**
 * Curated anniversary dates for existing articles only.
 * Month/day must be historically established — do not invent dates.
 * /on-this-day ships only when ANNIVERSARIES.length >= MIN_ANNIVERSARIES.
 */

export const MIN_ANNIVERSARIES = 8;

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
  const start = from.getUTCMonth() * 100 + from.getUTCDate();
  const scored = live.map((a) => {
    const key = (a.month - 1) * 100 + a.day;
    const delta = key >= start ? key - start : key + 1300 - start;
    return { a, delta };
  });
  scored.sort((x, y) => x.delta - y.delta);
  return scored.slice(0, limit).map((x) => x.a);
}
