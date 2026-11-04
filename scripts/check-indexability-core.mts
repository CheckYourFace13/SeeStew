import { getAllArticles } from "../src/lib/articles.ts";
import {
  contentRichDateSlugs,
  indexableAnniversaryDateSlugs,
  anniversariesForDate,
  parseDatePathSlug,
  INDEXABLE_ANNIVERSARY_MIN_EVENTS,
} from "../src/lib/on-this-day.ts";
import {
  getPopulatedHistoryHubs,
  isIndexableHistoryHub,
  HUB_INDEX_MIN_ARTICLES,
} from "../src/lib/history-hubs.ts";

const articles = getAllArticles();
const slugs = new Set(articles.map((a) => a.slug));
const allDates = contentRichDateSlugs(slugs);
const indexableDates = indexableAnniversaryDateSlugs(slugs);
const single = allDates.filter((d) => !indexableDates.includes(d));

let bad = 0;
for (const d of indexableDates) {
  const p = parseDatePathSlug(d);
  if (!p) {
    console.error("FAIL: bad indexable date slug: " + d);
    bad++;
    continue;
  }
  const n = anniversariesForDate(p.month, p.day, slugs).length;
  if (n < INDEXABLE_ANNIVERSARY_MIN_EVENTS) {
    console.error("FAIL: indexable date has too few events: " + d);
    bad++;
  }
}
for (const d of single) {
  const p = parseDatePathSlug(d);
  if (!p) continue;
  const n = anniversariesForDate(p.month, p.day, slugs).length;
  if (n >= INDEXABLE_ANNIVERSARY_MIN_EVENTS) {
    console.error("FAIL: multi-event date missing from indexable set: " + d);
    bad++;
  }
}

const hubs = getPopulatedHistoryHubs(articles);
const indexableHubs = hubs.filter((h) => isIndexableHistoryHub(h, articles));
for (const h of indexableHubs) {
  if (h.count < HUB_INDEX_MIN_ARTICLES) {
    console.error("FAIL: indexable hub below min articles: " + h.slug);
    bad++;
  }
}

console.log(
  JSON.stringify(
    {
      articles: articles.length,
      anniversaryDates: allDates.length,
      indexableAnniversaryDates: indexableDates.length,
      noindexAnniversaryDates: single.length,
      populatedHubs: hubs.length,
      indexableHubs: indexableHubs.length,
      noindexHubs: hubs
        .filter((h) => !isIndexableHistoryHub(h, articles))
        .map((h) => h.slug),
      bad,
    },
    null,
    2
  )
);
process.exit(bad ? 1 : 0);
