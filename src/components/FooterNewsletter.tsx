import Link from "next/link";
import { SocialIconLinks } from "@/components/SocialIcons";

/**
 * Follow CTA only — never a fake email form.
 * When a real provider is ready, gate a signup field on
 * NEXT_PUBLIC_EMAIL_SIGNUP_ENABLED (see docs/email-digest-setup.md).
 */
export function FooterNewsletter() {
  return (
    <div className="mt-4 space-y-3">
      <SocialIconLinks
        variant="header"
        className="[&_a]:bg-brand-bright [&_a]:text-white [&_a:hover]:bg-brand-mid [&_a:hover]:text-white"
      />
      <p className="text-xs text-brand-meteorite-light/80">
        Follow along on YouTube, Instagram, and TikTok, or browse the{" "}
        <Link href="/articles" className="underline hover:text-white">
          story archive
        </Link>
        . Questions?{" "}
        <Link href="/contact" className="underline hover:text-white">
          Contact us
        </Link>
        .
      </p>
    </div>
  );
}
