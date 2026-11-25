// Static review snapshot of all Phase 1 pages (forms off). Usage: start the site on :3200, then
// node scripts/snapshot.mjs <out-dir> <repo-root>
import { mkdirSync, writeFileSync, copyFileSync, readdirSync } from "node:fs";
const BASE = "http://localhost:3200";
const OUT = process.argv[2];
const ROOT = process.argv[3];
mkdirSync(`${OUT}/media`, { recursive: true });
mkdirSync(`${OUT}/downloads`, { recursive: true });
const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
const fromSitemap = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const vacancyApply = fromSitemap.filter((p) => /^\/careers\/vacancies\/[^/]+$/.test(p)).map((p) => `${p}/apply`);
const paths = [...new Set([...fromSitemap, ...vacancyApply, "/careers/apply", "/suppliers/account"])];
const fileFor = (p) => (p === "/" ? "home.html" : p.slice(1).replace(/\//g, "-") + ".html");
const known = new Set(paths);
const fonts = new Set();
let css = "";
const cssSeen = new Set();

const fix = (html) => html.replace(/(href|action)="(\/[^"]*)"/g, (m, attr, url) => {
  if (url.startsWith("/_next/")) return m;
  if (url.startsWith("/downloads/")) return `${attr}="${url.slice(1)}"`;
  const [pathq, hash] = url.split("#");
  const path = pathq.split("?")[0].replace(/\/$/, "") || "/";
  if (known.has(path)) return `${attr}="${fileFor(path)}${hash ? "#" + hash : ""}"`;
  return `${attr}="#"`;
});

const enhance = `<script>
(function(){
  var t=document.querySelector('.menu-toggle'),n=document.getElementById('main-nav');
  if(t&&n)t.addEventListener('click',function(){var o=n.getAttribute('data-open')==='true';n.setAttribute('data-open',String(!o));t.setAttribute('aria-expanded',String(!o));t.textContent=o?'Menu':'Close';});
  var h=document.querySelector('.site-header');
  addEventListener('scroll',function(){h&&h.setAttribute('data-scrolled',String(scrollY>24));},{passive:true});
  document.querySelectorAll('form').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();var p=f.querySelector('.preview-note');if(!p){p=document.createElement('p');p.className='notice preview-note';p.setAttribute('role','status');p.textContent='Preview only: forms are switched off in this snapshot. On the real site this sends your form and shows a reference number.';f.prepend(p);}p.scrollIntoView({block:'center'});});});
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
    document.documentElement.classList.add('js');
    document.querySelectorAll('.draw-in [data-draw]').forEach(function(el){try{el.style.setProperty('--len',Math.ceil(el.getTotalLength()));}catch(e){}});
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var el=e.target;if(el.matches('[data-reveal]'))el.dataset.shown='true';if(el.matches('.draw-in'))el.dataset.drawn='true';io.unobserve(el);});},{threshold:0.1});
    document.querySelectorAll('[data-reveal],.draw-in').forEach(function(el){io.observe(el);});
  }
})();
</script>`;
const banner = `<div class="preview-banner" role="note">Preview snapshot of the Phase 1 site, ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}. Forms and sign-in are switched off here.</div>`;

for (const p of paths) {
  let html = await (await fetch(BASE + p)).text();
  for (const m of html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)) {
    if (cssSeen.has(m[1])) continue;
    cssSeen.add(m[1]);
    let c = await (await fetch(BASE + m[1])).text();
    c = c.replace(/url\((?:\.\.\/)*(?:\/_next\/static\/)?media\/([^)]+)\)/g, (_, f) => { fonts.add(f); return `url(media/${f})`; });
    css += c + "\n";
  }
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "Nseya Group";
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "";
  let body = (html.match(/<body[^>]*>([\s\S]*)<\/body>/) || [])[1] || "";
  body = body.replace(/<script\b[\s\S]*?<\/script>/g, "").replace(/<link[^>]*>/g, "");
  body = fix(body)
    // next/image: point at the original file and drop the optimiser srcset
    .replace(/\ssrcSet="[^"]*"/gi, "")
    .replace(/src="\/_next\/image\?url=([^&"]+)[^"]*"/g, (_, u) => `src="${decodeURIComponent(u).replace(/^\//, "")}"`);
  const headBits = `<title>${p === "/" ? "Nseya Group Website" : title}</title>\n<meta name="description" content="${desc}">\n<link rel="stylesheet" href="site.css">`;
  const content = `<div data-company="group" class="snapshot-body">${banner}${body}</div>${enhance}`;
  const doc = p === "/" ? `${headBits}\n${content}` : `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${headBits}</head><body data-company="group">${content}</body></html>`;
  if (p === "/") {
    writeFileSync(`${OUT}/index.html`, doc);
    writeFileSync(`${OUT}/home.html`, `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${headBits}</head><body data-company="group">${content}</body></html>`);
  } else writeFileSync(`${OUT}/${fileFor(p)}`, doc);
}
for (const f of fonts) {
  const r = await fetch(`${BASE}/_next/static/media/${f}`);
  writeFileSync(`${OUT}/media/${f}`, Buffer.from(await r.arrayBuffer()));
}
css += `\n:root{color-scheme:light}html,body{background:#fff;color:#0e2a3b}body{margin:0;font-family:"IBM Plex Sans",system-ui,sans-serif;font-size:var(--fs-body)}.preview-banner{background:#f2a20c;color:#0e2a3b;font:500 .8125rem/1.4 "IBM Plex Mono",monospace;padding:8px max(16px,env(safe-area-inset-left,0px));text-align:center}.cookie-banner{display:none}`;
writeFileSync(`${OUT}/site.css`, css);
mkdirSync(`${OUT}/brand`, { recursive: true });
for (const f of readdirSync(`${ROOT}/public/brand`)) copyFileSync(`${ROOT}/public/brand/${f}`, `${OUT}/brand/${f}`);
for (const f of readdirSync(`${ROOT}/public/downloads`)) copyFileSync(`${ROOT}/public/downloads/${f}`, `${OUT}/downloads/${f}`);
console.log("pages", paths.length, "fonts", fonts.size, "css", css.length);
