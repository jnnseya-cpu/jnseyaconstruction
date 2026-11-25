import Link from "next/link";
import { getLegalEntity } from "@/lib/cms";
import { contact, group } from "@/content/settings";
import type { CompanyId } from "@/content/types";
import Image from "next/image";
import { NewsletterForm } from "./forms/NewsletterForm";

/** Legal-entity block: mandatory on every page (Companies Act 2006, section 3 of the spec). */
export function LegalEntityBlock({ company = "group" }: { company?: CompanyId }) {
  const e = getLegalEntity(company);
  return (
    <div className="legal-entity">
      <p>
        <strong>{e.legalName}</strong>, Company number {e.companyNumber}
        {e.tradingAs ? ` (trading as ${e.tradingAs})` : ""}. {e.placeOfRegistration}.
      </p>
      <p>
        Registered office: {e.registeredOffice}.{e.icoRegistration ? ` ICO registration ${e.icoRegistration}.` : ""}
      </p>
    </div>
  );
}

const columns: { title: string; links: { href: string; label: string; external?: boolean }[] }[] = [
  {
    title: "Companies",
    links: [
      { href: "/consultancy", label: "Nseya Consultancy" },
      { href: "/etablix", label: "ETABLIX" },
      { href: "https://etablix.com", label: "etablix.com", external: true },
      { href: "/construction", label: "Nseya Construction" },
      { href: "/services", label: "All services" },
    ],
  },
  {
    title: "Work with us",
    links: [
      { href: "/careers", label: "Careers" },
      { href: "/careers/graduate-academy", label: "Graduate Academy" },
      { href: "/careers/vacancies", label: "Vacancies" },
      { href: "/suppliers", label: "Suppliers and subcontractors" },
      { href: "/suppliers/account", label: "Supplier sign in" },
    ],
  },
  {
    title: "For buyers",
    links: [
      { href: "/about", label: "About the group" },
      { href: "/about#company-details", label: "Company details" },
      { href: "/suppliers/code-and-policies", label: "Policies and supplier code" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy notice" },
      { href: "/cookies", label: "Cookies" },
      { href: "/terms", label: "Terms of use" },
      { href: "/accessibility", label: "Accessibility statement" },
      { href: "/modern-slavery", label: "Modern slavery statement" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="site-footer drawing-grid" data-company="group">
      <div className="container">
        <div className="site-footer__top">
          <div>
            <Link href="/" className="brand">
              <Image src="/brand/nseya-group-logo-on-dark.png" alt="Nseya Group Construction, home" width={1200} height={447} className="brand__logo" sizes="220px" />
            </Link>
            <p style={{ marginTop: 16 }}>Birmingham, West Midlands.</p>
            {contact.email && (
              <p style={{ margin: 0 }}>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </p>
            )}
            {contact.phone && (
              <p style={{ margin: 0 }}>
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a>
              </p>
            )}
          </div>
          {columns.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h2>{c.title}</h2>
              <ul>
                {c.links.map((l) => (
                  <li key={l.href}>
                    {l.external ? (
                      <a href={l.href} rel="noopener">
                        {l.label} <span aria-hidden="true">↗</span>
                        <span className="visually-hidden"> (separate website)</span>
                      </a>
                    ) : (
                      <Link href={l.href}>{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div>
            <h2>Field notes</h2>
            <NewsletterForm />
          </div>
        </div>
        <p className="footer-line">
          <strong>{group.promise}</strong> <span aria-hidden="true">—</span> Nseya Consultancy · ETABLIX · Nseya Construction
        </p>
        <LegalEntityBlock />
      </div>
    </footer>
  );
}
