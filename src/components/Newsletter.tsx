import Link from "next/link";
import { siteConfig } from "@/lib/config";

/** YouTube subscribe CTA — no public inbox or mailto links. */
export function Newsletter() {
  return (
    <section className="rounded-2xl bg-brand-primary px-6 py-10 text-white md:px-10">
      <h2 className="font-heading text-2xl font-bold text-brand-gold">Get updates</h2>
      <p className="mt-2 max-w-xl text-brand-pale/90">
        New documentaries and history stories — subscribe on YouTube for releases and
        shorts.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={siteConfig.social.youtubeSubscribe}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-brand-gold px-6 py-3 font-semibold text-brand-dark transition hover:brightness-110"
        >
          Subscribe on YouTube
        </a>
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
