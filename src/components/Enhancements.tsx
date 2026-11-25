"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Motion system (section 7a): scroll reveals, self-drawing SVG lines and
 * number count-ups. Content is fully visible without JavaScript, and all
 * motion switches off under prefers-reduced-motion.
 */
export function Enhancements() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    root.classList.add("js");

    // Measure path lengths for draw-in drawings.
    document.querySelectorAll<SVGGeometryElement>(".draw-in [data-draw]").forEach((el) => {
      try {
        const len = Math.ceil(el.getTotalLength?.() ?? 2000);
        el.style.setProperty("--len", String(len));
      } catch {
        /* non-geometry element */
      }
    });

    const countUp = (el: HTMLElement) => {
      const target = Number(el.dataset.count);
      if (!Number.isFinite(target) || reduce) return;
      const text = el.textContent ?? "";
      const suffix = text.replace(/^[\d.,\s£]+/, "");
      const prefix = text.startsWith("£") ? "£" : "";
      const start = performance.now();
      const dur = 1200;
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = `${prefix}${Math.round(target * eased).toLocaleString("en-GB")}${suffix}`;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          if (el.matches("[data-reveal]")) el.dataset.shown = "true";
          if (el.matches(".draw-in")) el.dataset.drawn = "true";
          el.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
          if (el.matches("[data-count]")) countUp(el);
          io.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );
    document.querySelectorAll("[data-reveal], .draw-in").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
