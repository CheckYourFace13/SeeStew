/** 301 redirects from the old Hostinger Website Builder URLs (seestew.com sitemap) */
export const legacyRedirects = [
  {
    source: "/blog-post3",
    destination: "/articles/george-washington-timelines-legacies",
    permanent: true,
  },
  { source: "/blog-post1", destination: "/articles", permanent: true },
  { source: "/blog-post2", destination: "/articles", permanent: true },
  { source: "/blog-post6", destination: "/articles", permanent: true },
  { source: "/blog-post4", destination: "/articles", permanent: true },
  { source: "/blog-post5", destination: "/articles", permanent: true },
  { source: "/blog-post7", destination: "/articles", permanent: true },
  { source: "/blog-post8", destination: "/articles", permanent: true },
  { source: "/blog-post9", destination: "/articles", permanent: true },
  { source: "/blog-post10", destination: "/articles", permanent: true },
  {
    source: "/exploring-untold-stories-of-american-history-and-politics-on-seestew",
    destination: "/",
    permanent: true,
  },
  {
    source: "/the-best-leaders-of-the-united-states-their-tenure-and-lasting-impact",
    destination: "/articles",
    permanent: true,
  },
  {
    source: "/stories-from-us-politics-that-should-be-removed-from-history-books",
    destination: "/articles",
    permanent: true,
  },
  { source: "/videos-of-american-history", destination: "/videos", permanent: true },
  { source: "/stories-of-american-history", destination: "/articles", permanent: true },
  // Stray Website Builder storefront pages (not SeeStew content)
  { source: "/classic-cap-hpeszv", destination: "/", permanent: true },
  { source: "/face-serum-gxrcld", destination: "/", permanent: true },
  { source: "/handmade-vase-slowpy", destination: "/", permanent: true },
  { source: "/hand-soap-giguos", destination: "/", permanent: true },
  { source: "/set-of-plates-cxlzwx", destination: "/", permanent: true },
  { source: "/sunglasses-iubjnq", destination: "/", permanent: true },
  { source: "/wooden-chair-mopukh", destination: "/", permanent: true },
  { source: "/wool-sweater-lortoo", destination: "/", permanent: true },
] as const;
