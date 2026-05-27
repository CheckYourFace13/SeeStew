import { siteConfig } from "./config";
import type { Article, ArticleReference } from "./articles";

export type FaqItem = { question: string; answer: string };

export function buildFaqJsonLd(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: siteConfig.locale,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: `${siteConfig.url}${siteConfig.logo}`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/topics?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}${siteConfig.logo}`,
    description: siteConfig.description,
    email: siteConfig.email,
    areaServed: { "@type": "Country", name: "United States" },
    knowsAbout: [
      "American history",
      "United States politics",
      "Presidential history",
      "American Revolution",
      "US historical documentaries",
    ],
    sameAs: [
      siteConfig.social.youtube,
      siteConfig.social.instagram,
      siteConfig.social.tiktok,
    ],
  };
}

export function buildVideoObjectJsonLd(video: {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  slug: string;
}) {
  const pageUrl = `${siteConfig.url}/videos/${video.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnail,
    embedUrl: `https://www.youtube.com/embed/${video.id}`,
    contentUrl: `https://www.youtube.com/watch?v=${video.id}`,
    uploadDate: new Date().toISOString().split("T")[0],
    inLanguage: siteConfig.locale,
    isFamilyFriendly: true,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}${siteConfig.logo}` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
  };
}

export function buildArticleJsonLd(article: Article, url: string) {
  const citations = (article.references ?? []).map((r) => r.url);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": url,
    headline: article.title,
    description: article.excerpt,
    articleSection: article.category,
    wordCount: article.content.split(/\s+/).length,
    inLanguage: siteConfig.locale,
    isAccessibleForFree: true,
    author: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}${siteConfig.logo}` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    citation: citations,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".prose-history p", ".prose-history h2"],
    },
  };
}

export function referencesToCitationSchema(refs: ArticleReference[]) {
  return refs.map((r) => ({
    "@type": "CreativeWork",
    name: r.title,
    url: r.url,
    publisher: { "@type": "Organization", name: r.publisher },
  }));
}

export const homeFaqs: FaqItem[] = [
  {
    question: "What is SeeStew?",
    answer:
      "SeeStew tells unbelievable true stories from American history. Full videos are on YouTube at youtube.com/@SeeStew. Short clips are on Instagram and TikTok at @see.stew.",
  },
  {
    question: "Where can I watch SeeStew for free?",
    answer:
      "On seestew.com, youtube.com/@SeeStew, instagram.com/see.stew, and tiktok.com/@see.stew.",
  },
  {
    question: "What topics does SeeStew cover?",
    answer:
      "US presidents, wars, scandals, colonial history, political fights, crime, exploration, and shocking forgotten events — read and watch on seestew.com.",
  },
  {
    question: "Does SeeStew cite sources?",
    answer:
      "SeeStew stories cover strange disasters, political scandals, presidential oddities, and hidden U.S. history with named sources at the bottom of each article.",
  },
  {
    question: "Where can I read strange American history facts?",
    answer:
      "Browse unbelievable American history stories and strange U.S. history facts at seestew.com/articles and seestew.com/topics.",
  },
];

export const defaultKeywords = [
  "unbelievable American history stories",
  "hard to believe US history",
  "strange American history facts",
  "forgotten American history",
  "weird presidential history",
  "shocking US history stories",
  "true stories from American history",
  "obscure US history",
  "American history",
  "SeeStew",
  "US history channel",
  "American politics history",
  "Revolutionary War stories",
  "Civil War oddities",
];
