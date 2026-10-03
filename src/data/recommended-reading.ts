/**
 * Manual "Recommended reading" mapping — the ONLY source of affiliate recommendations.
 *
 * Policy:
 * - An article or topic with no entry here shows no affiliate block at all.
 * - Only real, well-known books whose title and author are certain. Never invent titles.
 * - Max 3 items per article/topic (enforced by the AffiliateBlock and by `npm run check:affiliate-links`).
 * - Links are built by bookLink() in affiliate-config.ts: Bookshop.org when an affiliate ID and
 *   ISBN-13 are filled in, otherwise a tagged Amazon search link (tag=seestew-20). No ASINs are
 *   guessed, no prices, no ratings.
 *
 * TODO for Chris: add `isbn13` to an entry once Bookshop is approved and
 * BOOKSHOP_AFFILIATE_ID is set — that entry will then switch to Bookshop automatically.
 * See docs/affiliate-plan.md.
 */
import {
  bookLink,
  type AffiliateProvider,
} from "../lib/affiliate-config";

export type RecommendedReadingItem = {
  /** Article slug this item belongs to (exactly one of slug/topic is set). */
  slug?: string;
  /** Topic slug (e.g. "crime") this item belongs to. */
  topic?: string;
  title: string;
  author?: string;
  provider: AffiliateProvider;
  url: string;
  /** Short label saying what kind of affiliate link this is. */
  disclosureLabel: string;
  /** One sentence on why it relates to the story/topic. */
  reason: string;
};

type BookInput = {
  slug?: string;
  topic?: string;
  title: string;
  author: string;
  isbn13?: string;
  reason: string;
};

function book(input: BookInput): RecommendedReadingItem {
  const link = bookLink(input);
  return {
    slug: input.slug,
    topic: input.topic,
    title: input.title,
    author: input.author,
    provider: link.provider,
    url: link.url,
    disclosureLabel: link.disclosureLabel,
    reason: input.reason,
  };
}

export const recommendedReading: RecommendedReadingItem[] = [
  // ---- Article-level (obvious, one-to-one matches) ----
  book({
    slug: "radium-girls-1920s",
    title: "The Radium Girls: The Dark Story of America's Shining Women",
    author: "Kate Moore",
    reason: "A full narrative history of the dial painters and their fight for justice.",
  }),
  book({
    slug: "osage-murders-reign-of-terror",
    title: "Killers of the Flower Moon: The Osage Murders and the Birth of the FBI",
    author: "David Grann",
    reason: "Investigative account of the Osage murders and the early FBI case that followed.",
  }),
  book({
    slug: "johnstown-flood-1889",
    title: "The Johnstown Flood",
    author: "David McCullough",
    reason: "The classic book-length history of the South Fork Dam failure.",
  }),
  book({
    slug: "boston-massacre-1770",
    title: "The Boston Massacre",
    author: "Hiller B. Zobel",
    reason: "A detailed study of the 1770 shooting and the trial that followed.",
  }),
  book({
    slug: "challenger-disaster-1986",
    title: "Truth, Lies, and O-Rings: Inside the Space Shuttle Challenger Disaster",
    author: "Allan J. McDonald",
    reason: "A firsthand account from the Morton Thiokol engineer who opposed the launch.",
  }),
  book({
    slug: "bonus-army-1932",
    title: "The Bonus Army: An American Epic",
    author: "Paul Dickson and Thomas B. Allen",
    reason: "The full story of the 1932 veterans' march on Washington and its violent end.",
  }),
  book({
    slug: "haymarket-affair-1886",
    title: "Death in the Haymarket",
    author: "James Green",
    reason: "A history of the Chicago bombing, the trial, and the labor movement behind it.",
  }),
  book({
    slug: "emmett-till-1955",
    title: "The Blood of Emmett Till",
    author: "Timothy B. Tyson",
    reason: "Revisits the 1955 murder and the trial, drawing on later interviews.",
  }),
  book({
    slug: "whiskey-rebellion-1794",
    title:
      "Whiskey Rebellion: George Washington, Alexander Hamilton, and the Frontier Rebels Who Challenged a Young Nation",
    author: "William Hogeland",
    reason: "Narrative history of the 1794 tax revolt and the federal response.",
  }),
  book({
    slug: "business-plot-1934",
    title: "The Plot to Seize the White House",
    author: "Jules Archer",
    reason: "A book-length look at the alleged 1933-34 plot and the congressional hearings.",
  }),

  // ---- Topic-level (kept small; topics not listed here show nothing) ----
  book({
    topic: "crime",
    title: "Killers of the Flower Moon: The Osage Murders and the Birth of the FBI",
    author: "David Grann",
    reason: "True crime that changed American law enforcement.",
  }),
  book({
    topic: "crime",
    title: "The Radium Girls: The Dark Story of America's Shining Women",
    author: "Kate Moore",
    reason: "A workplace crime that led to new labor protections.",
  }),
  book({
    topic: "military",
    title: "The Bonus Army: An American Epic",
    author: "Paul Dickson and Thomas B. Allen",
    reason: "When the U.S. Army was turned on its own veterans.",
  }),
  book({
    topic: "military",
    title: "Dark Sun: The Making of the Hydrogen Bomb",
    author: "Richard Rhodes",
    reason: "Background on the Cold War weapons program behind the era's nuclear tests.",
  }),
  book({
    topic: "revolution",
    title:
      "Whiskey Rebellion: George Washington, Alexander Hamilton, and the Frontier Rebels Who Challenged a Young Nation",
    author: "William Hogeland",
    reason: "How the new republic handled its first major domestic uprising.",
  }),
  book({
    topic: "scandal",
    title: "The Plot to Seize the White House",
    author: "Jules Archer",
    reason: "One of the strangest political controversies of the 1930s.",
  }),
  book({
    topic: "politics",
    title: "Death in the Haymarket",
    author: "James Green",
    reason: "Labor, politics, and justice in Gilded Age Chicago.",
  }),
  book({
    topic: "politics",
    title: "The Blood of Emmett Till",
    author: "Timothy B. Tyson",
    reason: "A case that shaped the civil rights movement.",
  }),
];

/** Hard cap on items shown in any single block. */
export const MAX_RECOMMENDED_ITEMS = 3;

export function getRecommendedReadingForArticle(slug: string): RecommendedReadingItem[] {
  return recommendedReading
    .filter((item) => item.slug === slug)
    .slice(0, MAX_RECOMMENDED_ITEMS);
}

export function getRecommendedReadingForTopic(topicSlug: string): RecommendedReadingItem[] {
  return recommendedReading
    .filter((item) => item.topic === topicSlug)
    .slice(0, MAX_RECOMMENDED_ITEMS);
}
