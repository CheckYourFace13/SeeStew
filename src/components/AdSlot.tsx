"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { adsConfig } from "@/lib/config";

type AdSlotProps = {
  slot?: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
  label?: string;
};

export function AdSlot({
  slot,
  format = "auto",
  className = "",
  label = "Advertisement",
}: AdSlotProps) {
  const { enabled, publisherId } = adsConfig;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!enabled || !publisherId) {
    return (
      <aside
        className={`ad-slot ${className}`}
        aria-label={label}
        data-ad-placeholder
      >
        <span>{label} — enable AdSense in .env.local</span>
      </aside>
    );
  }

  return (
    <aside className={`my-6 ${className}`} aria-label={label}>
      <p className="mb-1 text-center text-xs uppercase tracking-wide text-ink-muted">
        {label}
      </p>
      {ready ? (
        <>
          <ins
            className="adsbygoogle block"
            style={{ display: "block" }}
            data-ad-client={publisherId}
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive="true"
          />
          <Script id={`adsense-push-${slot ?? "auto"}`} strategy="afterInteractive">
            {`(adsbygoogle = window.adsbygoogle || []).push({});`}
          </Script>
        </>
      ) : (
        <div className="min-h-[90px]" aria-hidden />
      )}
    </aside>
  );
}

export function AdSenseScript() {
  const { enabled, publisherId } = adsConfig;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!enabled || !publisherId || !ready) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  );
}
