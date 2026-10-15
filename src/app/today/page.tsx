import { redirect } from "next/navigation";
import { getAllArticles } from "@/lib/articles";
import {
  anniversariesForDate,
  datePathSlug,
  onThisDayEnabled,
  todayPartsInSiteTz,
} from "@/lib/on-this-day";

/**
 * /today → today’s content-rich /on-this-day/{date} in America/New_York,
 * or /on-this-day when that calendar day has no curated items.
 * Not indexed as a separate hierarchy (robots via noindex metadata + redirect).
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  robots: { index: false, follow: true },
};

export default function TodayRedirectPage() {
  const slugs = new Set(getAllArticles().map((a) => a.slug));
  if (!onThisDayEnabled(slugs)) redirect("/on-this-day");

  const { month, day } = todayPartsInSiteTz();
  const items = anniversariesForDate(month, day, slugs);
  if (items.length === 0) redirect("/on-this-day");

  redirect(`/on-this-day/${datePathSlug(month, day)}`);
}
