#!/usr/bin/env node
/**
 * Full live audit for SeeStew routes — status, meta, schema, leaks.
 */
const UA = "Mozilla/5.0 (compatible; SeeStewAudit/1.0)";
const BASE = "https://seestew.com";

const ROUTES = [
  "/",
  "/articles",
  "/topics",
  "/topics/weird-america",
  "/topics/military",
  "/topics/scandal",
  "/topics/crime",
  "/topics/revolution",
  "/topics/politics",
  "/topics/presidents",
  "/videos",
  "/shorts",
  "/faq",
  "/about",
  "/editorial",
  "/contact",
  "/privacy",
  "/terms",
  "/affiliate-disclosure",
  "/ads.txt",
  "/sitemap.xml",
  "/robots.txt",
  "/feed.xml",
  "/llms.txt",
  "/blog",
  "/blog-post3",
];

async function fetchPage(path) {
  const url = path.startsWith("http") ? path : `${BASE}${path}`;
  const r = await fetch(url, {
    redirect: "manual",
    headers: { "User-Agent": UA, Accept: "text/html,*/*" },
  });
  const loc = r.headers.get("location") || "";
  let body = "";
  if (r.status >= 200 && r.status < 400 && !loc) {
    body = await r.text();
  } else if (r.status >= 300 && r.status < 400 && loc) {
    // follow one hop for final check
    const abs = loc.startsWith("http") ? loc : `${BASE}${loc}`;
    const r2 = await fetch(abs, { headers: { "User-Agent": UA } });
    body = await r2.text();
    return {
      path,
      status: r.status,
      location: loc,
      finalStatus: r2.status,
      body,
      url: abs,
    };
  }
  return { path, status: r.status, location: loc, body, url };
}

function extract(html) {
  const title = (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || "";
  const desc =
    (html.match(/name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
      html.match(/content=["']([^"']*)["'][^>]*name=["']description["']/i) ||
      [])[1] || "";
  const canonical =
    (html.match(/rel=["']canonical["'][^>]*href=["']([^"']*)["']/i) ||
      html.match(/href=["']([^"']*)["'][^>]*rel=["']canonical["']/i) ||
      [])[1] || "";
  const hasFaqSchema = /"@type"\s*:\s*"FAQPage"/.test(html);
  const hasBlogPosting = /"@type"\s*:\s*"BlogPosting"/.test(html);
  const hasItemList = /"@type"\s*:\s*"ItemList"/.test(html);
  const hasMailto = /mailto:/i.test(html);
  const hasInfoEmail = /info@seestew\.com/i.test(html);
  const hasAdsense = /pub-9572509189594279|adsbygoogle|google-adsense/i.test(html);
  const youtubeEmbeds = [...html.matchAll(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/g)].map(
    (m) => m[1]
  );
  const badYoutube = [...html.matchAll(/youtube\.com\/watch\?v=/g)].length;
  return {
    title: title.trim(),
    desc: desc.trim().slice(0, 180),
    canonical,
    hasFaqSchema,
    hasBlogPosting,
    hasItemList,
    hasMailto,
    hasInfoEmail,
    hasAdsense,
    youtubeEmbeds: youtubeEmbeds.length,
    badYoutube,
  };
}

async function main() {
  console.log("=== LIVE ROUTE AUDIT ===\n");
  const results = [];
  for (const path of ROUTES) {
    try {
      const r = await fetchPage(path);
      const meta = r.body ? extract(r.body) : {};
      results.push({ ...r, meta });
      const loc = r.location ? ` -> ${r.location}` : "";
      const final = r.finalStatus ? ` (final ${r.finalStatus})` : "";
      console.log(`${r.status}${loc}${final}\t${path}`);
      if (meta.title) console.log(`   title: ${meta.title}`);
      if (meta.desc) console.log(`   desc: ${meta.desc}`);
      if (meta.canonical) console.log(`   canonical: ${meta.canonical}`);
      if (meta.hasFaqSchema) console.log(`   FAQ schema: yes`);
      if (meta.hasItemList) console.log(`   ItemList: yes`);
      if (meta.hasBlogPosting) console.log(`   BlogPosting: yes`);
      if (meta.hasMailto || meta.hasInfoEmail) console.log(`   EMAIL LEAK`);
      if (meta.badYoutube) console.log(`   BAD youtube watch links: ${meta.badYoutube}`);
    } catch (e) {
      console.log(`ERR\t${path}\t${e.message}`);
    }
  }

  // sitemap checks
  console.log("\n=== SITEMAP ===");
  const sm = await (await fetch(`${BASE}/sitemap.xml`, { headers: { "User-Agent": UA } })).text();
  const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  console.log(`urls: ${urls.length}`);
  console.log(`has /blog: ${urls.some((u) => /\/blog(\/|$)/.test(u) && !/\/blog-/.test(u) === false)}`);
  const blogUrls = urls.filter((u) => u.includes("/blog"));
  console.log(`blog-ish urls: ${blogUrls.length}`, blogUrls.slice(0, 5));
  console.log(`has /articles/: ${urls.some((u) => u.includes("/articles/"))}`);
  console.log(`has /topics/presidents: ${urls.some((u) => u.includes("/topics/presidents"))}`);

  // sample article
  console.log("\n=== SAMPLE ARTICLE ===");
  const artPath = urls.find((u) => u.includes("/articles/")) || `${BASE}/articles/great-molasses-flood-1919`;
  const art = await fetchPage(artPath.replace(BASE, "") || "/articles/great-molasses-flood-1919");
  const am = extract(art.body || "");
  console.log("url", artPath);
  console.log(JSON.stringify(am, null, 2));
  console.log("byline SeeStew:", /By SeeStew|By Chris/i.test(art.body || ""));
  console.log("affiliate disclosure on article:", /Affiliate disclosure|may earn/i.test(art.body || ""));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
