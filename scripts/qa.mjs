// Page QA: axe (WCAG 2.2 AA), no horizontal scroll at 320px, legal footer, unique titles.
// Usage: BASE=http://localhost:3000 node scripts/qa.mjs [--shots dir]
import { readFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { syllable } from "syllable";
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

/** Flesch reading ease, with the `syllable` English syllable counter. */
function flesch(text) {
  const sentences = text
    .split(/\n+/)
    .flatMap((l) => l.split(/[.!?:;]+/))
    .map((x) => x.trim())
    .filter((x) => x.split(/\s+/).length >= 3);
  const words = sentences.join(" ").match(/[A-Za-z][A-Za-z'-]*/g) ?? [];
  if (words.length < 60) return null;
  const s = words.reduce((n, w) => n + Math.max(1, syllable(w)), 0);
  return 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (s / words.length);
}

const browser = await chromium.launch();
const titles = new Map();
const easeScores = [];
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
      // Spec 7b: banned words and reading ease, on the page's own text (not header/footer).
      const text = await page.evaluate(() => {
        const m = document.querySelector("main")?.cloneNode(true);
        if (!m) return "";
        m.querySelectorAll("script, style, svg, .breadcrumb, .label, table, form, nav").forEach((e) => e.remove());
        return m.innerText ?? m.textContent ?? "";
      });
      const banned = ["world-class", "leading", "cutting-edge", "solutions", "innovative", "seamless", "passionate", "synergy", "one-stop shop", "unlock", "elevate", "game-changer", "bespoke", "holistic", "empower"];
      for (const w of banned) if (new RegExp(`\\b${w}\\b`, "i").test(text)) problems.push(`banned word: ${w}`);
      const ease = flesch(text);
      // Reported, not failed: the approved copy deck is the source text; Justin decides on rewrites.
      if (ease !== null) easeScores.push([p, Math.round(ease)]);
      await page.addScriptTag({ content: axeSource });
      const result = await page.evaluate(async () =>
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
console.log("\nReading ease (spec 7b target 50+):");
for (const [p, e] of easeScores) console.log(`  ${e >= 50 ? "ok  " : "low "} ${String(e).padStart(3)}  ${p}`);
console.log(`\n${all.length} pages, ${failures} with problems`);
process.exit(failures ? 1 : 0);
