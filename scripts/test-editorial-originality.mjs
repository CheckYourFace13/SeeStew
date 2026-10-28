#!/usr/bin/env node
/**
 * Regression tests for editorial originality / fact / hook gates.
 * Does not write production editorial-hold.json.
 */
process.env.SEESTEW_EDITORIAL_TEST = "1";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  candidateFromDraft,
  findOverlaps,
  classifyOverlap,
  scorePair,
} from "./editorial/overlap.mjs";
import { auditOpening } from "./editorial/hooks.mjs";
import { auditFacts, auditQuickReadAngle } from "./editorial/fact-gates.mjs";
import {
  buildEventIndex,
  saveEventIndex,
  loadEventIndex,
  upsertPublishedEntry,
  articleToIndexEntry,
  getIndexPath,
} from "./editorial/event-index.mjs";
import { runPrepublishGate } from "./editorial/prepublish-gate.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let passed = 0;
let failed = 0;

function assert(cond, name) {
  if (cond) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.error(`  FAIL  ${name}`);
  }
}

const SOURCES = `
## Sources

1. National Archives — [Link](https://www.archives.gov/example)
2. Library of Congress — [Link](https://www.loc.gov/example)
`;

function goodBody(extra = "") {
  return `In 1919, a riveted steel tank on Commercial Street in Boston failed catastrophically.
Engineers later measured wall thickness far below the load the vessel carried.
${extra}
${SOURCES}`;
}

console.log("\n=== Editorial originality regressions ===\n");

// --- Exact duplicate title ---
{
  console.log("Exact duplicate title");
  const a = candidateFromDraft({
    slug: "molasses-a",
    title: "Boston Molasses Flood 1919",
    body: goodBody(),
    eventYear: 1919,
  });
  const b = candidateFromDraft({
    slug: "molasses-b",
    title: "Boston Molasses Flood 1919",
    body: goodBody("Another telling of the same disaster."),
    eventYear: 1919,
  });
  const s = scorePair(a, b);
  const v = classifyOverlap(s, { format: "full" });
  assert(s.reasons.includes("exact_title") || s.score >= 0.95, "exact title scored high");
  assert(v.action === "block", "exact title blocks");
}

// --- Same event, different title ---
{
  console.log("Same event different title");
  const a = candidateFromDraft({
    slug: "great-molasses-flood-1919",
    title: "Great Molasses Flood of 1919 in Boston",
    body: goodBody(
      "The Purity Distilling tank released 2.3 million gallons across the North End killing twenty-one."
    ),
    eventYear: 1919,
    canonicalEventId: "great-molasses-flood::1919",
  });
  const b = candidateFromDraft({
    slug: "boston-syrup-disaster-1919",
    title: "Boston Syrup Disaster That Killed 21",
    body: goodBody(
      "The Purity Distilling tank released 2.3 million gallons across the North End killing twenty-one people."
    ),
    eventYear: 1919,
    canonicalEventId: "great-molasses-flood::1919",
  });
  const s = scorePair(a, b);
  const v = classifyOverlap(s, { format: "full" });
  assert(
    s.sameCanonical || s.shingleSim >= 0.16 || s.score >= 0.7,
    "same event detected via canonical/shingle"
  );
  assert(v.action === "block" || v.action === "hold_for_review", "same event not auto-allowed");
}

// --- Overlapping dates and entities ---
{
  console.log("Overlapping dates and entities");
  const a = candidateFromDraft({
    slug: "triangle-shirtwaist-fire-1911",
    title: "Triangle Shirtwaist Fire New York 1911",
    body: goodBody("Factory workers died when exits were locked in Manhattan."),
    eventYear: 1911,
  });
  const b = candidateFromDraft({
    slug: "triangle-fire-revisited-1911",
    title: "Triangle Shirtwaist Blaze New York Factory 1911",
    body: goodBody("Factory workers died when exits were locked in Manhattan again told."),
    eventYear: 1911,
  });
  const s = scorePair(a, b);
  assert(s.yearMatch && (s.entitySim > 0.3 || s.titleTok > 0.4), "date+entity overlap");
}

