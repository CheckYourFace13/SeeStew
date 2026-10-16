#!/usr/bin/env node
/**
 * Full-library editorial duplicate audit → docs/EDITORIAL_DUPLICATE_AUDIT.md
 * Does NOT delete or rewrite published articles.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildEventIndex, saveEventIndex, getIndexPath } from "./editorial/event-index.mjs";
import { auditLibrary, THRESHOLDS } from "./editorial/overlap.mjs";
import { hasGenericHook, genericHookHits } from "./editorial/normalize.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "docs", "EDITORIAL_DUPLICATE_AUDIT.md");

function main() {
  console.log("Building editorial event index…");
  const index = buildEventIndex({ includeQueues: true });
  saveEventIndex(index);
  console.log(
    `Indexed ${index.publishedCount} published + ${index.queueCount} pending queue items → ${getIndexPath()}`
  );

  const { pairFindings, queueFindings } = auditLibrary(index.entries);

  const published = index.entries.filter((e) => e.source === "published");
  const hookHits = published
    .filter((e) => hasGenericHook(e.opening || ""))
    .map((e) => ({
      slug: e.slug,
      title: e.title,
      patterns: genericHookHits(e.opening || ""),
      opening: (e.opening || "").slice(0, 160),
    }));

  const high = pairFindings.filter((f) => f.score >= 0.85 || f.reasons?.includes("exact_title"));
  const med = pairFindings.filter(
    (f) => f.score >= 0.7 && f.score < 0.85 && !high.includes(f)
  );
  const amb = pairFindings.filter((f) => f.score < 0.7);

  const held = queueFindings.filter(
    (q) => q.verdict?.action === "block" || q.verdict?.action === "hold_for_review"
  );

  const lines = [];
  lines.push("# Editorial Duplicate & Originality Audit");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("## Scope");
  lines.push("");
  lines.push("- Every published full-length article and Quick Read (`content/articles/*.json`)");
  lines.push("- Pending full-story queue (`content/story-queue.json`)");
  lines.push("- Pending Quick Read queue (`content/quick-read-queue.json`)");
  lines.push("- Canonical event ids, event years, places, named entities, title keys, token/shingle similarity");
  lines.push("");
  lines.push("**Policy:** This audit does **not** delete existing articles or change published URLs.");
  lines.push("Future candidates that fail the permanent pre-publish gate are blocked or held for review.");
  lines.push("");
  lines.push("## Method");
  lines.push("");
  lines.push("Deterministic overlap detector (no LLM sole authority):");
  lines.push("");
  lines.push("```");
  lines.push(JSON.stringify(THRESHOLDS, null, 2));
  lines.push("```");
  lines.push("");
  lines.push("Reusable index: `content/editorial-event-index.json` (updated incrementally after successful publishes).");
  lines.push("");
  lines.push("## Library snapshot");
  lines.push("");
  lines.push(`| Metric | Count |`);
  lines.push(`|--------|------:|`);
  lines.push(`| Published articles | ${index.publishedCount} |`);
  lines.push(`| Pending queue topics | ${index.queueCount} |`);
  lines.push(`| Published pair overlaps (score ≥ 0.70 or ambiguous shingle) | ${pairFindings.length} |`);
  lines.push(`| High-confidence pairs (score ≥ 0.85 / exact title) | ${high.length} |`);
  lines.push(`| Medium pairs (0.70–0.85) | ${med.length} |`);
  lines.push(`| Ambiguous pairs (< 0.70 but flagged) | ${amb.length} |`);
  lines.push(`| Queue topics blocked/held vs library | ${held.length} |`);
  lines.push(`| Published openings with generic template hooks | ${hookHits.length} |`);
  lines.push("");

  lines.push("## High-confidence overlaps (do not auto-delete)");
  lines.push("");
  if (!high.length) {
    lines.push("_None at block threshold. Library titles appear distinct at exact/canonical level._");
    lines.push("");
  } else {
    for (const f of high.slice(0, 40)) {
      lines.push(`### \`${f.a}\` ↔ \`${f.b}\``);
      lines.push("");
      lines.push(`- **A:** ${f.aTitle} (${f.aFormat})`);
      lines.push(`- **B:** ${f.bTitle} (${f.bFormat})`);
      lines.push(`- **Score:** ${f.score.toFixed(3)} | shingle ${f.shingleSim.toFixed(3)} | token ${f.tokenSim.toFixed(3)}`);
      lines.push(`- **Reasons:** ${(f.reasons || []).join(", ") || "score"}`);
      lines.push(`- **Action:** Keep both live URLs. Block any *new* candidate that matches either event identity.`);
      lines.push("");
    }
  }

  lines.push("## Medium overlaps (editorial awareness)");
  lines.push("");
  if (!med.length) {
    lines.push("_None in the 0.70–0.85 band._");
    lines.push("");
  } else {
    for (const f of med.slice(0, 30)) {
      lines.push(
        `- \`${f.a}\` ↔ \`${f.b}\` — score ${f.score.toFixed(3)} — ${(f.reasons || []).join(", ") || "similarity"}`
      );
    }
    lines.push("");
  }

  lines.push("## Ambiguous near-matches (watch list)");
  lines.push("");
  if (!amb.length) {
    lines.push("_None flagged below 0.70 with shingle/entity signals._");
    lines.push("");
  } else {
    for (const f of amb.slice(0, 25)) {
      lines.push(
        `- \`${f.a}\` ↔ \`${f.b}\` — score ${f.score.toFixed(3)} shingle ${f.shingleSim.toFixed(3)}`
      );
    }
    lines.push("");
  }

  lines.push("## Pending queue vs library / cross-queue");
  lines.push("");
  if (!held.length) {
    lines.push("_No pending queue items currently blocked or held by overlap rules._");
    lines.push("");
  } else {
    for (const q of held) {
      lines.push(`### \`${q.slug}\` (${q.format}, ${q.source})`);
      lines.push("");
      lines.push(`- **Title:** ${q.title}`);
      lines.push(`- **Verdict:** ${q.verdict?.action} — ${q.verdict?.reason}`);
      if (q.best) {
        lines.push(
          `- **Best match:** \`${q.best.slug}\` score ${q.best.score.toFixed(3)} — ${(q.best.reasons || []).join(", ")}`
        );
      }
      if (q.verdict?.recommend) lines.push(`- **Recommend:** ${q.verdict.recommend}`);
      lines.push("");
    }
  }

  lines.push("## Generic opening hooks in published library");
  lines.push("");
  lines.push(
    "Existing articles are **not** rewritten in this pass. New publishes that use these templates are blocked."
  );
  lines.push("");
  if (!hookHits.length) {
    lines.push("_No published openings matched the generic-hook pattern list._");
    lines.push("");
  } else {
    for (const h of hookHits.slice(0, 20)) {
      lines.push(`- \`${h.slug}\`: ${h.patterns.join("; ")}`);
    }
    lines.push("");
  }

  lines.push("## Permanent gates (going forward)");
  lines.push("");
  lines.push("1. **Complete library duplicate audit** via `scripts/editorial/overlap.mjs` against `editorial-event-index.json`");
  lines.push("2. **Full-length rules** — distinct event/angle, sources, no substantial overlap → **BLOCK** + conflict slug");
  lines.push("3. **Quick Read rules** — optional `parentArticleSlug`, `editorialAngle`, `canonicalEventId`; no parent-body copy");
  lines.push("4. **Factual verification** — citations, credible hosts, event year, no invented dialogue → fail closed");
  lines.push("5. **Opening / interestingness** — reject generic template hooks; compare recent openings");
  lines.push("6. **Cost** — deterministic first; incremental index; no full-library LLM scan per publish");
  lines.push("7. **Workflow** — wired into Daily Story + Quick Reads generators **before** write/commit; held items logged in `content/story-queue/editorial-hold.json`");
  lines.push("");
  lines.push("## Held for review");
  lines.push("");
  lines.push(
    "Candidates that fail or land in the ambiguous band are written to `content/story-queue/editorial-hold.json` and are **not** marked published. They are not retried indefinitely."
  );
  lines.push("");

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, lines.join("\n"), "utf8");
  console.log(`Wrote ${OUT}`);
  console.log(
    `Summary: high=${high.length} med=${med.length} amb=${amb.length} queueHeld=${held.length} hooks=${hookHits.length}`
  );
}

main();
