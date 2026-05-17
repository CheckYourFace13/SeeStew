"use client";

import { siteConfig } from "@/lib/config";
import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    window.location.href = `mailto:${siteConfig.email}?subject=SeeStew mailing list&body=Add me: ${encodeURIComponent(email)}`;
  }

  return (
    <section className="rounded-2xl bg-brand-primary px-6 py-10 text-white md:px-10">
      <h2 className="font-heading text-2xl font-bold text-brand-gold">Get updates</h2>
      <p className="mt-2 max-w-xl text-brand-pale/90">
        New documentaries and history stories — send your email and we will add you to the list.
      </p>
      <form
        onSubmit={handleSubmit}
        className="mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
      >
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-lg border border-brand-pale/30 bg-brand-dark px-4 py-3 text-white placeholder:text-brand-pale/50 focus:border-brand-gold focus:outline-none"
          aria-label="Email"
        />
        <button
          type="submit"
          className="rounded-lg bg-brand-gold px-6 py-3 font-semibold text-brand-dark transition hover:brightness-110"
        >
          Sign up
        </button>
      </form>
    </section>
  );
}
