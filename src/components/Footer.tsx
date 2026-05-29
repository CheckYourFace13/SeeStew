import Image from "next/image";
import Link from "next/link";
import { FooterNewsletter } from "@/components/FooterNewsletter";
import { SocialIconLinks } from "@/components/SocialIcons";
import { siteConfig } from "@/lib/config";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-brand-dark text-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-3">
        <div>
          <p className="font-heading text-sm font-semibold uppercase tracking-wide text-brand-meteorite-light">
            Explore
          </p>
          <p className="mt-3 text-sm leading-relaxed text-brand-meteorite-light/90">
            Discover untold stories of American history and politics.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/videos" className="hover:text-white">
                Videos
              </Link>
            </li>
            <li>
              <Link href="/articles" className="hover:text-white">
                Stories
              </Link>
            </li>
            <li>
              <Link href="/topics" className="hover:text-white">
                Topics
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-heading text-sm font-semibold uppercase tracking-wide text-brand-meteorite-light">
            Connect
          </p>
          <p className="mt-3 text-sm text-brand-meteorite-light/90">
            Follow SeeStew for new history videos and daily clips.
          </p>
          <div className="mt-4">
            <SocialIconLinks
              variant="header"
              className="[&_a]:text-brand-meteorite-light [&_a:hover]:bg-white/10 [&_a:hover]:text-white"
            />
          </div>
        </div>

        <div id="subscribe">
          <p className="font-heading text-sm font-semibold uppercase tracking-wide text-brand-meteorite-light">
            Engage
          </p>
          <p className="mt-3 text-sm text-brand-meteorite-light/90">
            Get new videos on YouTube
          </p>
          <FooterNewsletter />
          <p className="mt-4 text-sm">
            <Link
              href="/contact"
              className="text-brand-meteorite-light underline hover:text-white"
            >
              Contact form
            </Link>
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-6 text-center text-xs text-brand-meteorite-light/80 sm:flex-row sm:text-left">
          <Image
            src={siteConfig.logoLight}
            alt={siteConfig.name}
            width={80}
            height={32}
            className="h-8 w-auto opacity-90"
          />
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
