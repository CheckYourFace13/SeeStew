import type { Metadata } from "next";
import { SocialLinks } from "@/components/SocialLinks";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Contact SeeStew",
  description: "Email SeeStew for questions, press, and partnerships.",
  alternates: { canonical: `${siteConfig.url}/contact` },
};

export default function ContactPage() {
  return (
    <div className="page-shell-narrow">
      <h1 className="font-heading text-4xl font-bold text-ink">Contact</h1>
      <p className="mt-4 text-lg text-ink-muted">
        Email us at{" "}
        <a
          href={`mailto:${siteConfig.email}`}
          className="font-semibold text-brand-mid underline"
        >
          {siteConfig.email}
        </a>
      </p>

      <div className="mt-12">
        <p className="mb-4 font-semibold text-ink">Official channels</p>
        <SocialLinks compact />
      </div>
    </div>
  );
}
