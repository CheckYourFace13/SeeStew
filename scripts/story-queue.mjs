import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { QUEUE_SEED } from "./story-queue-seed.mjs";

export const QUEUE_PATH = join(process.cwd(), "content", "story-queue.json");

export function loadQueue() {
  if (!existsSync(QUEUE_PATH)) {
    return { version: 1, items: [...QUEUE_SEED] };
  }
  const data = JSON.parse(readFileSync(QUEUE_PATH, "utf-8"));
  if (!data.items?.length) {
    data.items = [...QUEUE_SEED];
  }
  return data;
}

export function saveQueue(queue) {
  writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2), "utf-8");
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
    const queue = { version: 1, items: [...QUEUE_SEED] };
    saveQueue(queue);
    return queue;
  }
  const queue = loadQueue();
  if (queue.items.length < QUEUE_SEED.length) {
    const ids = new Set(queue.items.map((i) => i.id));
    for (const seed of QUEUE_SEED) {
      if (!ids.has(seed.id)) queue.items.push({ ...seed });
    }
    saveQueue(queue);
  }
  return queue;
}
