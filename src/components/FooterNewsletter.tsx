"use client";

import { siteConfig } from "@/lib/config";
import { useState } from "react";

export function FooterNewsletter() {
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    window.location.href = `mailto:${siteConfig.email}?subject=SeeStew subscribe&body=Please add: ${encodeURIComponent(email)}`;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
      <input
        type="email"
        required
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 rounded-lg border border-white/20 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft focus:border-brand-bright focus:outline-none"
        aria-label="Email address"
      />
      <button
        type="submit"
        className="rounded-lg bg-brand-bright px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-mid"
      >
        Subscribe
      </button>
    </form>
  );
}
