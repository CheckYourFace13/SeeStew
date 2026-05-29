import Link from "next/link";
import { YouTubeSubscribeLink } from "@/components/SocialIcons";

export function FooterNewsletter() {
  return (
    <div className="mt-4 space-y-3">
      <YouTubeSubscribeLink className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-bright text-white transition hover:bg-brand-mid" />
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
