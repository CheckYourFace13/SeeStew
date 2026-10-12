"use client";

import { emailSignupConfig } from "@/lib/email-signup";

/**
 * Mount point for the SendFable hosted form (no local email handling).
 * Script is loaded once from the root layout (async/defer), not here —
 * avoids depending on client hydration for the third-party loader.
 */
export function SendFableFormMount({ className = "" }: { className?: string }) {
  if (!emailSignupConfig.isReady) return null;
  return (
    <div
      className={className}
      data-sendfable-form={emailSignupConfig.formId}
    />
  );
}

/** @deprecated Script loads from root layout; kept as no-op for call sites. */
export function SendFableScript() {
  return null;
}
