"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { HexMark } from "./Logo";

type CompanyKey = "group" | "consultancy" | "etablix" | "construction";

const companyFromPath = (p: string): CompanyKey =>
  p.startsWith("/consultancy") ? "consultancy" : p.startsWith("/etablix") ? "etablix" : p.startsWith("/construction") ? "construction" : "group";

const switcherLinks: { key: CompanyKey; href: string; label: string; colour: string }[] = [
  { key: "group", href: "/", label: "Nseya Group", colour: "var(--teal)" },
  { key: "consultancy", href: "/consultancy", label: "Nseya Consultancy", colour: "var(--teal)" },
  { key: "etablix", href: "/etablix", label: "ETABLIX", colour: "var(--amber)" },
  { key: "construction", href: "/construction", label: "Nseya Construction", colour: "var(--cobalt-light)" },
];

const mainNav = [
  { href: "/about", label: "About" },
  { href: "/consultancy", label: "Consultancy", dot: "var(--teal)" },
  { href: "/etablix", label: "ETABLIX", dot: "var(--amber)" },
  { href: "/construction", label: "Construction", dot: "var(--cobalt-light)" },
  { href: "/careers", label: "Careers" },
  { href: "/suppliers", label: "Suppliers" },
];

const buyersMenu = [
  { href: "/services", label: "All services", note: "By company and sector" },
  { href: "/suppliers/code-and-policies", label: "Policies and supplier code", note: "Versions and review dates" },
  { href: "/about#company-details", label: "Company details", note: "Legal entity, ICO, registered office" },
  { href: "/contact?type=tender", label: "Tender or framework enquiry", note: "Reply within one working day" },
];

export function Header() {
  const pathname = usePathname() || "/";
  const company = companyFromPath(pathname);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const buyersRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    setOpen(false);
    buyersRef.current?.removeAttribute("open");
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buyersRef.current?.removeAttribute("open");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isCurrent = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <>
      <div className="switcher" data-company={company}>
        <nav className="container switcher__inner" aria-label="Group companies">
          <span className="switcher__label">Group</span>
          {switcherLinks.map((l) => (
            <Link key={l.key} href={l.href} aria-current={company === l.key ? "true" : undefined}>
              <span className="nav__dot" style={{ background: l.colour }} aria-hidden="true" />
              {l.label}
            </Link>
          ))}
          <a href="https://etablix.com" rel="noopener" style={{ marginLeft: "auto" }}>
            etablix.com<span aria-hidden="true"> ↗</span>
            <span className="visually-hidden"> (separate website)</span>
          </a>
        </nav>
      </div>
      <header className="site-header" data-company={company} data-scrolled={scrolled}>
        <div className="container site-header__inner">
          <Link href="/" className="brand">
            <HexMark letter={company === "etablix" ? "E" : "N"} />
            <span className="brand__text">
              <span className="brand__name">Nseya Group</span>
              <span className="brand__sub">Construction</span>
              <span className="visually-hidden">, home</span>
            </span>
          </Link>
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="main-nav"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "Close" : "Menu"}
          </button>
          <nav id="main-nav" className="nav" aria-label="Main" data-open={open}>
            <ul className="nav__list">
              {mainNav.map((n) => (
                <li key={n.href}>
                  <Link className="nav__link" href={n.href} aria-current={isCurrent(n.href) ? "page" : undefined} data-company-link={n.dot ? "" : undefined}>
                    {n.dot && <span className="nav__dot" style={{ background: n.dot }} aria-hidden="true" />}
                    {n.label}
                  </Link>
                </li>
              ))}
              <li>
                <details className="buyers-menu" ref={buyersRef}>
                  <summary className="nav__link">For buyers</summary>
                  <div className="buyers-menu__panel">
                    {buyersMenu.map((b) => (
                      <Link key={b.href} href={b.href}>
                        {b.label}
                        <span className="mono">{b.note}</span>
                      </Link>
                    ))}
                  </div>
                </details>
              </li>
              <li className="nav__cta">
                <Link className="btn" href="/contact">Contact</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}
