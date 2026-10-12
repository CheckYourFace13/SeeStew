import Link from "next/link";
import { SendFableFormMount, SendFableScript } from "@/components/SendFableEmbed";
import { emailSignupConfig } from "@/lib/email-signup";

type Props = {
  /** Compact footer: link to /newsletter */
  compact?: boolean;
  className?: string;
  /** Show embed + copy (default). Compact skips embed. */
  showEmbed?: boolean;
};

/**
 * Weekly digest signup via SendFable embed.
 * Never collects email locally. Hidden when feature flag disables signup.
 */
export function EmailDigestSignup({
  compact = false,
  className = "",
  showEmbed = true,
}: Props) {
  if (!emailSignupConfig.isReady) return null;

  const poweredRel = "noopener noreferrer";

  if (compact) {
    return (
      <p className={`text-xs text-brand-meteorite-light/80 ${className}`}>
        <Link href={emailSignupConfig.newsletterHref} className="underline hover:text-white">
          Get the weekly digest
        </Link>
        {" · "}
        <a
          href={emailSignupConfig.poweredByUrl}
          target="_blank"
          rel={poweredRel}
          className="opacity-80 hover:text-white"
        >
          Powered by SendFable
        </a>
      </p>
    );
  }

  return (
    <aside
      className={`rounded-xl border border-brand-wash bg-brand-wash/30 px-5 py-6 ${className}`}
      aria-label="Weekly email digest"
    >
      <SendFableScript />
      <h2 className="font-heading text-xl font-bold text-ink">
        Get the weekly SeeStew history digest
      </h2>
      <p className="mt-2 text-sm text-ink-muted">
        Hard-to-believe American history stories, videos, and shorts in one weekly email.
      </p>
      {showEmbed ? (
        <div className="mt-4 min-h-[120px]">
          <SendFableFormMount />
        </div>
      ) : (
        <p className="mt-4">
          <Link
            href={emailSignupConfig.newsletterHref}
            className="inline-flex items-center rounded-lg bg-brand-mid px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-bright"
          >
            Join the digest
          </Link>
        </p>
      )}
      <p className="mt-3 text-xs text-ink-muted">
        No spam. Unsubscribe anytime.{" "}
        <Link href="/privacy" className="underline">
          Privacy
        </Link>
        {" · "}
        <Link href={emailSignupConfig.newsletterHref} className="underline">
          Newsletter page
        </Link>
        {" · "}
        <a
          href={emailSignupConfig.poweredByUrl}
          target="_blank"
          rel={poweredRel}
          className="underline"
        >
          Powered by SendFable
        </a>
      </p>
    </aside>
  );
}
