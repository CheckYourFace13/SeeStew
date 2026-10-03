#!/usr/bin/env node
const urls = [
  "https://seestew.com/",
  "https://seestew.com/articles",
  "https://seestew.com/topics",
  "https://seestew.com/topics/weird-america",
  "https://seestew.com/topics/military",
  "https://seestew.com/videos",
  "https://seestew.com/shorts",
  "https://seestew.com/faq",
  "https://seestew.com/affiliate-disclosure",
  "https://seestew.com/ads.txt",
  "https://seestew.com/sitemap.xml",
  "https://seestew.com/feed.xml",
  "https://seestew.com/llms.txt",
  "https://seestew.com/blog",
  "https://seestew.com/robots.txt",
];

const UA = "Mozilla/5.0 (compatible; SeeStewLiveVerify/1.0)";

async function main() {
  for (const u of urls) {
    const r = await fetch(u, { redirect: "manual", headers: { "User-Agent": UA } });
    const loc = r.headers.get("location");
    console.log(`${r.status} ${u}${loc ? ` -> ${loc}` : ""}`);
  }

  const article = await fetch("https://seestew.com/articles/black-tom-explosion-1916", {
    headers: { "User-Agent": UA },
  });
  const html = await article.text();
  const title = (html.match(/<title>([^<]+)<\/title>/i) || [])[1] || "";
  const desc = (html.match(/name="description" content="([^"]+)"/i) || [])[1] || "";
  console.log("article title:", title);
  console.log("article desc:", desc.slice(0, 160));
  console.log("glance What happened:", html.includes("What happened"));
  console.log("adsense meta/script:", /pub-9572509189594279|adsbygoogle|google-adsense/i.test(html));

  const topic = await (await fetch("https://seestew.com/topics/weird-america", { headers: { "User-Agent": UA } })).text();
  console.log("topic Related topics:", topic.includes("Related topics"));
  console.log("topic Start here:", topic.includes("Start here"));
  console.log("topic ItemList:", topic.includes("ItemList"));

  const sitemap = await (await fetch("https://seestew.com/sitemap.xml", { headers: { "User-Agent": UA } })).text();
  console.log("sitemap /blog:", /seestew\.com\/blog/.test(sitemap));
  console.log("sitemap /articles/:", sitemap.includes("/articles/"));

  const ads = await (await fetch("https://seestew.com/ads.txt", { headers: { "User-Agent": UA } })).text();
  console.log("ads.txt pub:", ads.includes("pub-9572509189594279"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
