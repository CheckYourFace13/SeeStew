/**
 * Rolling seasonal editorial calendar — annual reuse without new landing pages.
 * Peak interest windows drive discovery hints, queue priority, and feature rotation.
 * Never invents facts; only promotes existing slugs or biases queue research.
 */

import calendar from "../../content/seasonal-calendar.json";
import type { Article } from "./articles";
import { SITE_CALENDAR_TZ } from "./on-this-day";

export type SeasonalKind = "fixed" | "nth-weekday" | "month-span" | "season";

export type SeasonalObservance = {
  id: string;
  label: string;
  kind: SeasonalKind;
  month?: number;
  day?: number;
  weekday?: number;
  nth?: number;
  startMonth?: number;
  startDay?: number;
  endMonth?: number;
  endDay?: number;
  discoverDaysBefore?: number;
  publishPriorityDaysBefore?: number;
  publishPriorityDaysAfterPeak?: number;
  featureDaysBefore?: number;
  featureDaysAfterPeak?: number;
  keywords: string[];
  promoteSlugs: string[];
  hubSlugs?: string[];
  topicHints?: string[];
};

export type SeasonalWindow = {
  observance: SeasonalObservance;
  year: number;
  peak: Date;
  discoverStart: Date;
  publishStart: Date;
  publishEnd: Date;
  featureStart: Date;
  featureEnd: Date;
  discoveryActive: boolean;
  publishActive: boolean;
  featureActive: boolean;
  daysUntilPeak: number;
};

type CalendarDoc = {
  version: number;
  timezone: string;
  discoverDaysBefore: number;
  publishPriorityDaysBefore: number;
  publishPriorityDaysAfterPeak: number;
  featureDaysBefore: number;
  featureDaysAfterPeak: number;
  observances: SeasonalObservance[];
};

const CAL = calendar as CalendarDoc;

export function getSeasonalObservances(): SeasonalObservance[] {
  return CAL.observances;
}

function ymdInTz(date: Date): { year: number; month: number; day: number } {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: SITE_CALENDAR_TZ,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const bits = Object.fromEntries(
    fmt.formatToParts(date).filter((p) => p.type !== "literal").map((p) => [p.type, p.value])
  );
  return {
    year: Number(bits.year),
    month: Number(bits.month),
    day: Number(bits.day),
  };
}

function utcNoonFromParts(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 17, 0, 0)); // ~noon ET
}

/** Nth weekday of month (weekday: 0=Sun…6=Sat). nth=-1 → last. */
export function nthWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
  nth: number
): Date {
  if (nth === -1) {
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    for (let d = lastDay; d >= 1; d--) {
      const dt = utcNoonFromParts(year, month, d);
      if (dt.getUTCDay() === weekday) return dt;
    }
  }
  let count = 0;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  for (let d = 1; d <= lastDay; d++) {
    const dt = utcNoonFromParts(year, month, d);
    if (dt.getUTCDay() === weekday) {
      count += 1;
      if (count === nth) return dt;
    }
  }
  return utcNoonFromParts(year, month, Math.min(28, lastDay));
}

function endOfFebruary(year: number): number {
  return new Date(Date.UTC(year, 2, 0)).getUTCDate();
}

