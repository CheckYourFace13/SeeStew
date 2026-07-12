#!/usr/bin/env node
/**
 * Daily OpusClip poster for finished SeeStew shorts.
 *
 * - Oldest unposted .mp4 first (by LastWriteTime)
 * - Never duplicates (ledger by relative path + sha256)
 * - Uploads as-is: skipCurate, no burned-in captions, no crop/reframe
 * - OpusClip generates social description only
 * - Posts only to SeeStew Facebook / Instagram / TikTok / YouTube
 * - Schedules for 3:00 PM America/Chicago (or publishes immediately if that time has passed)
 *
 * Usage:
 *   node scripts/opusclip-daily-post.mjs
 *   node scripts/opusclip-daily-post.mjs --list-accounts
 *   node scripts/opusclip-daily-post.mjs --dry-run
 *   node scripts/opusclip-daily-post.mjs --force   # ignore once-per-day guard
 *
 * Requires OPUSCLIP_API_KEY in the environment or .env.local
 */

import { createHash } from "node:crypto";
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const API_BASE = "https://api.opus.pro/api";
const DEFAULT_VIDEO_DIR =
  "C:\\Users\\chris\\OneDrive\\Documents\\Businesses\\YouTube\\SeeStew\\AtlasShortsCopiedHere";
const TIME_ZONE = "America/Chicago";
const POST_HOUR = 15; // 3:00 PM Central
const POST_MINUTE = 0;

const ALLOWED_PLATFORMS = new Set([
  "FACEBOOK_PAGE",
  "INSTAGRAM_BUSINESS",
  "TIKTOK_BUSINESS",
  "YOUTUBE",
]);

const VIDEO_EXTS = new Set([".mp4", ".mov", ".m4v", ".webm"]);

/** Normalize brand names so "See Stew", "SeeStew", "see.stew" all match. */
function normalizeBrand(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function looksLikeSeeStew(value) {
  const n = normalizeBrand(value);
  return n.includes("seestew");
}

const args = new Set(process.argv.slice(2));
const LIST_ACCOUNTS = args.has("--list-accounts");
const DRY_RUN = args.has("--dry-run");
const FORCE = args.has("--force");

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(join(ROOT, ".env.local"));
loadEnvFile(join(ROOT, ".env"));

const API_KEY = process.env.OPUSCLIP_API_KEY?.trim();
const VIDEO_DIR = resolve(process.env.OPUSCLIP_VIDEO_DIR || DEFAULT_VIDEO_DIR);
const POSTED_DIR = join(VIDEO_DIR, "Posted");
const LEDGER_PATH = join(
  VIDEO_DIR,
  "records",
  "opusclip-daily-ledger.json"
);

function log(...parts) {
  const stamp = new Date().toISOString();
  console.log(`[${stamp}]`, ...parts);
}

function die(message, code = 1) {
  console.error(message);
  process.exit(code);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function api(method, path, { body, headers } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const detail = typeof json === "object" ? JSON.stringify(json) : text;
    throw new Error(`${method} ${path} -> ${res.status}: ${detail}`);
  }
  return json;
}

function loadLedger() {
  if (!existsSync(LEDGER_PATH)) {
    return { postedByName: {}, postedByHash: {}, runs: [] };
  }
  return JSON.parse(readFileSync(LEDGER_PATH, "utf8"));
}

function saveLedger(ledger) {
  mkdirSync(dirname(LEDGER_PATH), { recursive: true });
  writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2) + "\n");
}

function fileSha256(filePath) {
  return new Promise((resolveHash, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolveHash(hash.digest("hex")));
  });
}

function listQueueVideosSync() {
  return readdirSync(VIDEO_DIR, { withFileTypes: true })
    .filter((d) => d.isFile() && VIDEO_EXTS.has(extname(d.name).toLowerCase()))
    .map((d) => {
      const fullPath = join(VIDEO_DIR, d.name);
      const st = statSync(fullPath);
      return {
        name: d.name,
        fullPath,
        mtimeMs: st.mtimeMs,
        size: st.size,
      };
    })
    .sort((a, b) => a.mtimeMs - b.mtimeMs || a.name.localeCompare(b.name));
}

