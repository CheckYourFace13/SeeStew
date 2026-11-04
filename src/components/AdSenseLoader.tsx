"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { adsConfig } from "@/lib/config";

const SCRIPT_ID = "google-adsense";

/**
 * Loads the AdSense client script only on pages that allow ads.
 * 404 / error templates mark themselves with [data-seestew-no-ads] so Auto ads
 * and the client script never initialize there. Publisher verification meta
 * stays in the root layout.
 */
export function AdSenseLoader() {
  const pathname = usePathname();

  useEffect(() => {
    if (!adsConfig.enabled || !adsConfig.publisherId) return;
    if (typeof document === "undefined") return;

    const blocked = Boolean(document.querySelector("[data-seestew-no-ads]"));
    const existing = document.getElementById(SCRIPT_ID);

    if (blocked) {
      existing?.remove();
      return;
    }

    if (existing) return;

    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsConfig.publisherId}`;
    document.head.appendChild(s);
  }, [pathname]);

  return null;
}
