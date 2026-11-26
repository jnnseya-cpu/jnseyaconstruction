import type { Metadata } from "next";
import Image from "next/image";
import { CapabilityCard, CrossLinks, ExternalLink, SectorsServed } from "@/components/company/CompanyBlocks";
import { CompanyDrawing } from "@/components/company/CompanyDrawing";
import { Commitments, Reasons } from "@/components/company/Promises";
import { DiagnosticForm } from "@/components/forms/DiagnosticForm";
import { JsonLd } from "@/components/JsonLd";
import { LifecycleTimeline } from "@/components/modules/LifecycleTimeline";
import { PageHero } from "@/components/PageHero";
import { getCompany, getServices } from "@/lib/cms";
import { serviceSchema } from "@/lib/schema";
import { etablixContent as c } from "./content";

/* Hero copy: Phase 1 copy deck, revision 1 (25 Nov 2026), ETABLIX. */

export const metadata: Metadata = {
  title: { absolute: "ETABLIX | Integrated site services and workforce villages" },
  description: "ETABLIX plans, sets up, runs and removes site cabins, welfare, security and workforce villages. A Nseya Group Construction company.",
  alternates: { canonical: "/etablix" },
};

export default function EtablixPage() {
  const company = getCompany("etablix");
  const site = company.externalSite!;
  const models = c.deliveryModels.filter((m) => m.confirmed);
  return (
    <div data-company="etablix">
      <PageHero
        crumbs={[{ name: "ETABLIX", href: "/etablix" }]}
        label="A Nseya Group Construction company"
        brand={
          <Image
            src="/brand/etablix-logo-on-dark.png"
            alt="ETABLIX, integrated site services"
            width={1200}
            height={265}
            priority
            sizes="(max-width: 600px) 80vw, 360px"
            style={{ width: "min(360px, 80vw)", height: "auto", marginBottom: 20 }}
          />
        }
        title="One contractor for everything that keeps a site running."
        lede="Cabins, welfare, security, cleaning, utilities, catering and workforce villages — planned, established, operated and removed by one accountable team."
        aside={<CompanyDrawing kind="etablix" />}
      >
        <p className="etx-cycle" aria-label="Plan, then establish, then operate, then remove">
          <span>Plan</span><span aria-hidden="true">→</span><span>Establish</span><span aria-hidden="true">→</span>
          <span>Operate</span><span aria-hidden="true">→</span><span>Remove</span>
        </p>
        <p>ETABLIX is a Nseya Group Construction company with its own website.</p>
        <div className="btn-row" style={{ marginTop: 24 }}>
          <ExternalLink href={site.url} className="btn">
            {site.label} <span aria-hidden="true">↗</span>
          </ExternalLink>
          <a className="btn btn--ghost" href="#diagnostic">Book a Site Systems Diagnostic call</a>
        </div>
        <p className="hero__meta">
          <span>This page is a short overview</span>
          <span>Full details, trades and supplier registration on etablix.com</span>
        </p>
      </PageHero>

      <section className="section" aria-labelledby="methods-title">
        <div className="container grid">
          <div className="span-4">
            <p className="label">Two methods</p>
            <h2 id="methods-title">TSLM and WVLM</h2>
            <p className="muted">Both follow the same four-phase lifecycle, so one team stays accountable from plan to removal.</p>
          </div>
          <div className="span-8 cards cards--2">
            {c.methods.map((m) => (
              <div className="card" key={m.code} id={m.anchor} data-reveal style={{ borderTop: "6px solid var(--accent)" }}>
                <span className="mono" style={{ fontSize: "2rem", fontWeight: 500, color: "var(--accent-text)", lineHeight: 1 }}>{m.code}</span>
                <p>{m.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--dark drawing-grid" aria-labelledby="lifecycle-title">
        <div className="container">
          <p className="label">Lifecycle</p>
          <h2 id="lifecycle-title">Plan, Establish, Operate, Remove</h2>
          <p className="lede" style={{ marginBottom: 48 }}>What ETABLIX does at each phase of a site&apos;s life.</p>
          <LifecycleTimeline phases={c.lifecycle} />
        </div>
      </section>

      <section className="section" aria-labelledby="models-title">
        <div className="container grid">
          <div className="span-4">
            <p className="label">Delivery models</p>
            <h2 id="models-title">How ETABLIX is appointed</h2>
            <p className="muted">ETABLIX has three delivery models. The full description of each is on etablix.com.</p>
          </div>
          <div className="span-8">
            <div className="table-wrap">
              <table className="table">
                <caption className="visually-hidden">ETABLIX delivery models and whether each is open for appointment</caption>
                <thead>
                  <tr><th scope="col">Model</th><th scope="col">What it means</th><th scope="col">Status</th></tr>
                </thead>
                <tbody>
                  {models.map((m) => (
                    <tr key={m.name}>
                      <th scope="row">{m.name}</th>
                      <td>{m.summary}</td>
                      <td>{m.status === "not-open" ? <span className="tag tag--warn">Not open for appointment</span> : <span className="tag tag--accent">Open</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ marginTop: 16 }}>
              <ExternalLink href={`${site.url}`}>Read about all three delivery models on etablix.com</ExternalLink>
            </p>
          </div>
        </div>
      </section>

      <section className="section section--concrete" aria-labelledby="trades-title">
        <div className="container grid">
          <div className="span-6">
            <p className="label">What ETABLIX manages</p>
            <h2 id="trades-title">Site-services trades</h2>
            <p className="muted">ETABLIX manages 21 site-services trades through a vetted supply chain. Examples include:</p>
            <ul style={{ columns: 2, columnGap: 32 }}>
              {c.tradeExamples.map((t) => <li key={t}>{t}</li>)}
            </ul>
            <p className="small muted">
              Site-services suppliers register on etablix.com, not on this site. <ExternalLink href={site.url}>Register as an ETABLIX supplier</ExternalLink>
            </p>
          </div>
          <div className="span-6">
            <h3 style={{ fontSize: "1.125rem" }}>Sectors served</h3>
            <SectorsServed ids={["energy-grid", "data-centres", "public-estate", "commercial-mixed-use", "social-housing"]} />
            <div style={{ marginTop: 32 }}>
              <CapabilityCard company={company} />
            </div>
          </div>
        </div>
      </section>

      <Reasons />
      <Commitments />

      <section className="section" id="diagnostic" aria-labelledby="diagnostic-title">
        <div className="container grid">
          <div className="span-5">
            <p className="label">Site Systems Diagnostic</p>
            <h2 id="diagnostic-title">Book a diagnostic call</h2>
            <p className="muted">
              A call with ETABLIX to review your site set-up against your programme and workforce peak. Tell us about the project and we will arrange a time
              within one working day.
            </p>
            <ol className="steps" style={{ marginTop: 32 }}>
              <li><h3>Send the form</h3><p>About five minutes. Rough numbers are fine.</p></li>
              <li><h3>We call you</h3><p>Within one working day, to arrange the diagnostic.</p></li>
              <li><h3>The diagnostic</h3><p>We go through the programme, the workforce curve and the site plan with you.</p></li>
            </ol>
          </div>
          <div className="span-7">
            <DiagnosticForm sourcePage="/etablix" />
          </div>
        </div>
      </section>

      <section className="cta-band drawing-grid" aria-labelledby="visit-title">
        <div className="container cta-band__inner">
          <div>
            <h2 id="visit-title">ETABLIX has its own website</h2>
            <p>Full details of the methods, delivery models, the 21 trades and supplier registration are on etablix.com.</p>
          </div>
          <ExternalLink href={site.url} className="btn">
            {site.label} <span aria-hidden="true">↗</span>
          </ExternalLink>
        </div>
      </section>
      <CrossLinks />
      {getServices("etablix").map((s) => (
        <JsonLd key={s.slug} data={serviceSchema(s.name, s.summary, company.name, "/etablix")} />
      ))}
    </div>
  );
}