function titleFromFilename(name) {
  return basename(name, extname(name))
    .replace(/_\d{3,}$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function chicagoParts(date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(date).map((p) => [p.type, p.value])
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

function chicagoDateKey(date = new Date()) {
  const p = chicagoParts(date);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** Today's 3:00 PM America/Chicago as a UTC Date. */
function publishAtForToday() {
  const p = chicagoParts();
  // Iterate until Chicago wall-clock matches 15:00 on today's Chicago date.
  let guess = Date.UTC(p.year, p.month - 1, p.day, 20, 0, 0); // rough afternoon CT in UTC
  for (let i = 0; i < 8; i++) {
    const parts = chicagoParts(new Date(guess));
    const targetMin = POST_HOUR * 60 + POST_MINUTE;
    const actualMin = parts.hour * 60 + parts.minute;
    let deltaMin = targetMin - actualMin;
    const targetDay = Date.UTC(p.year, p.month - 1, p.day);
    const actualDay = Date.UTC(parts.year, parts.month - 1, parts.day);
    deltaMin += (targetDay - actualDay) / 60_000;
    if (Math.abs(deltaMin) < 0.5) break;
    guess += deltaMin * 60_000;
  }
  return new Date(guess);
}

function isSeeStewAccount(account) {
  if (!ALLOWED_PLATFORMS.has(account.platform)) return false;
  return [
    account.extUserName,
    account.extUserProfileLink,
    account.extUserId,
  ].some(looksLikeSeeStew);
}

function pickSeeStewAccounts(accounts) {
  const matched = accounts.filter(isSeeStewAccount);
  const byPlatform = new Map();
  for (const a of matched) {
    const list = byPlatform.get(a.platform) || [];
    list.push(a);
    byPlatform.set(a.platform, list);
  }

  const missing = [...ALLOWED_PLATFORMS].filter((p) => !byPlatform.has(p));
  if (missing.length) {
    throw new Error(
      `Missing SeeStew accounts for: ${missing.join(", ")}. Connect them in OpusClip, or rename so "SeeStew" / "See Stew" appears in the display name.`
    );
  }

  const chosen = [];
  for (const platform of ALLOWED_PLATFORMS) {
    const list = byPlatform.get(platform);
    list.sort((a, b) => {
      // Prefer OpusClip's selected destination, then exact-ish display names
      const score = (x) =>
        (x.selected ? 2 : 0) +
        (normalizeBrand(x.extUserName) === "seestew" ? 1 : 0);
      return score(b) - score(a);
    });
    if (list.length > 1) {
      log(
        `WARN: multiple SeeStew ${platform} accounts; using: ${list[0].extUserName}`
      );
    }
    chosen.push(list[0]);
  }
  return chosen;
}

async function listSocialAccounts() {
  const res = await api("GET", "/social-accounts?q=mine");
  return res?.data || res || [];
}

async function uploadLocalVideo(filePath) {
  log("Requesting upload link...");
  const link = await api("POST", "/upload-links", {
    body: { video: { usecase: "LocalUpload" } },
  });
  const gcsUrl = link.url;
  const uploadId = link.uploadId;
  if (!gcsUrl || !uploadId) {
    throw new Error(`Unexpected upload-links response: ${JSON.stringify(link)}`);
  }

  log("Starting resumable session...");
  const startRes = await fetch(gcsUrl, {
    method: "POST",
    headers: {
      "x-goog-resumable": "start",
      "Content-Length": "0",
    },
  });
  if (!startRes.ok) {
    throw new Error(`Resumable start failed: ${startRes.status}`);
  }
  const location = startRes.headers.get("location");
  if (!location) throw new Error("Missing GCS Location header");

  const size = statSync(filePath).size;
  log(`Uploading ${basename(filePath)} (${(size / 1e6).toFixed(1)} MB)...`);
  const putRes = await fetch(location, {
    method: "PUT",
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(size),
    },
    body: Readable.toWeb(createReadStream(filePath)),
    duplex: "half",
  });
  if (!putRes.ok) {
    const t = await putRes.text();
    throw new Error(`Upload PUT failed: ${putRes.status} ${t}`);
  }
  log("Upload complete.");
  return uploadId;
}

async function createPassthroughProject(uploadId, title) {
  log("Creating OpusClip project (skipCurate, no captions, no crop)...");
  const body = {
    videoUrl: uploadId,
    uploadedVideoAttr: { title },
    curationPref: {
      skipCurate: true,
      skipSlicing: true,
    },
    renderPref: {
      layoutAspectRatio: "portrait",
      enableCaption: false,
      enableCaptionAnimation: false,
      enableCrop: false,
      enableAutoLayout: false,
      enableScreenLayout: false,
      enableFillLayout: false,
      enableSplitLayout: false,
      enableThreeLayout: false,
      enableFourLayout: false,
      enableFitLayout: false,
      enableEmoji: false,
      enableHighlight: false,
      enableUppercase: false,
      enableWatermark: false,
      enableVisualHook: false,
      enableBroll: false,
    },
  };
  const res = await api("POST", "/clip-projects", { body });
  const projectId =
    res?.projectId ||
    res?.data?.projectId ||
    res?.id ||
    res?.data?.id;
  if (!projectId) {
    throw new Error(`No projectId in response: ${JSON.stringify(res)}`);
  }
  return projectId;
}

async function waitForClip(projectId, { timeoutMs = 3 * 60 * 60 * 1000 } = {}) {
  const started = Date.now();
  let attempt = 0;
  while (Date.now() - started < timeoutMs) {
    attempt += 1;
    try {
      const clips = await api(
        "GET",
        `/exportable-clips?q=findByProjectId&projectId=${encodeURIComponent(projectId)}&pageNum=1&pageSize=20`
      );
      const list = Array.isArray(clips) ? clips : clips?.data || [];
      if (list.length > 0) {
        const ready = list.find(
          (c) => c.uriForExport || c.uriForPreview || c.curationId || c.id
        );
        if (ready) {
          const clipId =
            ready.curationId ||
            (typeof ready.id === "string" && ready.id.includes(".")
              ? ready.id.split(".").pop()
              : ready.id);
          if (!clipId) throw new Error(`Could not parse clipId from ${JSON.stringify(ready)}`);
          return { clip: ready, clipId };
        }
      }
    } catch (err) {
      // Project may still be processing; 404/empty is normal early on
      if (attempt % 6 === 0) log(`Still waiting for clips: ${err.message}`);
    }
    if (attempt === 1 || attempt % 6 === 0) {
      log(`Waiting for project ${projectId} to finish (attempt ${attempt})...`);
    }
    await sleep(20_000);
  }
  throw new Error(`Timed out waiting for clips on project ${projectId}`);
}

async function generateSocialCopy(projectId, clipId, account) {
  const create = await api("POST", "/social-copy-jobs", {
    body: {
      projectId,
      clipId,
      postAccountId: account.postAccountId,
      ...(account.subAccountId ? { subAccountId: account.subAccountId } : {}),
    },
  });
  const jobId = create?.data?.jobId || create?.jobId;
  if (!jobId) throw new Error(`No social copy jobId: ${JSON.stringify(create)}`);

  for (let i = 0; i < 60; i++) {
    const job = await api("GET", `/social-copy-jobs/${encodeURIComponent(jobId)}`);
    const status = job?.data?.status || job?.status;
    if (status === "COMPLETED" || status === "SUCCEEDED" || status === "SUCCESS") {
      const data = job?.data || job;
      const title =
        data.title ||
        data.postTitle ||
        data.copy?.title ||
        data.result?.title;
      const description =
        data.description ||
        data.postDescription ||
        data.copy?.description ||
        data.result?.description ||
        data.content ||
        data.text;
      return { title, description, raw: data };
    }
    if (status === "FAILED" || status === "ERROR") {
      throw new Error(`Social copy failed: ${JSON.stringify(job)}`);
    }
    await sleep(5_000);
  }
  throw new Error(`Timed out waiting for social copy job ${jobId}`);
}

async function scheduleOrPublish({
  projectId,
  clipId,
  account,
  title,
  description,
  publishAt,
}) {
  const postDetail = {
    title,
    mediaType: "video",
    custom: {
      description: description || "",
      privacy: "public",
    },
  };
  const base = {
    projectId,
    clipId,
    postAccountId: account.postAccountId,
    ...(account.subAccountId ? { subAccountId: account.subAccountId } : {}),
    postDetail,
  };

  const now = Date.now();
  if (publishAt.getTime() > now + 60_000) {
    const res = await api("POST", "/publish-schedules", {
      body: {
        ...base,
        publishAt: publishAt.toISOString(),
      },
    });
    return {
      mode: "scheduled",
      scheduleId: res?.data?.scheduleId || res?.scheduleId,
      publishAt: publishAt.toISOString(),
      raw: res,
    };
  }

  const res = await api("POST", "/post-tasks", { body: base });
  return {
    mode: "immediate",
    postId: res?.data?.postId || res?.postId,
    raw: res,
  };
}

function moveToPosted(filePath) {
  mkdirSync(POSTED_DIR, { recursive: true });
  const dest = join(POSTED_DIR, basename(filePath));
  if (existsSync(dest)) {
    const stamped = join(
      POSTED_DIR,
      `${basename(filePath, extname(filePath))}_${Date.now()}${extname(filePath)}`
    );
    renameSync(filePath, stamped);
    return stamped;
  }
  renameSync(filePath, dest);
  return dest;
}

async function main() {
  if (!API_KEY) {
    die(
      "OPUSCLIP_API_KEY is not set. Add it to SeeStew/.env.local (or your user env), then re-run."
    );
  }

  if (!existsSync(VIDEO_DIR)) {
    die(`Video folder not found: ${VIDEO_DIR}`);
  }

  log(`Video folder: ${VIDEO_DIR}`);
  const accounts = await listSocialAccounts();

  if (LIST_ACCOUNTS) {
    console.log(JSON.stringify(accounts, null, 2));
    const chosen = pickSeeStewAccounts(accounts);
    console.log("\nSelected SeeStew destinations:");
    for (const a of chosen) {
      console.log(
        `- ${a.platform}: ${a.extUserName} (${a.postAccountId}${
          a.subAccountId ? ` / ${a.subAccountId}` : ""
        })`
      );
    }
    return;
  }

  const destinations = pickSeeStewAccounts(accounts);
  log(
    `Destinations: ${destinations
      .map((a) => `${a.platform}=${a.extUserName}`)
      .join(", ")}`
  );

  const ledger = loadLedger();
  const today = chicagoDateKey();
  const alreadyRanToday = (ledger.runs || []).some(
    (r) => r.dateKey === today && r.ok
  );
  if (alreadyRanToday && !FORCE) {
    log(`Already posted successfully today (${today} Central). Exiting.`);
    return;
  }

  const queue = listQueueVideosSync();
  const next = queue.find((v) => {
    if (ledger.postedByName?.[v.name]) return false;
    return true;
  });

  if (!next) {
    log("No unposted videos in the queue folder.");
    return;
  }

  log(
    `Next (oldest): ${next.name} (${(next.size / 1e6).toFixed(1)} MB, mtime ${new Date(
      next.mtimeMs
    ).toISOString()})`
  );

  const hash = await fileSha256(next.fullPath);
  if (ledger.postedByHash?.[hash]) {
    log(
      `Hash already posted as ${ledger.postedByHash[hash].name}. Moving aside to avoid re-post.`
    );
    moveToPosted(next.fullPath);
    ledger.postedByName[next.name] = {
      ...ledger.postedByHash[hash],
      skippedDuplicateHash: true,
      movedAt: new Date().toISOString(),
    };
    saveLedger(ledger);
    return;
  }

  if (DRY_RUN) {
    const publishAt = publishAtForToday();
    log(`[dry-run] Would upload, process without captions, generate OpusClip copy, and schedule to ${destinations.length} accounts at ${publishAt.toISOString()}`);
    return;
  }

  const title = titleFromFilename(next.name);
  const uploadId = await uploadLocalVideo(next.fullPath);
  const projectId = await createPassthroughProject(uploadId, title);
  log(`Project: ${projectId}`);
  const { clip, clipId } = await waitForClip(projectId);
  log(`Clip ready: ${clipId} — ${clip.title || title}`);

  const publishAt = publishAtForToday();
  const results = [];

  for (const account of destinations) {
    log(`Generating OpusClip copy for ${account.platform} / ${account.extUserName}...`);
    let copy;
    try {
      copy = await generateSocialCopy(projectId, clipId, account);
    } catch (err) {
      log(`WARN: social copy failed (${err.message}); falling back to clip metadata`);
      copy = {
        title: clip.title || title,
        description: [clip.description, clip.hashtags].filter(Boolean).join("\n\n"),
      };
    }

    const postTitle = (copy.title || clip.title || title).slice(0, 100);
    const postDescription =
      copy.description ||
      [clip.description, clip.hashtags].filter(Boolean).join("\n\n") ||
      postTitle;

    log(
      `Publishing to ${account.platform} (${publishAt > new Date() ? "schedule" : "now"})...`
    );
    const outcome = await scheduleOrPublish({
      projectId,
      clipId,
      account,
      title: postTitle,
      description: postDescription,
      publishAt,
    });
    results.push({
      platform: account.platform,
      account: account.extUserName,
      postAccountId: account.postAccountId,
      title: postTitle,
      description: postDescription,
      ...outcome,
    });
    log(`OK ${account.platform}: ${outcome.mode} ${outcome.scheduleId || outcome.postId || ""}`);
    // social posting rate limit ~1 req/s
    await sleep(1_200);
  }

  const movedTo = moveToPosted(next.fullPath);
  const record = {
    name: next.name,
    hash,
    projectId,
    clipId,
    postedAt: new Date().toISOString(),
    dateKey: today,
    publishAt: publishAt.toISOString(),
    movedTo,
    results,
  };
  ledger.postedByName[next.name] = record;
  ledger.postedByHash[hash] = { name: next.name, projectId, clipId, dateKey: today };
  ledger.runs = ledger.runs || [];
  ledger.runs.push({ dateKey: today, ok: true, name: next.name, at: record.postedAt });
  saveLedger(ledger);

  log(`Done. Moved to ${movedTo}`);
  console.log(JSON.stringify({ ok: true, record }, null, 2));
}

main().catch((err) => {
  console.error(err);
  try {
    const ledger = loadLedger();
    ledger.runs = ledger.runs || [];
    ledger.runs.push({
      dateKey: chicagoDateKey(),
      ok: false,
      error: String(err?.message || err),
      at: new Date().toISOString(),
    });
    saveLedger(ledger);
  } catch {
    /* ignore ledger write failures on crash */
  }
  process.exit(1);
});
