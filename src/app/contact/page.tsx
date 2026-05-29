import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { SocialLinks } from "@/components/SocialLinks";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Contact SeeStew",
  description:
    "Contact SeeStew with questions, press inquiries, and partnerships using our secure form.",
  alternates: { canonical: `${siteConfig.url}/contact` },
};

export default function ContactPage() {
  return (
    <div className="page-shell-narrow">
      <h1 className="font-heading text-4xl font-bold text-ink">Contact</h1>
      <p className="mt-4 text-lg text-ink-muted">
        Use the form below to contact SeeStew. We do not publish a public inbox to
        reduce spam.
      </p>
      <p className="mt-2 text-ink-muted">
        For press, partnerships, corrections, or general questions, send a message and
        include how we can reach you.
      </p>

      <ContactForm />

      <div className="mt-12 border-t border-brand-wash pt-10">
        <p className="mb-4 font-semibold text-ink">Official channels</p>
        <SocialLinks compact />
      </div>
    </div>
  );
}
