import { redirect } from "next/navigation";

/** Compatibility alias — same behavior as /today; not a duplicate archive. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  robots: { index: false, follow: true },
};

export default function ThisDayCompatPage() {
  redirect("/today");
}
