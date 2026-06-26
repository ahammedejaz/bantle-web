import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Bantle - Split or buy subscriptions with more trust";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FAFBFA",
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          color: "#102622",
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
            color: "#004D43",
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
              color: "#004D43",
              maxWidth: "920px",
            }}
          >
            Split or buy subscriptions with more trust.
          </div>
          <div
            style={{
              fontFamily: "Helvetica, Arial, sans-serif",
              fontSize: "30px",
              color: "#68726F",
              maxWidth: "880px",
            }}
          >
            Find subscription slots, review details, and propose deals with
            clearer trust signals. Payments stay outside Bantle.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "Helvetica, Arial, sans-serif",
            fontSize: "22px",
            color: "#004D43",
          }}
        >
          <div style={{ display: "flex" }}>Android &amp; iOS · Early access</div>
          <div style={{ display: "flex" }}>bantle.in</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
