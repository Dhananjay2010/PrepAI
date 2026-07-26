import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const score = searchParams.get("score") || "78";
    const role = searchParams.get("role") || "Software Engineer";

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "between",
            width: "100%",
            height: "100%",
            backgroundColor: "#F6F5F1",
            padding: "60px",
            fontFamily: "sans-serif",
          }}
        >
          {/* Top Brand Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: "#1C2230" }}>
              PrepAI
            </span>
            <span style={{ fontSize: 20, color: "#6B7280" }}>
              prepai.com
            </span>
          </div>

          {/* Center Score & Readiness */}
          <div style={{ display: "flex", flexDirection: "column", margin: "auto 0" }}>
            <span style={{ fontSize: 24, color: "#6B7280", letterSpacing: "1px", textTransform: "uppercase" }}>
              Interview Readiness Score
            </span>
            <div style={{ display: "flex", alignItems: "baseline", marginTop: "10px" }}>
              <span style={{ fontSize: 130, fontWeight: 800, color: "#2FAE85", lineHeight: "1" }}>
                {score}
              </span>
              <span style={{ fontSize: 40, color: "#6B7280", marginLeft: "15px" }}>
                / 100
              </span>
            </div>
            <span style={{ fontSize: 36, fontWeight: 600, color: "#1C2230", marginTop: "10px" }}>
              Target Role: {role}
            </span>
          </div>

          {/* Bottom Tagline */}
          <div style={{ display: "flex", alignItems: "center", borderTop: "2px solid #E5E7EB", paddingTop: "25px" }}>
            <span style={{ fontSize: 22, color: "#4C5FD5", fontWeight: 600 }}>
              Tailored interview questions & live practice evaluation
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (err: any) {
    return new Response(`Failed to generate image: ${err.message}`, {
      status: 500,
    });
  }
}
