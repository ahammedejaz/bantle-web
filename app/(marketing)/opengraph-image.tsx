import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Bantle — share subscription costs. Keep your savings.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FAF5EC",
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          color: "#1A1A1A",
          fontFamily: "Georgia, serif",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontStyle: "italic",
            fontSize: "44px",
            color: "#04342C",
          }}
        >
          Bantle
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "28px",
          }}
        >
          <div
            style={{
              fontStyle: "italic",
              fontSize: "84px",
              lineHeight: 1.05,
              color: "#04342C",
              maxWidth: "920px",
            }}
          >
            Share subscription costs. Keep your savings.
          </div>
          <div
            style={{
              fontFamily: "Helvetica, Arial, sans-serif",
              fontSize: "30px",
              color: "#6B6B6B",
              maxWidth: "880px",
            }}
          >
            Find trusted neighbours to split family plans for Spotify,
            YouTube Premium, Apple One and more.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "Helvetica, Arial, sans-serif",
            fontSize: "22px",
            color: "#04342C",
          }}
        >
          <div style={{ display: "flex" }}>Coming soon to Play Store &amp; App Store</div>
          <div style={{ display: "flex" }}>bantle.in</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
