import { adsTxtContent } from "@/lib/ads-txt";

/** Serve ads.txt at /ads.txt with plain-text headers (AdSense crawler requirement). */
export function GET() {
  return new Response(adsTxtContent, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
