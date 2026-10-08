import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";

/** Load .env.local before any config modules read process.env. */
function loadEnvLocal() {
  const path = join(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf-8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

async function main() {
  loadEnvLocal();

  const { getAllArticles } = await import("../src/lib/articles");
  const { getYouTubeVideos } = await import("../src/lib/youtube");
  const { auditVideoArticleLinks } = await import("../src/lib/video-article-links");

  const articles = getAllArticles();
  const videos = await getYouTubeVideos();
  const { matched, unmatchedVideos, unmatchedArticles } = auditVideoArticleLinks(
    articles,
    videos
  );

  const lines: string[] = [];
  lines.push("# Video ↔ article link audit");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString().slice(0, 10)}`);
  lines.push(`Video catalog: live SeeStew YouTube feed (${videos.length} items)`);
  lines.push(`Articles: ${articles.length}`);
  lines.push("");
  lines.push("Matching rules (deterministic only — no fuzzy title overlap):");
  lines.push("1. `relatedVideoId` / `relatedShortId` / `sourceVideoId` on the article");
  lines.push("2. Exact slug match (`article.slug` === `video.slug`)");
  lines.push("3. Explicit map in `src/lib/video-article-links.ts` (`EXPLICIT_VIDEO_TO_ARTICLE`)");
  lines.push("");
  lines.push("## Matched pairs");
  lines.push("");
  if (matched.length === 0) {
    lines.push(
      "_None yet. Channel titles slugify differently from research article slugs; add explicit IDs when a true companion exists._"
    );
  } else {
    lines.push("| Article | Video / short | Format | Reason |");
    lines.push("| --- | --- | --- | --- |");
    for (const m of [...matched].sort((a, b) => a.articleSlug.localeCompare(b.articleSlug))) {
      lines.push(
        `| \`${m.articleSlug}\` | \`${m.videoSlug}\` (\`${m.videoId}\`) | ${m.format} | ${m.reason} |`
      );
    }
  }
  lines.push("");
  lines.push("## Unmatched videos / shorts");
  lines.push("");
  lines.push(
    "Do **not** force weak links. Add an explicit map entry or `relatedVideoId` only when verified."
  );
  lines.push("");
  for (const v of unmatchedVideos) {
    lines.push(`- \`${v.slug}\` (\`${v.id}\`, ${v.format}) — ${v.title}`);
  }
  lines.push("");
  lines.push("## Unmatched articles (no verified companion video)");
  lines.push("");
  lines.push(
    `${unmatchedArticles.length} of ${articles.length} articles have no deterministic video/short pair.`
  );
  lines.push(
    "That is expected for research-first stories. Link when a true companion exists."
  );
  lines.push("");
  lines.push("<details><summary>Unmatched article slugs</summary>");
  lines.push("");
  for (const a of [...unmatchedArticles].sort((x, y) => x.slug.localeCompare(y.slug))) {
    lines.push(`- \`${a.slug}\``);
  }
  lines.push("");
  lines.push("</details>");
  lines.push("");

  const docs = join(process.cwd(), "docs");
  if (!existsSync(docs)) mkdirSync(docs, { recursive: true });
  const out = join(docs, "video-article-link-audit.md");
  writeFileSync(out, lines.join("\n"), "utf-8");
  console.log(`Wrote ${out}`);
  console.log(
    `Matched: ${matched.length}; unmatched videos: ${unmatchedVideos.length}; unmatched articles: ${unmatchedArticles.length}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
