/**
 * Capability statement PDFs, one per company (section 7a, P1).
 * Renders print-styled HTML with Playwright's Chromium to
 * public/downloads/<company>-capability-statement.pdf.
 *
 * Run: npm run pdfs
 * Copy is honest by design: no trading history, turnover, staff numbers or
 * completed projects. Edit the COMPANIES object, re-run, and commit the PDFs.
 * Keep the legal-entity text in step with src/content/settings.ts.
 */
import { readFileSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "public", "downloads");

const LEGAL =
  "JNN GLOBAL LTD, Company number 15405437 (trading as Etablix and JNseya Construction and Consultants). Registered in England and Wales. Registered office: 30 Fairford Road, Kingstanding, Birmingham B44 8DJ. ICO registration C2089949.";
const EDITION = "Edition December 2026";

const COMPANIES = {
  consultancy: {
    name: "Nseya Consultancy",
    accent: "#1BA996",
    accentText: "#138172",
    mark: "N",
    dwg: "NGC-CS-C01",
    intro:
      "Nseya Consultancy takes land from appraisal and pre-planning, through planning and grid connection, to handover. Every report shows the programme, the cost and the risks from one set of project data.",
    services: [
      ["Land appraisal and acquisition", "Land value, viability, site finding and due diligence."],
      ["Planning, from pre-planning", "Pre-application advice to permission and conditions."],
      ["Grid connections, end to end", "Application, offer, wayleaves and milestones to energisation."],
      ["Development and project management", "One accountable lead from appraisal to handover."],
      ["Cost management", "Cost plans, value engineering, valuations and final accounts."],
      ["Project controls", "Programmes, earned value, risk and change, live in CONSTRUX."],
      ["Feasibility and BIM", "Options and funding route; ISO 19650 information management."],
      ["Building safety and compliance", "Gateway 2 and 3 readiness, golden thread, CDM client advice."],
      ["Tender and procurement", "Strategy, tender packs and evaluation under the Procurement Act."],
      ["Bid-On for contractors", "Prequalification, framework and tender packs for SME contractors."],
    ],
    sectors: ["Public estate", "Social housing", "Energy and grid", "Data centres", "Commercial and mixed-use", "Residential"],
    how: [
      "Fixed fee, day rate or monthly retainer, quoted in writing.",
      "A named lead on every commission.",
      "Reports produced from CONSTRUX, the group's project system.",
    ],
    contactPath: "/consultancy#enquiry",
  },
  etablix: {
    name: "ETABLIX",
    accent: "#F2A20C",
    accentText: "#9A6200",
    mark: "E",
    logo: "public/brand/etablix-logo-on-dark.png",
    dwg: "NGC-CS-E01",
    intro:
      "ETABLIX plans, sets up, runs and removes the temporary facilities a construction project needs: site cabins, welfare, security, cleaning and, on the largest projects, workforce villages. Full details are on etablix.com.",
    services: [
      ["TSLM", "The ETABLIX lifecycle method for temporary site services: compound, cabins, welfare, security, cleaning and utilities."],
      ["WVLM", "The same lifecycle applied to workforce villages: beds, meals, laundry and transport, sized to the workforce peak."],
      ["Plan", "Site services sized to the programme and workforce curve before anything is ordered."],
      ["Establish", "Delivered, connected and commissioned, ready for the first shift."],
      ["Operate", "Run day to day and scaled with the workforce, with a monthly service report."],
      ["Remove", "Phased removal, disconnection records and reinstatement of the ground."],
    ],
    sectors: ["Energy and grid", "Data centres", "Public estate", "Commercial and mixed-use", "Social housing"],
    how: [
      "One accountable team from plan to removal.",
      "21 site-services trades managed through a vetted supply chain.",
      "Book a Site Systems Diagnostic call to review your site set-up.",
    ],
    contactPath: "/etablix#diagnostic",
    extra: "etablix.com",
  },
  construction: {
    name: "Nseya Construction",
    accent: "#1E5AA8",
    accentText: "#1E5AA8",
    onDark: "#8DB4EA",
    mark: "N",
    dwg: "NGC-CS-K01",
    intro:
      "Nseya Construction takes sites from pre-planning and grid connection to handover, in two markets: buildings, and power and digital. Our managers and supervisors lead every job.",
    services: [
      ["Land and planning, from pre-planning", "With Nseya Consultancy, appraisal to permission and conditions."],
      ["Grid connection works, end to end", "Route, substation civils and connection to energisation."],
      ["Site enabling and infrastructure", "Clearance, remediation, earthworks, roads, drainage, utilities."],
      ["Buildings", "Extensions, housing, commercial, mixed-use and public estate."],
      ["Substation, generation and data-centre civils", "Foundations, bunds, trenches, control buildings; data-centre power and cooling."],
      ["33kV and 132kV cable civils", "Trenching, ducting, joint bays and HDD crossings."],
      ["M&E, HVAC and building services", "Installation, testing and commissioning."],
      ["BIM-led delivery", "ISO 19650: federated models, clash review, 4D, digital handover."],
    ],
    sectors: ["Public estate", "Social housing", "Energy and grid", "Data centres", "Commercial and mixed-use", "Residential"],
    how: [
      "Our own managers lead every job, as principal contractor under CDM 2015.",
      "About 80% of the work by vetted subcontractors, paid in 30 days; grid works with NERS-accredited partners.",
      "Every subcontractor works in CONSTRUX or VERYX, whichever the project uses.",
    ],
    contactPath: "/construction#enquiry",
  },
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

async function fontFace(weight, family, pkg) {
  const file = path.join(root, "node_modules", "@fontsource", pkg, "files", `${pkg}-latin-${weight}-normal.woff2`);
  try {
    const b64 = (await readFile(file)).toString("base64");
    return `@font-face{font-family:"${family}";font-weight:${weight};src:url(data:font/woff2;base64,${b64}) format("woff2");}`;
  } catch {
    return "";
  }
}

function html(c, fonts, site) {
  // Group mark until each company's own logo file is supplied (then set `logo` on the company).
  const hex = `<img src="data:image/png;base64,${readFileSync("public/brand/nseya-group-mark-on-dark.png").toString("base64")}" alt="" style="height:10mm;width:auto">`;
  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>${esc(c.name)} capability statement</title><style>
${fonts}
@page{size:A4;margin:0}
*{box-sizing:border-box}
body{margin:0;font-family:"IBM Plex Sans",sans-serif;color:#0E2A3B;font-size:10pt;line-height:1.42;font-variant-numeric:tabular-nums}
.page{width:210mm;height:297mm;position:relative;overflow:hidden;page-break-after:always}
.page:last-child{page-break-after:auto}
.mono{font-family:"IBM Plex Mono",monospace}
header{background:#0E2A3B;color:#fff;padding:10mm 16mm 8mm;position:relative;
background-image:linear-gradient(to right,rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,.05) 1px,transparent 1px);background-size:8mm 8mm}
header::after{content:"";position:absolute;left:0;right:0;bottom:0;height:2mm;background:${c.accent}}
.brand{display:flex;align-items:center;gap:4mm}
.brand small{display:block;font-family:"IBM Plex Mono",monospace;font-size:7pt;letter-spacing:.08em;text-transform:uppercase;opacity:.75}
.brand b{font-size:12pt;font-weight:600}
.label{font-family:"IBM Plex Mono",monospace;font-size:7.5pt;letter-spacing:.08em;text-transform:uppercase;color:${c.onDark ?? c.accent}}
h1{font-size:26pt;line-height:1.05;margin:2mm 0 3mm;font-weight:600;letter-spacing:-.01em}
.intro{font-size:11pt;max-width:150mm;color:rgba(255,255,255,.88);margin:0}
.meta{display:flex;gap:8mm;margin-top:5mm;font-family:"IBM Plex Mono",monospace;font-size:7.5pt;letter-spacing:.06em;text-transform:uppercase;opacity:.8}
main{padding:6mm 16mm 0}
h2{font-size:13pt;margin:0 0 4mm;font-weight:600}
h2 .label{display:block;color:${c.accentText};margin-bottom:1mm}
.svc{display:grid;grid-template-columns:1fr 1fr;gap:0 8mm;border-top:.6mm solid #0E2A3B}
.svc div{border-bottom:.25mm solid #C9CED2;padding:1.5mm 0}
.svc b{display:block;font-size:10.5pt;font-weight:600}
.svc span{color:#47535B;font-size:9pt}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:10mm;margin-top:5mm}
ul{margin:0;padding-left:4.5mm}li{margin-bottom:1.5mm}
.tags{display:flex;flex-wrap:wrap;gap:2mm}
.tags span{font-family:"IBM Plex Mono",monospace;font-size:7.5pt;text-transform:uppercase;letter-spacing:.04em;border:.25mm solid #47535B;padding:.8mm 2mm;color:#47535B}
.box{border-left:1mm solid ${c.accent};background:#F3F4F5;padding:3mm 5mm;margin-top:5mm;font-size:9pt}
.box p{margin:0 0 1.5mm}
footer{position:absolute;left:16mm;right:16mm;bottom:9mm;background:#fff;border-top:.25mm solid #C9CED2;padding-top:3mm;display:grid;grid-template-columns:1fr auto;gap:6mm;font-size:7pt;color:#47535B}
.tb{border:.3mm solid #0E2A3B;font-family:"IBM Plex Mono",monospace;font-size:6.5pt;padding:1.5mm 2.5mm;text-transform:uppercase;letter-spacing:.05em;color:#0E2A3B;text-align:right}
</style></head><body>
<section class="page">
<header>
<div class="brand">${c.logo ? `<img src="data:image/png;base64,${readFileSync(c.logo).toString("base64")}" alt="${esc(c.name)}" style="height:15mm;width:auto"><div><small>A Nseya Group Construction company</small></div>` : `${hex}<div><small>Nseya Group Construction</small><b>${esc(c.name)}</b></div>`}</div>
<p class="label" style="margin-top:7mm">Capability statement</p>
<h1>${esc(c.name)}</h1>
<p class="intro">${esc(c.intro)}</p>
<div class="meta"><span>Birmingham, West Midlands</span><span>Trading from 2027</span><span>${EDITION}</span></div>
</header>
<main>
<h2><span class="label">What we do</span>Services</h2>
<div class="svc">${c.services.map(([n, d]) => `<div><b>${esc(n)}</b><span>${esc(d)}</span></div>`).join("")}</div>
<div class="cols">
<div><h2><span class="label">Who for</span>Sectors</h2><div class="tags">${c.sectors.map((s) => `<span>${esc(s)}</span>`).join("")}</div></div>
<div><h2><span class="label">How</span>How we work</h2><ul>${c.how.map((h) => `<li>${esc(h)}</li>`).join("")}</ul></div>
</div>
<div class="box">
<p><b>Part of Nseya Group Construction:</b> Nseya Consultancy, ETABLIX and Nseya Construction. Trading from 2027; this statement describes the services we offer, not past company projects.</p>
<p>Contact us through the enquiry form at <b>${esc(site)}${esc(c.contactPath)}</b>. We reply within one working day.${c.extra ? ` Full ETABLIX details: <b>etablix.com</b>.` : ""}</p>
</div>
</main>
<footer><div>${esc(LEGAL)}</div><div class="tb">${c.dwg}<br>${EDITION}</div></footer>
</section>
</body></html>`;
}

const fonts = (
  await Promise.all([
    fontFace(400, "IBM Plex Sans", "ibm-plex-sans"),
    fontFace(600, "IBM Plex Sans", "ibm-plex-sans"),
    fontFace(400, "IBM Plex Mono", "ibm-plex-mono"),
  ])
).join("\n");

const site = (process.env.SITE_URL ?? "the group website").replace(/^https?:\/\//, "").replace(/\/$/, "");
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  for (const [id, c] of Object.entries(COMPANIES)) {
    await page.setContent(html(c, fonts, site), { waitUntil: "load" });
    // The statement is one A4 page: stop if the content runs into the footer.
    const overlap = await page.evaluate(() => {
      const footer = document.querySelector("footer").getBoundingClientRect().top;
      const last = Math.max(...[...document.querySelectorAll("main *")].map((e) => e.getBoundingClientRect().bottom));
      return last - footer;
    });
    if (overlap > 0) throw new Error(`${c.name}: content runs ${Math.ceil(overlap)}px into the footer. Shorten the copy.`);
    const file = path.join(out, `${id}-capability-statement.pdf`);
    await page.pdf({ path: file, format: "A4", printBackground: true, preferCSSPageSize: true });
    console.log("Wrote", path.relative(root, file));
  }
} finally {
  await browser.close();
}