export function resolvePeakDate(obs: SeasonalObservance, year: number): Date {
  if (obs.kind === "fixed" && obs.month && obs.day) {
    return utcNoonFromParts(year, obs.month, obs.day);
  }
  if (
    obs.kind === "nth-weekday" &&
    obs.month != null &&
    obs.weekday != null &&
    obs.nth != null
  ) {
    return nthWeekdayOfMonth(year, obs.month, obs.weekday, obs.nth);
  }
  if (obs.kind === "month-span" && obs.startMonth && obs.endMonth) {
    const endDay =
      obs.endMonth === 2 && (obs.endDay ?? 28) >= 28
        ? endOfFebruary(year)
        : obs.endDay ?? 28;
    // Peak interest mid-span
    const start = utcNoonFromParts(year, obs.startMonth, obs.startDay ?? 1);
    const end = utcNoonFromParts(year, obs.endMonth, endDay);
    return new Date((start.getTime() + end.getTime()) / 2);
  }
  if (obs.kind === "season" && obs.startMonth && obs.endMonth) {
    // Peak = midpoint; season may cross year (winter)
    let startYear = year;
    let endYear = year;
    if (obs.startMonth > obs.endMonth) {
      // winter: Dec year → Mar year+1; for calendar year Y, active winter peaks around Jan Y
      startYear = year - 1;
      endYear = year;
    }
    const start = utcNoonFromParts(startYear, obs.startMonth, obs.startDay ?? 1);
    const end = utcNoonFromParts(endYear, obs.endMonth, obs.endDay ?? 20);
    return new Date((start.getTime() + end.getTime()) / 2);
  }
  return utcNoonFromParts(year, 1, 1);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

function windowFor(
  obs: SeasonalObservance,
  year: number,
  now: Date
): SeasonalWindow {
  const peak = resolvePeakDate(obs, year);
  const discoverBefore = obs.discoverDaysBefore ?? CAL.discoverDaysBefore;
  const publishBefore = obs.publishPriorityDaysBefore ?? CAL.publishPriorityDaysBefore;
  const publishAfter = obs.publishPriorityDaysAfterPeak ?? CAL.publishPriorityDaysAfterPeak;
  const featureBefore = obs.featureDaysBefore ?? CAL.featureDaysBefore;
  const featureAfter = obs.featureDaysAfterPeak ?? CAL.featureDaysAfterPeak;

  // Month-span / season: feature across the span, not only around midpoint
  let featureStart = addDays(peak, -featureBefore);
  let featureEnd = addDays(peak, featureAfter);
  let discoverStart = addDays(peak, -discoverBefore);
  let publishStart = addDays(peak, -publishBefore);
  let publishEnd = addDays(peak, publishAfter);

  if (obs.kind === "month-span" || obs.kind === "season") {
    let startYear = year;
    let endYear = year;
    if (
      obs.kind === "season" &&
      obs.startMonth != null &&
      obs.endMonth != null &&
      obs.startMonth > obs.endMonth
    ) {
      startYear = year - 1;
      endYear = year;
    }
    const spanStart = utcNoonFromParts(
      startYear,
      obs.startMonth ?? 1,
      obs.startDay ?? 1
    );
    let endDay = obs.endDay ?? 28;
    if (obs.endMonth === 2 && endDay >= 28) endDay = endOfFebruary(endYear);
    const spanEnd = utcNoonFromParts(endYear, obs.endMonth ?? 12, endDay);
    featureStart = addDays(spanStart, -(obs.featureDaysBefore ?? 14));
    featureEnd = spanEnd;
    discoverStart = addDays(spanStart, -discoverBefore);
    publishStart = addDays(spanStart, -publishBefore);
    publishEnd = spanEnd;
  }

  const t = now.getTime();
  return {
    observance: obs,
    year,
    peak,
    discoverStart,
    publishStart,
    publishEnd,
    featureStart,
    featureEnd,
    discoveryActive: t >= discoverStart.getTime() && t <= peak.getTime(),
    publishActive: t >= publishStart.getTime() && t <= publishEnd.getTime(),
    featureActive: t >= featureStart.getTime() && t <= featureEnd.getTime(),
    daysUntilPeak: daysBetween(now, peak),
  };
}

/** Active windows across adjacent years (handles Dec→Jan boundaries). */
export function getSeasonalWindows(now: Date = new Date()): SeasonalWindow[] {
  const { year } = ymdInTz(now);
  const years = [year - 1, year, year + 1];
  const out: SeasonalWindow[] = [];
  for (const obs of CAL.observances) {
    for (const y of years) {
      out.push(windowFor(obs, y, now));
    }
  }
  return out;
}

export function getActiveFeatureWindows(now: Date = new Date()): SeasonalWindow[] {
  return getSeasonalWindows(now).filter((w) => w.featureActive);
}

export function getActivePublishWindows(now: Date = new Date()): SeasonalWindow[] {
  return getSeasonalWindows(now).filter((w) => w.publishActive);
}

export function getActiveDiscoveryWindows(now: Date = new Date()): SeasonalWindow[] {
  return getSeasonalWindows(now).filter((w) => w.discoveryActive);
}

export function getActiveDiscoveryHints(now: Date = new Date()): string[] {
  const hints: string[] = [];
  const seen = new Set<string>();
  for (const w of getActiveDiscoveryWindows(now)) {
    for (const h of w.observance.topicHints || []) {
      if (seen.has(h)) continue;
      seen.add(h);
      hints.push(`${w.observance.label}: ${h}`);
    }
  }
  return hints;
}

function haystack(parts: Array<string | number | null | undefined>): string {
  return parts
    .filter((p) => p != null && String(p).length)
    .join(" ")
    .toLowerCase();
}

export function textMatchesSeasonalKeywords(
  text: string,
  keywords: string[]
): boolean {
  const t = text.toLowerCase();
  return keywords.some((k) => k.length >= 3 && t.includes(k.toLowerCase()));
}

/** Higher = sooner / more urgent seasonal publish. Nearer upcoming peaks win. */
function windowUrgency(daysUntilPeak: number): number {
  if (daysUntilPeak < -2) return 0;
  if (daysUntilPeak < 0) return 8 + daysUntilPeak;
  if (daysUntilPeak <= 30) return 60 - daysUntilPeak;
  if (daysUntilPeak <= 60) return 45 - (daysUntilPeak - 30) * 0.5;
  return 1;
}

export function queueItemSeasonalScore(
  item: {
    id?: string;
    title?: string;
    hook?: string;
    angle?: string;
    keywords?: string[];
    category?: string;
    seasonal?: boolean;
  },
  now: Date = new Date()
): number {
  const text = haystack([
    item.id,
    item.title,
    item.hook,
    item.angle,
    item.category,
    ...(item.keywords || []),
  ]);
  let score = 0;
  for (const w of getActivePublishWindows(now)) {
    const urgency = windowUrgency(w.daysUntilPeak);
    if (urgency <= 0) continue;
    if (textMatchesSeasonalKeywords(text, w.observance.keywords)) {
      score = Math.max(score, urgency + (item.seasonal ? 8 : 0));
    }
    if (item.id && w.observance.promoteSlugs.includes(item.id)) {
      score = Math.max(score, urgency + 10);
    }
  }
  return score;
}

export function isSeasonalPublishCandidate(
  item: {
    id?: string;
    title?: string;
    hook?: string;
    angle?: string;
    keywords?: string[];
    category?: string;
    seasonal?: boolean;
  },
  now: Date = new Date()
): boolean {
  return queueItemSeasonalScore(item, now) > 0;
}

export function articleSeasonalScore(
  article: Article,
  now: Date = new Date()
): number {
  const text = haystack([
    article.slug,
    article.title,
    article.excerpt,
    article.category,
    article.historicalEra,
  ]);
  let score = 0;
  for (const w of getActiveFeatureWindows(now)) {
    if (w.observance.promoteSlugs.includes(article.slug)) {
      score = Math.max(score, 5);
    } else if (textMatchesSeasonalKeywords(text, w.observance.keywords)) {
      score = Math.max(score, 2);
    }
  }
  return score;
}

/**
 * Existing articles to feature on the homepage for active seasons.
 * Filters to published slugs only; rotates by peak proximity.
 */
export function getSeasonalHomepageFeatures(
  articles: Article[],
  now: Date = new Date(),
  limit = 3
): { label: string; articles: Article[] } | null {
  const bySlug = new Map(articles.map((a) => [a.slug, a]));
  const windows = getActiveFeatureWindows(now).sort((a, b) => {
    // Upcoming peaks before just-passed; nearer first; seasons last
    const aSeason = a.observance.kind === "season" ? 1 : 0;
    const bSeason = b.observance.kind === "season" ? 1 : 0;
    if (aSeason !== bSeason) return aSeason - bSeason;
    const aUpcoming = a.daysUntilPeak >= 0 ? 0 : 1;
    const bUpcoming = b.daysUntilPeak >= 0 ? 0 : 1;
    if (aUpcoming !== bUpcoming) return aUpcoming - bUpcoming;
    return Math.abs(a.daysUntilPeak) - Math.abs(b.daysUntilPeak);
  });
  if (!windows.length) return null;

  // Prefer upcoming holiday/observance windows (e.g. Christmas over just-passed Thanksgiving)
  const primary =
    windows.find((w) => w.observance.kind !== "season" && w.daysUntilPeak >= 0) ||
    windows.find((w) => w.observance.kind !== "season") ||
    windows[0];
  const seen = new Set<string>();
  const picked: Article[] = [];

  const orderedWindows = [
    primary,
    ...windows.filter((w) => w.observance.id !== primary.observance.id),
  ];
  for (const w of orderedWindows) {
    for (const slug of w.observance.promoteSlugs) {
      if (seen.has(slug)) continue;
      const a = bySlug.get(slug);
      if (!a) continue;
      seen.add(slug);
      picked.push(a);
      if (picked.length >= limit) break;
    }
    if (picked.length >= limit) break;
  }

  if (!picked.length) return null;
  return { label: primary.observance.label, articles: picked };
}

/** Seasonal featured slugs for a hub (merged with static featured lists). */
export function getSeasonalHubFeaturedSlugs(
  hubSlug: string,
  publishedSlugs: Set<string>,
  now: Date = new Date(),
  limit = 3
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const w of getActiveFeatureWindows(now)) {
    if (!w.observance.hubSlugs?.includes(hubSlug)) continue;
    for (const slug of w.observance.promoteSlugs) {
      if (!publishedSlugs.has(slug) || seen.has(slug)) continue;
      seen.add(slug);
      out.push(slug);
      if (out.length >= limit) return out;
    }
  }
  return out;
}