// --- False positive: distinct events sharing a date ---
{
  console.log("False positives for distinct events sharing a date");
  const a = candidateFromDraft({
    slug: "black-sox-scandal-1919",
    title: "Black Sox Scandal Chicago World Series",
    body: `In 1919, eight Chicago White Sox players were accused of throwing the World Series for gamblers.
Jury acquittals did not stop Judge Landis from banning them from organized baseball.
${SOURCES}`,
    eventYear: 1919,
  });
  const b = candidateFromDraft({
    slug: "great-molasses-flood-1919",
    title: "Boston Molasses Flood North End Tank Collapse",
    body: `In 1919, a poorly built storage tank in Boston's North End released a wave of molasses.
Twenty-one people died as the syrup flooded Commercial Street and crushed wooden buildings.
${SOURCES}`,
    eventYear: 1919,
  });
  const s = scorePair(a, b);
  const v = classifyOverlap(s, { format: "full" });
  assert(v.action === "allow", "1919 baseball vs molasses allowed");
  assert(s.score < 0.7, "distinct 1919 events stay below block score");
}

// --- Same person, different events ---
{
  console.log("Different events involving the same person");
  const a = candidateFromDraft({
    slug: "lincoln-cooper-union-1860",
    title: "Lincoln Cooper Union Address New York 1860",
    body: `In 1860 Abraham Lincoln spoke at Cooper Union in New York outlining constitutional limits on slavery expansion.
The address helped make him a national Republican figure before the nomination.
${SOURCES}`,
    eventYear: 1860,
  });
  const b = candidateFromDraft({
    slug: "lincoln-gettysburg-1863",
    title: "Lincoln Gettysburg Address Pennsylvania 1863",
    body: `In 1863 Abraham Lincoln delivered a short cemetery dedication after the Battle of Gettysburg in Pennsylvania.
The remarks redefined the Civil War as a struggle for a new birth of freedom.
${SOURCES}`,
    eventYear: 1863,
  });
  const s = scorePair(a, b);
  const v = classifyOverlap(s, { format: "full" });
  assert(v.action === "allow", "same person different events allowed");
}

// --- Quick Read with valid parent ---
{
  console.log("Quick Read with valid parent");
  const parent = candidateFromDraft({
    slug: "great-molasses-flood-1919",
    title: "Boston Molasses Flood 1919",
    body: goodBody("Full narrative of the tank failure and lawsuit."),
    eventYear: 1919,
  });
  const qr = candidateFromDraft({
    slug: "qr-molasses-plaque-2019",
    title: "The Molasses Flood Plaque Came a Century Late",
    body: `In 2019, Boston installed a bronze plaque at Langone Park marking the 1919 flood.
The memorial arrived a century after twenty-one people died on Commercial Street.
${SOURCES}`,
    eventYear: 2019,
    format: "quick-read",
    parentArticleSlug: "great-molasses-flood-1919",
    editorialAngle: "centennial plaque delay and memorial wording",
  });
  const s = scorePair(qr, parent);
  const v = classifyOverlap(s, {
    format: "quick-read",
    parentArticleSlug: "great-molasses-flood-1919",
  });
  assert(v.action === "allow" || v.status === "parent_ok" || v.status === "clear", "QR parent companion allowed");
  const angle = auditQuickReadAngle({
    title: qr.title,
    excerpt: qr.excerpt,
    body: qr.tokenSet ? undefined : undefined,
    editorialAngle: "centennial plaque delay",
    parentArticleSlug: "great-molasses-flood-1919",
    parentEntry: parent,
  });
  // Pass body with word count
  const qrBody = Array.from({ length: 12 }, (_, i) =>
    `In 2019 paragraph ${i + 1}: Boston finally placed a bronze plaque at Langone Park marking the 1919 molasses flood deaths and the North End tank site after a century of thin public memory.`
  ).join("\n");
  const angle2 = auditQuickReadAngle({
    title: qr.title,
    body: `${qrBody}\n${SOURCES}`,
    editorialAngle: "centennial plaque delay",
    parentArticleSlug: "great-molasses-flood-1919",
    parentEntry: parent,
  });
  assert(angle2.ok, "QR valid angle + parent ok");
}

// --- Quick Read with no unique angle ---
{
  console.log("Quick Read with no unique angle");
  const angle = auditQuickReadAngle({
    title: "Boston Molasses Flood 1919",
    body: goodBody().repeat(2),
    editorialAngle: null,
    parentArticleSlug: "great-molasses-flood-1919",
    parentEntry: {
      slug: "great-molasses-flood-1919",
      title: "Boston Molasses Flood 1919",
    },
  });
  assert(!angle.ok, "QR without angle blocked");
}

