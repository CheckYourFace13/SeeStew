import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SendFableFormMount, SendFableScript } from "@/components/SendFableEmbed";
import { siteConfig } from "@/lib/config";
import { emailSignupConfig } from "@/lib/email-signup";

export const metadata: Metadata = {
  title: "Weekly history digest",
  description:
    "Get hard-to-believe American history stories, videos, and shorts in one weekly SeeStew email. No spam. Unsubscribe anytime.",
  alternates: { canonical: `${siteConfig.url}/newsletter` },
};

export default function NewsletterPage() {
  if (!emailSignupConfig.isReady) notFound();

  return (
    <div className="page-shell-narrow">
      <SendFableScript />
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Newsletter" }]}
      />
      <h1 className="font-heading text-4xl font-bold text-ink">
        Get the weekly SeeStew history digest
      </h1>
      <p className="mt-4 text-lg text-ink-muted">
        Hard-to-believe American history stories, videos, and shorts in one weekly email.
      </p>
      <div className="mt-8 min-h-[160px] rounded-xl border border-brand-wash bg-white p-6">
        <SendFableFormMount />
      </div>
      <p className="mt-4 text-sm text-ink-muted">
        No spam. Unsubscribe anytime. See our{" "}
        <Link href="/privacy" className="text-brand-mid underline">
          privacy policy
        </Link>
        .
      </p>
      <p className="mt-2 text-xs text-ink-muted">
        <a
          href={emailSignupConfig.poweredByUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Powered by SendFable
        </a>
      </p>
    </div>
  );
}