/** Prioritized seasonal topics currently in discover/publish windows. */
export function getCurrentSeasonalPriorities(now: Date = new Date()): Array<{
  id: string;
  label: string;
  daysUntilPeak: number;
  discoveryActive: boolean;
  publishActive: boolean;
  featureActive: boolean;
  promoteSlugs: string[];
  topicHints: string[];
}> {
  const byId = new Map<
    string,
    {
      id: string;
      label: string;
      daysUntilPeak: number;
      discoveryActive: boolean;
      publishActive: boolean;
      featureActive: boolean;
      promoteSlugs: string[];
      topicHints: string[];
    }
  >();
  for (const w of getSeasonalWindows(now)) {
    if (!w.discoveryActive && !w.publishActive && !w.featureActive) continue;
    const prev = byId.get(w.observance.id);
    if (prev && Math.abs(prev.daysUntilPeak) <= Math.abs(w.daysUntilPeak)) {
      continue;
    }
    byId.set(w.observance.id, {
      id: w.observance.id,
      label: w.observance.label,
      daysUntilPeak: w.daysUntilPeak,
      discoveryActive: w.discoveryActive,
      publishActive: w.publishActive,
      featureActive: w.featureActive,
      promoteSlugs: w.observance.promoteSlugs,
      topicHints: w.observance.topicHints || [],
    });
  }
  return [...byId.values()].sort(
    (a, b) => Math.abs(a.daysUntilPeak) - Math.abs(b.daysUntilPeak)
  );
}
