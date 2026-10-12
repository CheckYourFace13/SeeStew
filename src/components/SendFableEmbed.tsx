import Script from "next/script";
import { emailSignupConfig } from "@/lib/email-signup";

/**
 * Loads SendFable form.js once per page (stable Script id).
 * Safe to mount from multiple signup blocks — Next dedupes by id.
 */
export function SendFableScript() {
  if (!emailSignupConfig.isReady) return null;
  return (
    <Script
      id="sendfable-embed"
      src={emailSignupConfig.scriptSrc}
      strategy="afterInteractive"
    />
  );
}

/** Mount point for the SendFable hosted form (no local email handling). */
export function SendFableFormMount({ className = "" }: { className?: string }) {
  if (!emailSignupConfig.isReady) return null;
  return (
    <div
      className={className}
      data-sendfable-form={emailSignupConfig.formId}
    />
  );
}
