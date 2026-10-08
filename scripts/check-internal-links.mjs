#!/usr/bin/env node
/**
 * Static internal-link sanity check against local content + known routes.
 * Usage: node scripts/check-internal-links.mjs
 * Optional: node scripts/check-internal-links.mjs --live
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const SITE = "https://seestew.com";
const LIVE = process.argv.includes("--live");

const STATIC_OK = new Set([
  "/",
  "/articles",
  "/topics",
  "/videos",
  "/shorts",
  "/hubs",
  "/on-this-day",
  "/social",
  "/about",
  "/editorial",
  "/contact",
  "/privacy",
  "/terms",
  "/faq",
  "/affiliate-disclosure",
  "/ads.txt",
  "/sitemap.xml",
  "/robots.txt",
  "/feed.xml",
  "/llms.txt",
]);

function articleSlugs() {
  const dir = join(ROOT, "content", "articles");
  if (!existsSync(dir)) return new Set();
  return new Set(
    readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""))
  );
}

function topicSlugs() {
  // Mirror topic hub files if present; else derive from article categories later.
  const topics = new Set([
    "weird-america",
    "military",
    "scandal",
    "crime",
    "revolution",
    "politics",
  ]);
  return topics;
}

function collectHrefCandidates() {
  const hrefs = new Set();
  const walkDirs = [
    join(ROOT, "src"),
    join(ROOT, "content"),
  ];

  function walk(dir) {
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, name.name);
      if (name.isDirectory()) {
        if (name.name === "node_modules" || name.name === ".next") continue;
        walk(p);
      } else if (/\.(tsx?|jsx?|md|mjs|json)$/.test(name.name)) {
        const text = readFileSync(p, "utf-8");
        for (const m of text.matchAll(/href=["'](\/[^"'#?]+)["']/g)) {
          hrefs.add(m[1]);
        }
        for (const m of text.matchAll(/destination:\s*["'](\/[^"']+)["']/g)) {
          hrefs.add(m[1]);
        }
      }
    }
  }
  for (const d of walkDirs) walk(d);
  return [...hrefs];
}

function pathOk(pathname, articles, topics) {
  if (STATIC_OK.has(pathname)) return true;
  if (pathname.startsWith("/articles/")) {
    const slug = pathname.slice("/articles/".length).replace(/\/$/, "");
    return articles.has(slug);
  }
  if (pathname.startsWith("/topics/")) {
    const slug = pathname.slice("/topics/".length).replace(/\/$/, "");
    return topics.has(slug) || slug.length > 0;
  }
  if (pathname.startsWith("/hubs/")) return true; // populated hubs validated at runtime
  if (pathname.startsWith("/videos/") || pathname.startsWith("/shorts/")) return true;
  if (pathname.startsWith("/insights")) return true;
  if (pathname === "/blog" || pathname.startsWith("/blog-post")) return true; // redirected
  if (/\.(png|jpe?g|webp|svg|ico|txt|xml)$/i.test(pathname)) return true;
  return false;
}

async function main() {
  const articles = articleSlugs();
  const topics = topicSlugs();
  const hrefs = collectHrefCandidates();
  let failed = 0;
  const suspects = [];

  for (const href of hrefs.sort()) {
    if (href.includes("${") || href.includes("[") || href.includes("...")) continue;
    if (!pathOk(href, articles, topics)) {
      suspects.push(href);
    }
  }

  console.log(`Checked ${hrefs.length} local href pattern(s); ${articles.size} article slugs.`);

  if (suspects.length) {
    console.log("WARN: paths not in static allowlist / article set (review):");
    for (const s of suspects.slice(0, 40)) console.log(`  ${s}`);
    if (suspects.length > 40) console.log(`  … +${suspects.length - 40} more`);
  } else {
    console.log("PASS: no suspicious internal href patterns");
  }

  // Hard fail: mailto / public email
  const leakFiles = [];
  function scan(dir) {
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, name.name);
      if (name.isDirectory()) {
        if (["node_modules", ".next", ".git"].includes(name.name)) continue;
        scan(p);
      } else if (/\.(tsx?|jsx?|md|mjs|html)$/.test(name.name)) {
        const text = readFileSync(p, "utf-8");
        if (/mailto:|info@seestew\.com/i.test(text) && !p.includes("email-digest") && !p.includes("security-audit") && !p.includes("check-seo") && !p.includes("check-internal")) {
          leakFiles.push(p);
        }
      }
    }
  }
  scan(join(ROOT, "src"));
  scan(join(ROOT, "public"));
  if (leakFiles.length) {
    console.error("FAIL: public email/mailto found:");
    for (const f of leakFiles) console.error(`  ${f}`);
    failed++;
  } else {
    console.log("PASS: no mailto / info@ in src or public");
  }

  if (LIVE) {
    const routes = [
      "/",
      "/articles",
      "/topics",
      "/faq",
      "/affiliate-disclosure",
      "/ads.txt",
      "/blog",
      "/blog-post3",
      "/on-this-day",
      "/hubs",
    ];
    for (const r of routes) {
      const url = `${SITE}${r}`;
      try {
        const res = await fetch(url, { redirect: "manual" });
        const loc = res.headers.get("location") || "";
        const ok =
          res.status === 200 ||
          ((r === "/blog" || r === "/blog-post3") &&
            (res.status === 301 || res.status === 308) &&
            loc.includes(r === "/blog" ? "/articles" : "/articles/"));
        console.log(`${ok ? "PASS" : "FAIL"}\t${res.status}\t${url}${loc ? ` → ${loc}` : ""}`);
        if (!ok) failed++;
      } catch (e) {
        console.error(`FAIL\t${url}\t${e.message}`);
        failed++;
      }
    }
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
