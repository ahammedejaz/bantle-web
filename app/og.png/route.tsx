import { ImageResponse } from "next/og";

// Served from a stable path rather than the hashed `opengraph-image` file
// convention, so every page can point at the same card and social platforms
// keep a single cache entry for it.
export const dynamic = "force-static";
const size = { width: 1200, height: 630 };

// Social card for every page. Deep-green canvas with the mint accent, matching the site's own
// top band, so a shared link reads as Bantle before the text is even read.
// `next/og` renders with Satori: no external fonts, no CSS variables, and every
// element that has more than one child needs an explicit `display`.
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "#00251E",
          color: "#EAF9F2",
          fontFamily: "Helvetica, Arial, sans-serif",
          position: "relative",
        }}
      >
        {/* Mint bloom in the top-right corner. */}
        <div
          style={{
            position: "absolute",
            top: "-260px",
            right: "-200px",
            width: "640px",
            height: "640px",
            borderRadius: "9999px",
            background:
              "radial-gradient(circle, rgba(122,240,199,0.30) 0%, rgba(122,240,199,0) 70%)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "9999px",
              background: "#7AF0C7",
              display: "flex",
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: "30px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Bantle
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
          {/* Two explicit lines. Satori wraps flex children rather than text,
              so the break is set here instead of left to the layout. */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "78px",
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.035em",
            }}
          >
            <div style={{ display: "flex" }}>Split or buy subscriptions</div>
            <div style={{ display: "flex" }}>
              with&nbsp;<span style={{ color: "#7AF0C7" }}>more trust</span>.
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "28px",
              lineHeight: 1.4,
              color: "#9ABEB0",
              maxWidth: "880px",
            }}
          >
            Verified listings, clear terms, proposal-first chat. Payments stay
            outside Bantle.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "28px",
            borderTop: "1px solid rgba(234,249,242,0.14)",
            fontSize: "22px",
            color: "#9ABEB0",
          }}
        >
          <div style={{ display: "flex" }}>Android and iOS · Live in India</div>
          <div style={{ display: "flex", color: "#7AF0C7" }}>bantle.in</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
