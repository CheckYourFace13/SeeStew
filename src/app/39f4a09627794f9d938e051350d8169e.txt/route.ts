import { indexNowKeyFileBody } from "@/lib/indexnow";

/** Serve IndexNow ownership key at /<key>.txt (Bing Webmaster requirement). */
export function GET() {
  return new Response(indexNowKeyFileBody, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
