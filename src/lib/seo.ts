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
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: `${siteConfig.url}/contact`,
    },
    areaServed: { "@type": "Country", name: "United States" },
    knowsAbout: [
      "American history",
      "United States politics",
      "Presidential history",
      "American Revolution",
      "US historical documentaries",
    ],
    sameAs: [
      siteConfig.social.youtubeUrl,
      siteConfig.social.instagramUrl,
      siteConfig.social.tiktokUrl,
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
  const published = article.createdAt?.split("T")[0];
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
    ...(published ? { datePublished: published, dateModified: published } : {}),
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
      "SeeStew is a daily American history site for hard-to-believe true stories — disasters, scandals, and forgotten events that sound fictional but are documented. Read researched articles on seestew.com; watch companion videos on YouTube at youtube.com/@SeeStew.",
  },
  {
    question: "Are the stories real?",
    answer:
      "Yes. Every article is grounded in named, linked sources — archives, museums, academic publishers, and established news organizations — listed at the bottom of each story.",
  },
  {
    question: "How often do new stories publish?",
    answer:
      "SeeStew publishes new researched history articles regularly, aiming for daily updates. Browse the latest at seestew.com/articles.",
  },
  {
    question: "What topics does SeeStew cover?",
    answer:
      "US presidents, wars, scandals, colonial history, political fights, crime, exploration, and shocking forgotten events — with full written stories and optional video on seestew.com.",
  },
  {
    question: "Where can I read strange American history facts?",
    answer:
      "Start at seestew.com/articles for unbelievable American history stories, or browse by subject at seestew.com/topics.",
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
