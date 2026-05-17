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
  email: "info@seestew.com",
  logo: "/logo.png",
  logoLight: "/logo-light.png",
  locale: "en-US",
  region: "US",
  social: {
    youtube: "https://www.youtube.com/@SeeStew",
    youtubeSubscribe:
      "https://www.youtube.com/@SeeStew?sub_confirmation=1",
    youtubeVideos: "https://www.youtube.com/@SeeStew/videos",
    youtubeShorts: "https://www.youtube.com/@SeeStew/shorts",
    instagram: "https://www.instagram.com/see.stew/",
    tiktok: "https://www.tiktok.com/@see.stew",
    facebook:
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
  /** /videos requires duration >= this (seconds) — 2 minutes */
  longFormMinSeconds: 120,
  /** Used for heuristic Short detection when duration is ambiguous */
  shortFormMaxSeconds: 119,
} as const;

export const pipelineConfig = {
  cronSecret: process.env.CRON_SECRET ?? "",
  /** https://openrouter.ai — default: DeepSeek (strong + low cost) */
  openRouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
  openRouterModel:
    process.env.OPENROUTER_MODEL ?? "deepseek/deepseek-chat",
  maxStoriesPerRun: Number(process.env.PIPELINE_MAX_STORIES ?? "2"),
} as const;
