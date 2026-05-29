import Link from "next/link";
import { siteConfig } from "@/lib/config";

export function FooterNewsletter() {
  return (
    <div className="mt-4 space-y-3">
      <a
        href={siteConfig.social.youtubeSubscribe}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex rounded-lg bg-brand-bright px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-mid"
      >
        Subscribe on YouTube
      </a>
      <p className="text-xs text-brand-meteorite-light/80">
        New videos and shorts on the channel. Questions?{" "}
        <Link href="/contact" className="underline hover:text-white">
          Contact us
        </Link>
        .
      </p>
    </div>
  );
}
