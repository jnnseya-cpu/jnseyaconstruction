import Link from "next/link";
import type { ReactNode } from "react";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { JsonLd } from "@/components/JsonLd";
import { getSectors } from "@/lib/cms";
import { serviceSchema } from "@/lib/schema";
import type { Company, SectorId, Service } from "@/content/types";
import styles from "./CompanyBlocks.module.css";

/** External link to a separate website, labelled so visitors know they are leaving. */
export function ExternalLink({ href, children, className = "link-arrow link-external" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} className={className} rel="noopener">
      {children}
      <span className="visually-hidden"> (separate website)</span>
    </a>
  );
}

/** "On this page" list of service anchors (PG-03: each service has an anchor link). */
export function ServiceIndex({ services, title = "Services" }: { services: Service[]; title?: string }) {
  return (
    <nav aria-label={`${title} on this page`} className={styles.index}>
      <p className="label">{title}</p>
      <ol>
        {services.map((s, i) => (
          <li key={s.slug}>
            <a href={`#${s.slug}`}>
              <span className="mono" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              {s.name}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export interface ServiceDetail {
  /** The problem the client has, in one or two sentences. */
  problem: string;
  /** What we do. */
  whatWeDo: string[];
  /** Typical deliverables. */
  deliverables: string[];
}

export function ServiceBlock({ service, detail, index, company, extra }: { service: Service; detail: ServiceDetail; index: number; company: Company; extra?: ReactNode }) {
  const sectors = getSectors().filter((s) => service.sectors.includes(s.id));
  return (
    <article id={service.slug} className={styles.service} aria-labelledby={`${service.slug}-title`} data-reveal>
      <div className={styles.serviceHead}>
        <span className={styles.serviceNo} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        <div>
          <h3 id={`${service.slug}-title`}>
            {service.name}{" "}
            <a href={`#${service.slug}`} className={styles.anchor} aria-label={`Link to ${service.name}`}>#</a>
          </h3>
          <p className="muted">{service.summary}</p>
        </div>
      </div>
      <div className={styles.serviceBody}>
        <div>
          <h4 className={styles.subhead}>The problem</h4>
          <p>{detail.problem}</p>
          <h4 className={styles.subhead}>What we do</h4>
          <ul>{detail.whatWeDo.map((w) => <li key={w}>{w}</li>)}</ul>
        </div>
        <div>
          <h4 className={styles.subhead}>What you get</h4>
          <ul className={styles.ticks}>{detail.deliverables.map((w) => <li key={w}>{w}</li>)}</ul>
          <h4 className={styles.subhead}>Sectors</h4>
          <p className={styles.tags}>{sectors.map((s) => <span className="tag" key={s.id}>{s.name}</span>)}</p>
        </div>
      </div>
      {extra}
      <JsonLd data={serviceSchema(service.name, service.summary, company.name, `${company.path}#${service.slug}`)} />
    </article>
  );
}

export function SectorsServed({ ids, notes }: { ids: SectorId[]; notes?: Partial<Record<SectorId, string>> }) {
  const sectors = getSectors().filter((s) => ids.includes(s.id));
  return (
    <ul className={styles.sectors}>
      {sectors.map((s) => (
        <li key={s.id}>
          <h3>{s.name}</h3>
          <p>{notes?.[s.id] ?? s.summary}</p>
        </li>
      ))}
    </ul>
  );
}

/** Capability statement download card (section 7a: one designed PDF per company). */
export function CapabilityCard({ company }: { company: Company }) {
  const href = `/downloads/${company.id}-capability-statement.pdf`;
  return (
    <div className="doc-card">
      <span className="doc-card__icon" aria-hidden="true">PDF</span>
      <div>
        <h3>{company.name} capability statement</h3>
        <p className="meta" style={{ margin: 0 }}>1 page · Edition December 2026</p>
      </div>
      <a className="btn btn--ghost" href={href} download>
        Download<span className="visually-hidden"> {company.name} capability statement (PDF)</span>
      </a>
    </div>
  );
}

export function EnquirySection({ company, title, intro, aside }: { company: Company; title: string; intro: ReactNode; aside?: ReactNode }) {
  return (
    <section className="section section--concrete" aria-labelledby="enquiry-title" id="enquiry">
      <div className="container grid">
        <div className="span-5">
          <p className="label">Send an enquiry</p>
          <h2 id="enquiry-title">{title}</h2>
          <div className="muted">{intro}</div>
          <p className="small muted">We reply to every enquiry within one working day.</p>
          {aside}
        </div>
        <div className="span-7">
          <EnquiryForm company={company.id} sourcePage={company.path} />
        </div>
      </div>
    </section>
  );
}

export function CrossLinks() {
  return (
    <section className="section section--tight section--rule" aria-label="Work with the group">
      <div className="container cards cards--2">
        <Link href="/suppliers" className="card card--link">
          <p className="label" style={{ margin: 0 }}>Subcontractors and suppliers</p>
          <h3>Register to work with us</h3>
          <p>About 80% of our work is delivered through a vetted supply chain, paid on 30-day terms.</p>
          <span className="card__foot link-arrow">Supplier registration</span>
        </Link>
        <Link href="/careers" className="card card--link">
          <p className="label" style={{ margin: 0 }}>Careers</p>
          <h3>Graduate Academy, apprenticeships and experienced roles</h3>
          <p>Every starter gets a mentor, a CSCS card and site safety training.</p>
          <span className="card__foot link-arrow">Careers</span>
        </Link>
      </div>
    </section>
  );
}
