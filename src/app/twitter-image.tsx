import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Dónde Ver la Final - Mapa para ver el Mundial en Argentina";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a2540 0%, #0b1a2e 50%, #0c2d4a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: "#facc15",
            textAlign: "center",
            lineHeight: 1.1,
            marginBottom: 24,
          }}
        >
          ¿Dónde Ver la Final?
        </div>
        <div
          style={{
            fontSize: 36,
            color: "#e2e8f0",
            textAlign: "center",
            lineHeight: 1.3,
            marginBottom: 40,
          }}
        >
          Mapa interactivo de bares y pubs
          <br />
          para ver el Mundial 2026
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#facc15",
              color: "#0a2540",
              padding: "12px 32px",
              borderRadius: 999,
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            🇦🇷 Vamos Argentina
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
