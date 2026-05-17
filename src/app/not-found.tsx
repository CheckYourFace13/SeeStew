import Link from "next/link";
import { siteConfig } from "@/lib/config";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="font-heading text-4xl font-bold text-ink">Page not found</h1>
      <p className="mt-4 text-ink-muted">
        That URL may be from an older version of {siteConfig.name}. Try one of these:
      </p>
      <ul className="mt-8 flex flex-col gap-3 text-brand-mid">
        <li>
          <Link href="/" className="underline">
            Home
          </Link>
        </li>
        <li>
          <Link href="/videos" className="underline">
            Documentaries
          </Link>
        </li>
        <li>
          <Link href="/shorts" className="underline">
            Shorts
          </Link>
        </li>
        <li>
          <Link href="/articles" className="underline">
            Stories
          </Link>
        </li>
      </ul>
    </div>
  );
}
