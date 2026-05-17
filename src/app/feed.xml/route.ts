import { getAllArticles } from "@/lib/articles";
import { siteConfig } from "@/lib/config";

export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  const articles = getAllArticles();
  const items = articles
    .map(
      (a) => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${siteConfig.url}/articles/${a.slug}</link>
      <guid isPermaLink="true">${siteConfig.url}/articles/${a.slug}</guid>
      <description><![CDATA[${a.excerpt}]]></description>
      <pubDate>${a.createdAt ? new Date(a.createdAt).toUTCString() : new Date().toUTCString()}</pubDate>
    </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteConfig.name} — American History Articles</title>
    <link>${siteConfig.url}</link>
    <description>${siteConfig.description}</description>
    <language>en-us</language>
    <atom:link href="${siteConfig.url}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
