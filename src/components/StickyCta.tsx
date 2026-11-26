"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Spec 7b rule 6: the page's primary action sticks to the bottom of the
 * screen on mobile. Copies the first primary button in the page hero, and
 * appears once that button has scrolled out of view.
 */
export function StickyCta() {
  const pathname = usePathname();
  const [cta, setCta] = useState<{ href: string; text: string; company: string } | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(false);
    const btn = document.querySelector<HTMLAnchorElement>(".hero a.btn:not(.btn--ghost)");
    if (!btn) {
      setCta(null);
      return;
    }
    setCta({
      href: btn.getAttribute("href") ?? "#",
      text: btn.textContent?.replace(/\s*↗\s*/, "").trim() ?? "",
      company: btn.closest("[data-company]")?.getAttribute("data-company") ?? "group",
    });
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(btn);
    return () => io.disconnect();
  }, [pathname]);

  if (!cta) return null;
  return (
    <div className="sticky-cta" data-show={show} aria-hidden={!show} data-company={cta.company}>
      <a className="btn" href={cta.href} tabIndex={show ? 0 : -1}>{cta.text}</a>
    </div>
  );
}
