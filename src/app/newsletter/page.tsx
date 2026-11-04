import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SendFableFormMount, SendFableScript } from "@/components/SendFableEmbed";
import { getAllArticles } from "@/lib/articles";
import { siteConfig } from "@/lib/config";
import { emailSignupConfig } from "@/lib/email-signup";

export const metadata: Metadata = {
  title: "Weekly history digest",
  description:
    "Get hard-to-believe American history stories, videos, and shorts in one weekly SeeStew email. No spam. Unsubscribe anytime.",
  alternates: { canonical: `${siteConfig.url}/newsletter` },
};

export default function NewsletterPage() {
  if (!emailSignupConfig.isReady) notFound();

  const sampleStories = getAllArticles()
    .filter((a) => a.format !== "quick-read")
    .slice(0, 5);

  return (
    <div className="page-shell-narrow">
      <SendFableScript />
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Newsletter" }]}
      />
      <h1 className="font-heading text-4xl font-bold text-ink">
        Get the weekly SeeStew history digest
      </h1>
      <p className="mt-4 text-lg text-ink-muted">
        One weekly email with hard-to-believe American history from SeeStew — not a
        daily drip, not a sales blast.
      </p>

      <div className="mt-8 min-h-[160px] rounded-xl border border-brand-wash bg-white p-6">
        <SendFableFormMount />
      </div>
      <p className="mt-4 text-sm text-ink-muted">
        No spam. Unsubscribe anytime. See our{" "}
        <Link href="/privacy" className="text-brand-mid underline">
          privacy policy
        </Link>
        .
      </p>
      <p className="mt-2 text-xs text-ink-muted">
        <a
          href={emailSignupConfig.poweredByUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Powered by SendFable
        </a>
      </p>

      <section className="mt-12 space-y-4 text-ink-muted">
        <h2 className="font-heading text-2xl font-bold text-ink">
          What the digest includes
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Links to recently published SeeStew <strong>stories</strong> (long articles
            and Quick Reads) with short, factual blurbs.
          </li>
          <li>
            Occasional pointers to independent SeeStew <strong>videos</strong> and{" "}
            <strong>shorts</strong> when new ones publish — those libraries are separate
            from the article archive.
          </li>
          <li>
            Frequency: about <strong>once per week</strong>, assembled by the editor
            from published SeeStew material. Delivery is not an automated guarantee of
            a fixed weekday clock time.
          </li>
          <li>
            Privacy: the signup form is hosted by SendFable. SeeStew does not sell your
            address. You can unsubscribe from every email.
          </li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-2xl font-bold text-ink">
          Sample digest issue
        </h2>
        <p className="mt-3 text-sm text-ink-muted">
          Labeled sample only — assembled from currently published stories so you can
          see the format. This block is <strong>not</strong> a claim that this exact
          issue was already emailed.
        </p>
        <ol className="mt-6 space-y-5">
          {sampleStories.map((story) => (
            <li key={story.slug} className="rounded-xl border border-brand-wash bg-white p-5">
              <h3 className="font-heading text-lg font-bold text-ink">
                <Link
                  href={`/articles/${story.slug}`}
                  className="hover:text-brand-mid"
                >
                  {story.title}
                </Link>
              </h3>
              <p className="mt-2 text-sm text-ink-muted">{story.excerpt}</p>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-10 text-sm text-ink-muted">
        Prefer reading on the site? Browse{" "}
        <Link href="/articles" className="text-brand-mid underline">
          stories
        </Link>
        ,{" "}
        <Link href="/videos" className="text-brand-mid underline">
          videos
        </Link>
        , or{" "}
        <Link href="/shorts" className="text-brand-mid underline">
          shorts
        </Link>
        .
      </p>
    </div>
  );
}
