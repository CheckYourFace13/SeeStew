import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { QUEUE_SEED } from "./story-queue-seed.mjs";
import { QUEUE_BATCH_2 } from "./story-queue-batch-2.mjs";

export const QUEUE_PATH = join(process.cwd(), "content", "story-queue.json");

/** All curated seed batches — merge by id so new batches refill an exhausted queue. */
export const ALL_QUEUE_SEEDS = [...QUEUE_SEED, ...QUEUE_BATCH_2];

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

export function pickNextQueueItem(queue, existingSlugs) {
  const pending = queue.items.filter((item) => item.status === "pending");
  for (const item of pending) {
    if (existingSlugs.has(item.id)) {
      continue;
    }
    if (item.publishedSlug && existingSlugs.has(item.publishedSlug)) {
      continue;
    }
    return item;
  }
  return null;
}

export function markQueueItemPublished(queue, itemId, slug) {
  const item = queue.items.find((i) => i.id === itemId);
  if (!item) return false;
  item.status = "published";
  item.publishedSlug = slug;
  item.publishedAt = new Date().toISOString();
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
