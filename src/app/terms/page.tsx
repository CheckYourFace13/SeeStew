import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use for SeeStew.com content and services.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="font-heading text-4xl font-bold text-ink">Terms of Use</h1>
      <p className="mt-2 text-sm text-ink-muted">Last updated: May 17, 2025</p>

      <div className="prose-history mt-8 space-y-6">
        <section>
          <h2>Agreement</h2>
          <p>
            By using {siteConfig.url}, you agree to these terms. If you do not
            agree, please do not use the site.
          </p>
        </section>

        <section>
          <h2>Content</h2>
          <p>
            Articles and original text on this site are owned by {siteConfig.name}
            unless otherwise noted. Video content is hosted on YouTube and
            subject to YouTube&apos;s terms. You may share links to our pages;
            do not republish full articles without permission.
          </p>
        </section>

        <section>
          <h2>Disclaimer</h2>
          <p>
            We strive for accuracy but history interpretation varies. Content is
            for educational and entertainment purposes, not legal or professional
            advice.
          </p>
        </section>

        <section>
          <h2>Advertising</h2>
          <p>
            This site displays third-party advertisements through Google AdSense.
            We are not responsible for the content of ads served by Google or
            its partners.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          </p>
        </section>
      </div>
    </div>
  );
}