// --- Quick Read copying too much of parent ---
{
  console.log("Quick Read copying too much of parent");
  const shared =
    "The Purity Distilling Company tank stood at Commercial Street and released millions of gallons of molasses that crushed buildings horses and firefighters in the North End wave.";
  const parent = candidateFromDraft({
    slug: "great-molasses-flood-1919",
    title: "Boston Molasses Flood",
    body: goodBody(shared + " " + shared + " " + shared),
    eventYear: 1919,
  });
  const qr = candidateFromDraft({
    slug: "qr-copy",
    title: "Another Molasses Angle",
    body: goodBody(shared + " " + shared + " " + shared),
    eventYear: 1919,
    format: "quick-read",
    parentArticleSlug: "great-molasses-flood-1919",
    editorialAngle: "supposed detail",
  });
  const s = scorePair(qr, parent);
  const v = classifyOverlap(s, {
    format: "quick-read",
    parentArticleSlug: "great-molasses-flood-1919",
  });
  assert(v.action === "block" && v.reason === "quick_read_copies_parent", "QR parent copy blocked");
}

// --- Missing or fabricated citations ---
{
  console.log("Missing or fabricated citations");
  const bad = auditFacts({
    body: `In 1919 something happened.\n\n## Sources\n\n1. TODO: source\n2. https://example.com/placeholder`,
    eventYear: 1919,
  });
  assert(!bad.ok, "fabricated/missing citations fail");
  const good = auditFacts({
    body: goodBody(),
    eventYear: 1919,
    references: [
      { url: "https://www.archives.gov/x" },
      { url: "https://www.loc.gov/y" },
    ],
  });
  assert(good.ok, "credible citations pass");
}

// --- Contradictory dates ---
{
  console.log("Contradictory dates");
  const body = `Historians place the voyage in 1607 at Jamestown, then leap to 1776 independence, 1812 conflict, and 1865 war's end.
Nothing about the declared event year appears in this narrative at all.
${SOURCES}`;
  const r = auditFacts({ body, eventYear: 1919 });
  assert(!r.ok, "event year absent / contradictory dates fail");
  assert(
    r.issues.some((i) => i.code === "event_year_absent" || i.code === "contradictory_dates"),
    "flags missing or contradictory year"
  );
}

// --- Repetitive generic hooks ---
{
  console.log("Repetitive generic hooks");
  const open = auditOpening(
    `You won't believe what happened next in this forgotten tale of American mystery.\n\nMore text about 1919 Boston.`
  );
  assert(!open.ok && open.issues.some((i) => i.code === "generic_hook"), "generic hook rejected");
  const specific = auditOpening(
    `On January 15, 1919, a 50-foot molasses tank on Commercial Street in Boston's North End failed without warning.`
  );
  assert(specific.ok, "specific factual opening passes");
}

// --- Library index updated after publication ---
{
  console.log("Library index updated after publication");
  const tmp = path.join(__dirname, "..", "content", ".test-editorial-index.json");
  try {
    const index = buildEventIndex({ includeQueues: false });
    const before = index.entries.length;
    saveEventIndex(index, tmp);
    const entry = articleToIndexEntry(
      {
        slug: "test-editorial-index-slug-xyz",
        title: "Test Editorial Index Event 2099",
        excerpt: "Synthetic test entry",
        eventYear: 2099,
        format: "full",
      },
      goodBody("Synthetic unique prose about a fictional 2099 lighthouse collapse in Nome Alaska."),
      "published"
    );
    upsertPublishedEntry(entry, tmp);
    const after = loadEventIndex(tmp);
    assert(
      after.entries.some((e) => e.slug === "test-editorial-index-slug-xyz"),
      "index contains upserted slug"
    );
    assert(after.entries.length >= before, "index grew or retained entries");
  } finally {
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* ignore */
    }
  }
}

// --- Live index build smoke ---
{
  console.log("Live index build smoke");
  const index = buildEventIndex({ includeQueues: true });
  assert(index.publishedCount >= 100, "published library indexed");
  assert(Array.isArray(index.entries) && index.entries.length > 0, "entries present");
  // Candidate matching an existing published title should block
  const published = index.entries.find((e) => e.source === "published");
  if (published) {
    const draft = {
      slug: published.slug + "-redux",
      title: published.title,
      excerpt: published.excerpt,
      body: goodBody(published.excerpt || ""),
      eventYear: published.eventYear,
      format: "full",
      references: [
        { url: "https://www.archives.gov/x" },
        { url: "https://www.loc.gov/y" },
      ],
    };
    const gate = runPrepublishGate(draft);
    assert(gate.action === "block" || gate.action === "hold_for_review", "live duplicate title gated");
  }
}

console.log(`\nResults: ${passed} passed, ${failed} failed`);
console.log(`Index path (prod): ${getIndexPath()}`);
process.exit(failed ? 1 : 0);
