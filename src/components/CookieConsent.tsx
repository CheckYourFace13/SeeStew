"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "seestew-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-meteorite-light/30 bg-brand-dark p-4 text-white shadow-2xl md:p-6"
    >
      <div className="container-page flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm leading-relaxed text-brand-meteorite-light">
          We use cookies for site function and ads (Google AdSense). See our{" "}
          <Link href="/privacy" className="underline hover:text-white">
            Privacy Policy
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={accept}
          className="shrink-0 rounded-lg bg-brand-bright px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-mid"
        >
          OK
        </button>
      </div>
    </div>
  );
}
