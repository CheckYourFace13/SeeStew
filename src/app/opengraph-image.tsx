import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/config";

export const runtime = "edge";
export const alt = "SeeStew — hard-to-believe true American history stories";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Branded homepage / default social share image (not logo-only). */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          background: "linear-gradient(145deg, #1F1346 0%, #2f1c6a 45%, #5025d1 100%)",
          color: "#ffffff",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 4,
            textTransform: "uppercase",
            opacity: 0.85,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {siteConfig.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 64,
              lineHeight: 1.1,
              fontWeight: 700,
              maxWidth: 980,
            }}
          >
            Hard-to-believe true American history
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.35,
              opacity: 0.92,
              maxWidth: 900,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Documented stories with named sources — disasters, scandals, and
            forgotten chapters.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            opacity: 0.8,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          seestew.com
        </div>
      </div>
    ),
    { ...size }
  );
}
