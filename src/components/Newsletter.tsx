import Link from "next/link";
import { SocialIconLinks } from "@/components/SocialIcons";

/** YouTube + social CTAs — no public inbox or mailto links. */
export function Newsletter() {
  return (
    <section className="rounded-2xl bg-brand-primary px-6 py-10 text-white md:px-10">
      <h2 className="font-heading text-2xl font-bold text-brand-gold">Get updates</h2>
      <p className="mt-2 max-w-xl text-brand-pale/90">
        New documentaries and history stories — follow SeeStew on YouTube, Instagram, and
        TikTok.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <SocialIconLinks
          variant="card"
          className="[&_a]:border-brand-pale/40 [&_a]:bg-brand-dark [&_a]:text-white [&_a:hover]:border-brand-gold"
        />
        <Link
          href="/contact"
          className="rounded-lg border border-brand-pale/40 px-6 py-3 font-semibold text-white transition hover:border-brand-gold"
        >
          Contact SeeStew
        </Link>
      </div>
    </section>
  );
}
