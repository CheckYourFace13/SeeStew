/**
 * Quick Read queue — separate from full-story story-queue.json.
 * Never consumes full-story pending items.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

export const QR_QUEUE_PATH = join(process.cwd(), "content", "quick-read-queue.json");
export const MIN_QR_PENDING = 3;
export const REFILL_QR_THRESHOLD = 2;

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
