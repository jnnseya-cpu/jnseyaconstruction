// Page QA: axe (WCAG 2.2 AA), no horizontal scroll at 320px, legal footer, unique titles.
// Usage: BASE=http://localhost:3000 node scripts/qa.mjs [--shots dir]
import { readFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const BASE = process.env.BASE ?? "http://localhost:3000";
const shotsIdx = process.argv.indexOf("--shots");
const shots = shotsIdx > -1 ? process.argv[shotsIdx + 1] : null;
if (shots) mkdirSync(shots, { recursive: true });

const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const extra = ["/suppliers/account", "/careers/apply", "/does-not-exist"];
const all = [...new Set([...paths, ...extra])];

const browser = await chromium.launch();
const titles = new Map();
let failures = 0;
for (const p of all) {
  const problems = [];
  for (const width of [320, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const res = await page.goto(BASE + p, { waitUntil: "networkidle" });
    if (width === 1280 && p !== "/does-not-exist" && res.status() !== 200) problems.push(`HTTP ${res.status()}`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 1) problems.push(`horizontal scroll ${overflow}px at ${width}px`);
    if (width === 1280) {
      const footer = await page.locator(".legal-entity").innerText().catch(() => "");
      if (!footer.includes("15405437") || !footer.includes("B44 8DJ")) problems.push("legal-entity footer missing");
      const title = await page.title();
      if (title.length > 60) problems.push(`title ${title.length} chars`);
      const desc = await page.locator('meta[name="description"]').getAttribute("content").catch(() => null);
      if (!desc) problems.push("no meta description");
      else if (desc.length > 155) problems.push(`description ${desc.length} chars`);
      if (titles.has(title) && p !== "/does-not-exist") problems.push(`duplicate title with ${titles.get(title)}`);
      titles.set(title, p);
      await page.addScriptTag({ content: axeSource });
      const result = await page.evaluate(async () =>
        // eslint-disable-next-line no-undef
        axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] } }),
      );
      for (const v of result.violations.filter((v) => ["serious", "critical"].includes(v.impact)))
        problems.push(`axe ${v.impact}: ${v.id} (${v.nodes.length}) e.g. ${v.nodes[0]?.target?.join(" ")}`);
    }
    if (shots) await page.screenshot({ path: `${shots}/${(p.replace(/\//g, "_") || "_home")}-${width}.png`, fullPage: true });
    await page.close();
  }
  if (problems.length) failures++;
  console.log(`${problems.length ? "✗" : "✓"} ${p}${problems.length ? "\n    " + problems.join("\n    ") : ""}`);
}
await browser.close();
console.log(`\n${all.length} pages, ${failures} with problems`);
process.exit(failures ? 1 : 0);
