/**
 * Quick Read queue — separate from full-story story-queue.json.
 * Never consumes full-story pending items.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { QR_QUEUE_SEED } from "./quick-read-queue-seed.mjs";
import {
  isSeasonalPublishCandidate,
  queueItemSeasonalScore,
} from "./seasonal-calendar.mjs";

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

export function pickNextQuickRead(queue, existingSlugs, now = new Date()) {
  const pending = (queue.items || []).filter((i) => {
    if (i.status !== "pending") return false;
    if (existingSlugs.has(i.id)) return false;
    if (i.publishedSlug && existingSlugs.has(i.publishedSlug)) return false;
    return true;
  });
  if (!pending.length) return null;

  const seasonal = pending
    .filter((item) => isSeasonalPublishCandidate(item, now))
    .sort(
      (a, b) =>
        queueItemSeasonalScore(b, now) - queueItemSeasonalScore(a, now)
    );
  const evergreen = pending.filter(
    (item) => !isSeasonalPublishCandidate(item, now)
  );
  const recent = (queue.items || [])
    .filter((i) => i.status === "published" && i.publishedAt)
    .sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)))
    .slice(0, 1);
  const lastWasSeasonal = recent[0]?.seasonalPick === true;

  if (lastWasSeasonal && evergreen.length) return evergreen[0];
  if (seasonal.length) return seasonal[0];
  return pending[0];
}

export function markQuickReadPublished(queue, itemId, slug, now = new Date()) {
  const item = (queue.items || []).find((i) => i.id === itemId);
  if (!item) return false;
  item.status = "published";
  item.publishedSlug = slug;
  item.publishedAt = new Date().toISOString();
  item.seasonalPick = isSeasonalPublishCandidate(item, now);
  return true;
}
