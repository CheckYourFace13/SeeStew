import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { AdSenseScript } from "@/components/AdSlot";
import { CookieConsent } from "@/components/CookieConsent";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { JsonLd } from "@/components/JsonLd";
import { analyticsConfig, siteConfig } from "@/lib/config";
import {
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
  defaultKeywords,
} from "@/lib/seo";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `Explore American History & Politics on ${siteConfig.name}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: defaultKeywords,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "Education",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `Explore American History & Politics on ${siteConfig.name}`,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.logoLight,
        width: 1440,
        height: 756,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.logoLight],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteConfig.url,
    languages: { "en-US": siteConfig.url },
    types: {
      "application/rss+xml": `${siteConfig.url}/feed.xml`,
    },
  },
  manifest: "/manifest.webmanifest",
  other: {
    "geo.region": "US",
    "geo.placename": "United States",
    "content-language": "en-US",
    ...(analyticsConfig.googleSiteVerification
      ? { "google-site-verification": analyticsConfig.googleSiteVerification }
      : {}),
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-US" className={`${outfit.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo-light.png" />
        <link rel="alternate" type="application/rss+xml" href="/feed.xml" title="SeeStew Stories" />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLMs" />
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://i.ytimg.com" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
      </head>
      <body className={`${outfit.variable} ${inter.variable} flex min-h-screen flex-col bg-surface text-ink antialiased`}>
        <JsonLd data={[buildWebSiteJsonLd(), buildOrganizationJsonLd()]} />
        <GoogleAnalytics />
        <AdSenseScript />
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
