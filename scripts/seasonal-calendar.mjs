/**
 * Node mirror of src/lib/seasonal.ts for queue / replenish scripts.
 * Single source of observance data: content/seasonal-calendar.json
 */

import { readFileSync } from "fs";
import { join } from "path";

const CAL_PATH = join(process.cwd(), "content", "seasonal-calendar.json");
const CAL = JSON.parse(readFileSync(CAL_PATH, "utf8"));
const TZ = CAL.timezone || "America/New_York";

function ymdInTz(date) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const bits = Object.fromEntries(
    fmt
      .formatToParts(date)
      .filter((p) => p.type !== "literal")
      .map((p) => [p.type, p.value])
  );
  return {
    year: Number(bits.year),
    month: Number(bits.month),
    day: Number(bits.day),
  };
}

function utcNoonFromParts(year, month, day) {
  return new Date(Date.UTC(year, month - 1, day, 17, 0, 0));
}

export function nthWeekdayOfMonth(year, month, weekday, nth) {
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

function endOfFebruary(year) {
  return new Date(Date.UTC(year, 2, 0)).getUTCDate();
}

export function resolvePeakDate(obs, year) {
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
    const start = utcNoonFromParts(year, obs.startMonth, obs.startDay ?? 1);
    const end = utcNoonFromParts(year, obs.endMonth, endDay);
    return new Date((start.getTime() + end.getTime()) / 2);
  }
  if (obs.kind === "season" && obs.startMonth && obs.endMonth) {
    let startYear = year;
    let endYear = year;
    if (obs.startMonth > obs.endMonth) {
      startYear = year - 1;
      endYear = year;
    }
    const start = utcNoonFromParts(startYear, obs.startMonth, obs.startDay ?? 1);
    const end = utcNoonFromParts(endYear, obs.endMonth, obs.endDay ?? 20);
    return new Date((start.getTime() + end.getTime()) / 2);
  }
  return utcNoonFromParts(year, 1, 1);
}

function addDays(date, days) {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function daysBetween(a, b) {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

function windowFor(obs, year, now) {
  const peak = resolvePeakDate(obs, year);
  const discoverBefore = obs.discoverDaysBefore ?? CAL.discoverDaysBefore;
  const publishBefore = obs.publishPriorityDaysBefore ?? CAL.publishPriorityDaysBefore;
  const publishAfter =
    obs.publishPriorityDaysAfterPeak ?? CAL.publishPriorityDaysAfterPeak;
  const featureBefore = obs.featureDaysBefore ?? CAL.featureDaysBefore;
  const featureAfter = obs.featureDaysAfterPeak ?? CAL.featureDaysAfterPeak;

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

export function getSeasonalWindows(now = new Date()) {
  const { year } = ymdInTz(now);
  const years = [year - 1, year, year + 1];
  const out = [];
  for (const obs of CAL.observances) {
    for (const y of years) out.push(windowFor(obs, y, now));
  }
  return out;
}

export function getActivePublishWindows(now = new Date()) {
  return getSeasonalWindows(now).filter((w) => w.publishActive);
}

export function getActiveFeatureWindows(now = new Date()) {
  return getSeasonalWindows(now).filter((w) => w.featureActive);
}

export function getActiveDiscoveryWindows(now = new Date()) {
  return getSeasonalWindows(now).filter((w) => w.discoveryActive);
}

export function getActiveDiscoveryHints(now = new Date()) {
  const hints = [];
  const seen = new Set();
  for (const w of getActiveDiscoveryWindows(now)) {
    for (const h of w.observance.topicHints || []) {
      if (seen.has(h)) continue;
      seen.add(h);
      hints.push(`${w.observance.label}: ${h}`);
    }
  }
  return hints;
}

function haystack(parts) {
  return parts
    .filter((p) => p != null && String(p).length)
    .join(" ")
    .toLowerCase();
}

export function textMatchesSeasonalKeywords(text, keywords) {
  const t = text.toLowerCase();
  return keywords.some((k) => k.length >= 3 && t.includes(k.toLowerCase()));
}

/** Higher = sooner / more urgent seasonal publish. Nearer upcoming peaks win. */
function windowUrgency(daysUntilPeak) {
  if (daysUntilPeak < -2) return 0;
  if (daysUntilPeak < 0) return 8 + daysUntilPeak; // just-passed peak, mild
  if (daysUntilPeak <= 30) return 60 - daysUntilPeak; // inside final month before peak
  if (daysUntilPeak <= 60) return 45 - (daysUntilPeak - 30) * 0.5; // 30–60 day priority band
  return 1;
}

export function queueItemSeasonalScore(item, now = new Date()) {
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

export function isSeasonalPublishCandidate(item, now = new Date()) {
  return queueItemSeasonalScore(item, now) > 0;
}

export function getCurrentSeasonalPriorities(now = new Date()) {
  const byId = new Map();
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

export { CAL as SEASONAL_CALENDAR };
