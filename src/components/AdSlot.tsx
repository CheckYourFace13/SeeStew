"use client";

import Script from "next/script";
import { adsConfig } from "@/lib/config";

type AdSlotProps = {
  slot?: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
  label?: string;
};

function AdPush({ slot }: { slot?: string }) {
  return (
    <Script id={`adsense-push-${slot ?? "auto"}`} strategy="afterInteractive">
      {`(adsbygoogle = window.adsbygoogle || []).push({});`}
    </Script>
  );
}

export function AdSlot({
  slot,
  format = "auto",
  className = "",
  label = "Advertisement",
}: AdSlotProps) {
  const { enabled, publisherId } = adsConfig;

  if (!enabled || !publisherId) return null;

  return (
    <aside className={`my-6 ${className}`} aria-label={label}>
      <p className="mb-1 text-center text-xs uppercase tracking-wide text-ink-muted">
        {label}
      </p>
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
      <AdPush slot={slot} />
    </aside>
  );
}
