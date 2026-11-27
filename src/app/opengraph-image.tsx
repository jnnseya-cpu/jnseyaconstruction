import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

/**
 * Link preview card for WhatsApp, LinkedIn, Facebook and X (1200×630).
 * Brand logo and type only: no photography, so nothing implies completed work.
 */
export const alt = "Nseya Group Construction: Consultancy, ETABLIX and Construction, Birmingham";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const asset = (...p: string[]) => readFile(path.join(process.cwd(), ...p));

export default async function OpengraphImage() {
  const [logo, plex400, plex600] = await Promise.all([
    asset("public", "brand", "nseya-group-logo-on-dark.png"),
    asset("node_modules", "@fontsource", "ibm-plex-sans", "files", "ibm-plex-sans-latin-400-normal.woff"),
    asset("node_modules", "@fontsource", "ibm-plex-sans", "files", "ibm-plex-sans-latin-600-normal.woff"),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0E2A3B",
          color: "#FFFFFF",
          padding: "72px 80px",
          fontFamily: "IBM Plex Sans",
        }}
      >
        <img src={logoSrc} width={480} height={179} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 68, fontWeight: 600, lineHeight: 1.1 }}>Build with certainty</div>
          <div style={{ fontSize: 32, color: "#E6E8EA", marginTop: 20 }}>
            Consultancy · ETABLIX site services · Construction
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 28, color: "#E6E8EA" }}>
          <div style={{ width: 56, height: 6, background: "#1BA996", marginRight: 20 }} />
          www.nseyagroup.com · Birmingham
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "IBM Plex Sans", data: plex400, weight: 400, style: "normal" },
        { name: "IBM Plex Sans", data: plex600, weight: 600, style: "normal" },
      ],
    },
  );
}
