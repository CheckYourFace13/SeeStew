"use client";

import { useEffect } from "react";
import { emailSignupConfig } from "@/lib/email-signup";

const SCRIPT_ID = "sendfable-embed";

/** Inject SendFable form.js once per page (safe if mounted multiple times). */
export function SendFableScript() {
  useEffect(() => {
    if (!emailSignupConfig.isReady) return;
    if (typeof document === "undefined") return;
    if (document.getElementById(SCRIPT_ID)) return;

    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.src = emailSignupConfig.scriptSrc;
    s.async = true;
    document.body.appendChild(s);
  }, []);

  return null;
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
