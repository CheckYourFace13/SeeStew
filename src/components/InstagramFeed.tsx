import { siteConfig } from "@/lib/config";

const INSTAGRAM_REELS = [
  {
    title: "Chappaquiddick: Kennedy's Scandalous Night",
    href: "https://www.instagram.com/see.stew/reel/DGeD4ysIhgf/",
    topic: "1969",
  },
  {
    title: "Intolerable Acts: How Britain United the Colonies",
    href: "https://www.instagram.com/see.stew/reel/DGs_At_oMd_/",
    topic: "Revolution",
  },
  {
    title: "Truman Assassination Attempt at Blair House",
    href: "https://www.instagram.com/see.stew/reel/DE2ikTPJX7h/",
    topic: "Presidents",
  },
  {
    title: "Boss Tweed & Tammany Hall",
    href: "https://www.instagram.com/see.stew/reel/DCZB3drIFME/",
    topic: "Gilded Age",
  },
  {
    title: "John Tyler's Presidency",
    href: "https://www.instagram.com/see.stew/reel/DCPRWvMq8Fw/",
    topic: "Antebellum",
  },
];

export function InstagramFeed() {
  return (
    <section>
      <h2 className="font-heading text-3xl font-semibold text-brand-primary md:text-4xl">
        American Insights Through Instagram
      </h2>
      <p className="mt-2 text-ink-muted">
        Reels on{" "}
        <a
          href={siteConfig.social.instagram}
          className="link-nav font-medium"
          target="_blank"
          rel="noopener noreferrer"
        >
          @see.stew
        </a>
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INSTAGRAM_REELS.map((reel) => (
          <a
            key={reel.href}
            href={reel.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-xl border border-surface-muted bg-surface p-5 transition hover:border-brand-bright hover:shadow-md"
          >
            <span className="text-xs font-medium uppercase tracking-wide text-brand-bright">
              {reel.topic}
            </span>
            <h3 className="mt-2 font-heading text-lg font-semibold leading-snug text-brand-primary group-hover:text-nav-hover">
              {reel.title}
            </h3>
            <span className="mt-3 inline-block text-sm font-medium text-ink-soft group-hover:text-brand-bright">
              Watch on Instagram →
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
