import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          border: "2px solid #27272a",
          position: "relative",
          borderRadius: 4,
        }}
      >
        {/* Terminal glyph */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            color: "#ffffff",
            fontSize: 18,
            fontWeight: 800,
            fontFamily: "monospace",
          }}
        >
          <span style={{ color: "#3b82f6" }}>&gt;</span>_
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}