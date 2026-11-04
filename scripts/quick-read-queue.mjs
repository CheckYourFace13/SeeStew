/**
 * Quick Read queue — separate from full-story story-queue.json.
 * Never consumes full-story pending items.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { QR_QUEUE_SEED } from "./quick-read-queue-seed.mjs";

export const QR_QUEUE_PATH = join(process.cwd(), "content", "quick-read-queue.json");

/**
 * Pending Quick Read reserve (mission Nov 2026):
 * Target 15–20; replenish when below 10; warn below healthy cadence of 3.
 */
export const QR_TARGET_MIN = 15;
export const QR_TARGET_MAX = 20;
export const QR_REPLENISH_TRIGGER = 10;
export const MIN_QR_PENDING = QR_TARGET_MIN;
export const REFILL_QR_THRESHOLD = 3;
export const MAX_DISCOVER_QR_PER_RUN = 5;

export function loadQuickReadQueue() {
  if (!existsSync(QR_QUEUE_PATH)) {
    return { version: 1, cadence: "Tue/Thu/Sat when quality gates pass", items: [] };
  }
  return JSON.parse(readFileSync(QR_QUEUE_PATH, "utf-8"));
}

export function saveQuickReadQueue(queue) {
  writeFileSync(QR_QUEUE_PATH, JSON.stringify(queue, null, 2) + "\n", "utf-8");
}

export function countQrPending(queue) {
  return (queue.items || []).filter((i) => i.status === "pending").length;
}

/** Merge curated QR seeds by id — never overwrite published / editorial_review rows. */
export function mergeMissingQrSeeds(queue) {
  if (!queue.items) queue.items = [];
  const ids = new Set(queue.items.map((i) => i.id));
  let added = 0;
  for (const seed of QR_QUEUE_SEED) {
    if (ids.has(seed.id)) continue;
    queue.items.push({ ...seed });
    ids.add(seed.id);
    added += 1;
  }
  return added;
}

export function ensureQrQueueDepth(queue, { minPending = MIN_QR_PENDING } = {}) {
  const added = mergeMissingQrSeeds(queue);
  const pending = countQrPending(queue);
  return {
    added,
    pending,
    ok: pending >= minPending,
    minPending,
  };
}

export function pickNextQuickRead(queue, existingSlugs) {
  const pending = (queue.items || []).filter((i) => i.status === "pending");
  for (const item of pending) {
    if (existingSlugs.has(item.id)) continue;
    if (item.publishedSlug && existingSlugs.has(item.publishedSlug)) continue;
    return item;
  }
  return null;
}

export function markQuickReadPublished(queue, itemId, slug) {
  const item = (queue.items || []).find((i) => i.id === itemId);
  if (!item) return false;
  item.status = "published";
  item.publishedSlug = slug;
  item.publishedAt = new Date().toISOString();
  return true;
}
