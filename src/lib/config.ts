export const brand = {
  purple: {
    dark: "#1F1346",
    primary: "#2f1c6a",
    mid: "#5025d1",
    bright: "#673de6",
    light: "#8c85ff",
    pale: "#B39EF3",
    wash: "#ebe4ff",
  },
  accent: {
    pink: "#d63163",
    pinkBright: "#fc5185",
    gold: "#ffcd35",
    goldDark: "#9F6000",
  },
} as const;

export const siteConfig = {
  name: "SeeStew",
  tagline: "American History & Politics",
  description:
    "SeeStew — unbelievable true stories from American history. Watch long-form videos, read shocking hidden history, and follow daily clips on YouTube, Instagram, and TikTok.",
  url: "https://seestew.com",
  logo: "/logo.png",
  logoLight: "/logo-light.png",
  locale: "en-US",
  region: "US",
  social: {
    youtubeUrl: "https://www.youtube.com/@SeeStew",
    youtubeSubscribeUrl:
      "https://www.youtube.com/@SeeStew?sub_confirmation=1",
    youtubeVideosUrl: "https://www.youtube.com/@SeeStew/videos",
    youtubeShortsUrl: "https://www.youtube.com/@SeeStew/shorts",
    instagramUrl: "https://www.instagram.com/see.stew/",
    tiktokUrl: "https://www.tiktok.com/@see.stew",
    facebookUrl:
      "https://www.facebook.com/profile.php?id=61568343514187",
  },
} as const;

export const adsConfig = {
  /** Same as live site: ca-pub-9572509189594279 */
  publisherId: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ?? "",
  enabled: process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true",
} as const;

/** Google Search Console HTML tag + Analytics 4 */
export const analyticsConfig = {
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "",
  googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
} as const;

export const youtubeConfig = {
  channelId: process.env.YOUTUBE_CHANNEL_ID ?? "",
  apiKey: process.env.YOUTUBE_API_KEY ?? "",
  handle: "SeeStew",
  /** Full-length videos are longer than 60 seconds (see SHORT_MAX_SECONDS in youtube.ts). */
  longFormMinSeconds: 61,
  shortFormMaxSeconds: 60,
} as const;

export const pipelineConfig = {
  cronSecret: process.env.CRON_SECRET ?? "",
  openRouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
  openRouterModel:
    process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini",
  maxStoriesPerRun: Number(process.env.PIPELINE_MAX_STORIES ?? "1"),
} as const;
