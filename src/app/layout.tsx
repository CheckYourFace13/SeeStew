import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
import { CookieConsent } from "@/components/CookieConsent";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { JsonLd } from "@/components/JsonLd";
import { ADSENSE_CLIENT_ID } from "@/lib/ads-txt";
import { adsConfig, analyticsConfig, siteConfig } from "@/lib/config";
import { emailSignupConfig } from "@/lib/email-signup";
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
    default: `Hard-to-Believe True American History Stories | ${siteConfig.name}`,
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
    title: `Hard-to-Believe True American History Stories | ${siteConfig.name}`,
    description: siteConfig.description,
    // Default share image: src/app/opengraph-image.tsx (branded, not logo-only)
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  // Do not set robots here — root robots:index conflicts with Next's automatic
  // noindex on 404 pages (GSC "duplicate robots" / soft indexing issues).
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
    "google-adsense-account": ADSENSE_CLIENT_ID,
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
        <meta name="google-adsense-account" content={ADSENSE_CLIENT_ID} />
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo-light.png" />
        <link rel="alternate" type="application/rss+xml" href="/feed.xml" title="SeeStew Stories" />
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://i.ytimg.com" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        {emailSignupConfig.isReady ? (
          <link rel="dns-prefetch" href="https://sendfable.com" />
        ) : null}
      </head>
      <body className={`${outfit.variable} ${inter.variable} flex min-h-screen flex-col bg-surface text-ink antialiased`}>
        <JsonLd data={[buildWebSiteJsonLd(), buildOrganizationJsonLd()]} />
        {adsConfig.enabled && adsConfig.publisherId ? (
          <Script
            id="google-adsense"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsConfig.publisherId}`}
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        ) : null}
        <GoogleAnalytics />
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <CookieConsent />
        {/*
          Load SendFable once after body content (async, not beforeInteractive).
          Inline bootstrap runs from SSR HTML so the embed works even if client
          hydration is delayed; id prevents duplicate injects.
        */}
        {emailSignupConfig.isReady ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){if(document.getElementById("sendfable-embed"))return;var s=document.createElement("script");s.id="sendfable-embed";s.src=${JSON.stringify(emailSignupConfig.scriptSrc)};s.async=true;document.body.appendChild(s);})();`,
            }}
          />
        ) : null}
      </body>
    </html>
  );
}
