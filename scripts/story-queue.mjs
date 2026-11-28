import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { QUEUE_SEED } from "./story-queue-seed.mjs";
import { QUEUE_BATCH_2 } from "./story-queue-batch-2.mjs";
import { QUEUE_BATCH_3 } from "./story-queue-batch-3.mjs";
import { QUEUE_BATCH_4 } from "./story-queue-batch-4.mjs";
import { QUEUE_BATCH_5 } from "./story-queue-batch-5.mjs";
import { QUEUE_BATCH_6 } from "./story-queue-batch-6.mjs";
import { QUEUE_SEASONAL } from "./story-queue-seasonal.mjs";
import {
  isSeasonalPublishCandidate,
  queueItemSeasonalScore,
} from "./seasonal-calendar.mjs";

export const QUEUE_PATH = join(process.cwd(), "content", "story-queue.json");

/**
 * Pending full-story reserve (mission Nov 2026):
 * Target 45–60 researched topics; replenish when below 30; critical warn below 15.
 * MIN_PENDING_TOPICS kept as the “healthy reserve” floor used by validate/generate warnings.
 */
export const FULL_TARGET_MIN = 45;
export const FULL_TARGET_MAX = 60;
export const FULL_REPLENISH_TRIGGER = 30;
export const MIN_PENDING_TOPICS = FULL_TARGET_MIN;
export const REFILL_PENDING_THRESHOLD = 15;
export const MAX_DISCOVER_FULL_PER_RUN = 8;

/** All curated seed batches — merge by id so new batches refill an exhausted queue. */
export const ALL_QUEUE_SEEDS = [
  ...QUEUE_SEED,
  ...QUEUE_BATCH_2,
  ...QUEUE_BATCH_3,
  ...QUEUE_BATCH_4,
  ...QUEUE_BATCH_5,
  ...QUEUE_BATCH_6,
  ...QUEUE_SEASONAL,
];

export function loadQueue() {
  if (!existsSync(QUEUE_PATH)) {
    return { version: 1, items: ALL_QUEUE_SEEDS.map((i) => ({ ...i })) };
  }
  const data = JSON.parse(readFileSync(QUEUE_PATH, "utf-8"));
  if (!data.items?.length) {
    data.items = ALL_QUEUE_SEEDS.map((i) => ({ ...i }));
  }
  return data;
}

export function saveQueue(queue) {
  writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2), "utf-8");
}

export function countPending(queue) {
  return queue.items.filter((item) => item.status === "pending").length;
}

export function mergeMissingSeedItems(queue) {
  const ids = new Set(queue.items.map((i) => i.id));
  let added = 0;
  for (const seed of ALL_QUEUE_SEEDS) {
    if (ids.has(seed.id)) continue;
    queue.items.push({ ...seed });
    ids.add(seed.id);
    added += 1;
  }
  return added;
}

/**
 * Merge curated batches and report whether pending depth is healthy.
 * Call this at the start of every daily generate run.
 */
export function ensureQueueDepth(queue, { minPending = MIN_PENDING_TOPICS } = {}) {
  const added = mergeMissingSeedItems(queue);
  const pending = countPending(queue);
  return {
    added,
    pending,
    ok: pending >= minPending,
    minPending,
  };
}

function eligiblePending(queue, existingSlugs) {
  return queue.items.filter((item) => {
    if (item.status !== "pending") return false;
    if (existingSlugs.has(item.id)) return false;
    if (item.publishedSlug && existingSlugs.has(item.publishedSlug)) return false;
    return true;
  });
}

/**
 * Prefer seasonal matches 30–60 days before peak, but never starve evergreen:
 * if the most recent publish was a seasonal pick and evergreen remains, take evergreen next.
 */
export function pickNextQueueItem(queue, existingSlugs, now = new Date()) {
  const eligible = eligiblePending(queue, existingSlugs);
  if (!eligible.length) return null;

  const seasonal = eligible
    .filter((item) => isSeasonalPublishCandidate(item, now))
    .sort(
      (a, b) =>
        queueItemSeasonalScore(b, now) - queueItemSeasonalScore(a, now)
    );
  const evergreen = eligible.filter(
    (item) => !isSeasonalPublishCandidate(item, now)
  );

  const recent = queue.items
    .filter((i) => i.status === "published" && i.publishedAt)
    .sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)))
    .slice(0, 1);
  const lastWasSeasonal = recent[0]?.seasonalPick === true;

  if (lastWasSeasonal && evergreen.length) return evergreen[0];
  if (seasonal.length) return seasonal[0];
  return eligible[0];
}

export function markQueueItemPublished(queue, itemId, slug, now = new Date()) {
  const item = queue.items.find((i) => i.id === itemId);
  if (!item) return false;
  item.status = "published";
  item.publishedSlug = slug;
  item.publishedAt = new Date().toISOString();
  item.seasonalPick = isSeasonalPublishCandidate(item, now);
  return true;
}

export function initQueueFileIfNeeded() {
  if (!existsSync(QUEUE_PATH)) {
    const queue = { version: 1, items: ALL_QUEUE_SEEDS.map((i) => ({ ...i })) };
    saveQueue(queue);
    return queue;
  }
  const queue = loadQueue();
  const added = mergeMissingSeedItems(queue);
  if (added > 0) saveQueue(queue);
  return queue;
}
