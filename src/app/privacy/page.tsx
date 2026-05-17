import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "SeeStew privacy policy — cookies, Google AdSense, and how we use your data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="font-heading text-4xl font-bold text-ink">Privacy Policy</h1>
      <p className="mt-2 text-sm text-ink-muted">Last updated: May 17, 2025</p>

      <div className="prose-history mt-8 space-y-6">
        <section>
          <h2>Overview</h2>
          <p>
            {siteConfig.name} ({siteConfig.url}) respects your privacy. This
            policy explains what information we collect and how we use it when you
            visit our website.
          </p>
        </section>

        <section>
          <h2>Information we collect</h2>
          <ul>
            <li>
              <strong>Usage data</strong> — pages visited, browser type, and
              approximate location via analytics tools.
            </li>
            <li>
              <strong>Email</strong> — only if you contact us or subscribe via
              our newsletter form.
            </li>
            <li>
              <strong>Cookies</strong> — small files stored on your device for
              site functionality and advertising.
            </li>
          </ul>
        </section>

        <section>
          <h2>Google AdSense & advertising</h2>
          <p>
            We use <strong>Google AdSense</strong> to display advertisements.
            Google and its partners may use cookies to serve ads based on your
            prior visits to this site or other websites.
          </p>
          <p>
            You may opt out of personalized advertising by visiting{" "}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Ads Settings
            </a>{" "}
            or{" "}
            <a
              href="https://optout.aboutads.info/"
              target="_blank"
              rel="noopener noreferrer"
            >
              aboutads.info
            </a>
            .
          </p>
          <p>
            Third-party vendors, including Google, use cookies to serve ads.
            Google&apos;s use of advertising cookies enables it and its partners
            to serve ads based on your visit to our site and/or other sites on
            the Internet.
          </p>
        </section>

        <section>
          <h2>Embedded content</h2>
          <p>
            Pages may embed YouTube videos. YouTube may collect usage data per
            Google&apos;s privacy policy when you play a video.
          </p>
        </section>

        <section>
          <h2>Your rights</h2>
          <p>
            Depending on your location, you may have rights to access, correct,
            or delete personal data. Contact us at {siteConfig.email}.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Questions about this policy:{" "}
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          </p>
        </section>
      </div>
    </div>
  );
}
