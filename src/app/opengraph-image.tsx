import { ImageResponse } from "next/og";
export const alt = "SAKADO SFAX — Camping, randonnée et aventures en Tunisie";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#123c36",
        color: "#f6f2e8",
        padding: "70px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", fontSize: 30, letterSpacing: 6 }}>
        SAKADO SFAX · TUNISIE
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 88,
          lineHeight: 1.05,
        }}
      >
        <span>Explorez. Respirez.</span>
        <span style={{ color: "#e3b675" }}>Vivez l’aventure.</span>
      </div>
      <div style={{ display: "flex", fontSize: 28 }}>
        Camping · Randonnée · Nature
      </div>
    </div>,
    size,
  );
}
