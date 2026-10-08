import Link from "next/link";
import { emailSignupConfig, sendfableSignupFormUrl } from "@/lib/email-signup";

type Props = {
  /** Compact footer variant */
  compact?: boolean;
  className?: string;
};

/**
 * Weekly digest signup. Renders only when SendFable is fully configured
 * (hosted form URL or server API + feature flag). Never shows a fake form.
 */
export function EmailDigestSignup({ compact = false, className = "" }: Props) {
  if (!emailSignupConfig.isReady) return null;

  const poweredRel = "noopener noreferrer";

  if (emailSignupConfig.mode === "hosted" && sendfableSignupFormUrl) {
    if (compact) {
      return (
        <p className={`text-xs text-brand-meteorite-light/80 ${className}`}>
          <a
            href={sendfableSignupFormUrl}
            target="_blank"
            rel={poweredRel}
            className="underline hover:text-white"
          >
            Get the weekly digest
          </a>
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
        <h2 className="font-heading text-xl font-bold text-ink">
          Get the weekly SeeStew history digest
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          Hard-to-believe American history stories, videos, and shorts in one weekly email.
        </p>
        <p className="mt-4">
          <a
            href={sendfableSignupFormUrl}
            target="_blank"
            rel={poweredRel}
            className="inline-flex items-center rounded-lg bg-brand-mid px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-bright"
          >
            Join the digest
          </a>
        </p>
        <p className="mt-3 text-xs text-ink-muted">
          No spam. Unsubscribe anytime.{" "}
          <Link href="/privacy" className="underline">
            Privacy
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

  // API mode: form posts to /api/newsletter (server uses SENDFABLE_* keys).
  // Component stays null until that route exists and isReady — see setup docs.
  return null;
}
