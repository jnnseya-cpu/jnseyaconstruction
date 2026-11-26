import type { Metadata } from "next";
import Link from "next/link";
import { CapabilityCard, CrossLinks, EnquirySection, SectorsServed } from "@/components/company/CompanyBlocks";
import { CompanyDrawing } from "@/components/company/CompanyDrawing";
import { JsonLd } from "@/components/JsonLd";
import { InformationCycle } from "@/components/modules/InformationCycle";
import { LandToHandover } from "@/components/modules/LandToHandover";
import type { Service } from "@/content/types";
import { PageHero } from "@/components/PageHero";
import { getCompany, getServices } from "@/lib/cms";
import { serviceSchema } from "@/lib/schema";

/* Copy: Phase 1 copy deck, revision 1 (25 Nov 2026), Nseya Consultancy. */

export const metadata: Metadata = {
  title: { absolute: "Nseya Consultancy | PM, cost, controls and BIM" },
  description:
    "Know the cost, the risk and the route before you commit. Fixed-fee proposals in 5 working days. Free 30-minute project review.",
  alternates: { canonical: "/consultancy" },
};

/** TO CONFIRM (copy deck sign-off): the free 30-minute project review offer. */
const reviewHref = process.env.NEXT_PUBLIC_BOOKING_URL || "/contact?company=consultancy&type=review#enquiry";
const reviewExternal = reviewHref.startsWith("http");

const different = [
  {
    title: "We've sat on the client's side.",
    text: "Our founder has written the procurement packages that contractors answer. We know what a good bid, a fair price and a real risk look like.",
  },
  { title: "We show our working.", text: "Every number we give you is traceable in CONSTRUX." },
  { title: "Clear fees, agreed up front.", text: "Fixed fee, day rate or monthly retainer — your choice, quoted in writing before work starts." },
];

const bim = [
  ["Information requirements", " that say exactly what you need, and when."],
  ["BIM execution plans", " reviewed or written, and enforced."],
  ["A single source of truth:", " a common data environment set up in CONSTRUX."],
  ["Clash-free coordination", " before work starts on site."],
  ["4D and 5D:", " programme and cost linked to the model."],
  ["Asset data at handover", " (COBie or your own format), ready for operation and a digital twin."],
  ["ISO 19650 readiness for contractors", " who need to prove capability to win frameworks."],
];

const LAND = ["land-appraisal", "site-acquisition", "planning", "grid-connections", "development-management"];

function ServiceList({ services, start, companyName }: { services: Service[]; start: number; companyName: string }) {
  return (
    <ol className="service-list" start={start + 1}>
      {services.map((s, i) => (
        <li key={s.slug} id={s.slug === "bim-information-management" ? undefined : s.slug} data-reveal>
          <span className="service-list__no" aria-hidden="true">{String(start + i + 1).padStart(2, "0")}</span>
          <div>
            <h4>{s.name}</h4>
            <p>
              {s.summary}
              {s.slug === "bim-information-management" && (
                <> <a className="link-arrow" href="#bim-information-management">See BIM</a></>
              )}
            </p>
          </div>
          <JsonLd data={serviceSchema(s.name, s.summary, companyName, `/consultancy#${s.slug}`)} />
        </li>
      ))}
    </ol>
  );
}

function ReviewButton({ className = "btn" }: { className?: string }) {
  return reviewExternal ? (
    <a className={className} href={reviewHref} rel="noopener">Book a free 30-minute project review</a>
  ) : (
    <Link className={className} href={reviewHref}>Book a free 30-minute project review</Link>
  );
}

export default function ConsultancyPage() {
  const company = getCompany("consultancy");
  const services = getServices("consultancy");
  return (
    <div data-company="consultancy">
      <PageHero
        crumbs={[{ name: "Nseya Consultancy", href: "/consultancy" }]}
        label="Nseya Consultancy"
        title="Know the cost, the risk and the route before you commit."
        lede="Land appraisal, planning from pre-planning and grid connections, then project management, cost management, project controls, feasibility studies and BIM — for buildings, housing, energy, data centres and the public estate."
        aside={<CompanyDrawing kind="consultancy" />}
      >
        <div className="btn-row" style={{ marginTop: 24 }}>
          <ReviewButton />
          <a className="btn btn--ghost" href="#services">See our services</a>
        </div>
        <p className="hero__meta"><span>Part of Nseya Group Construction</span><span>Birmingham</span><span>Trading from 2027</span></p>
      </PageHero>

      {/* What we do */}
      <section className="section" id="services" aria-labelledby="services-title">
        <div className="container grid">
          <div className="span-4">
            <p className="label">What we do</p>
            <h2 id="services-title">What we do</h2>
            <p className="muted">From the first look at a piece of land to handover. Use one service or all of them.</p>
          </div>
          <div className="span-8">
            <h3 className="service-group">Land, planning and grid connection</h3>
            <ServiceList services={services.filter((s) => LAND.includes(s.slug))} start={0} companyName={company.name} />
            <h3 className="service-group">Project delivery</h3>
            <ServiceList services={services.filter((s) => !LAND.includes(s.slug))} start={LAND.length} companyName={company.name} />
          </div>
        </div>
      </section>

      {/* From land to handover */}
      <section className="section section--concrete" aria-labelledby="land-title">
        <div className="container">
          <p className="label">From land to handover</p>
          <h2 id="land-title">From appraisal to handover</h2>
          <p className="lede" style={{ color: "var(--ink)", marginBottom: 32 }}>
            We can run the whole journey for landowners and developers, with Nseya Construction building and ETABLIX running the site.
          </p>
          <LandToHandover />
        </div>
      </section>

      {/* Why our advice is different */}
      <section className="section section--dark drawing-grid" aria-labelledby="different-title">
        <div className="container">
          <p className="label">Why our advice is different</p>
          <h2 id="different-title">Why our advice is different</h2>
          <div className="cards" style={{ marginTop: 32 }}>
            {different.map((d) => (
              <div className="card" key={d.title} data-reveal>
                <h3>{d.title}</h3>
                <p>{d.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="section section--concrete" aria-labelledby="trust-title">
        <div className="container grid">
          <div className="span-4">
            <h2 id="trust-title">You&apos;re new — why should I trust you?</h2>
          </div>
          <div className="span-7">
            <p className="lede" style={{ color: "var(--ink)" }}>
              Because you don&apos;t have to take a big risk to find out. Start with a free 30-minute project review or a small
              fixed-fee piece of work. You get a senior chartered professional, written commitments, and references from our
              founder&apos;s own projects on request.
            </p>
            <ReviewButton />
          </div>
        </div>
      </section>

      {/* BIM */}
      <section className="section" id="bim-information-management" aria-labelledby="bim-title">
        <div className="container grid">
          <div className="span-5">
            <p className="label">BIM and information management</p>
            <h2 id="bim-title">Solve it in the model, not on site.</h2>
            <p className="lede" style={{ color: "var(--ink)" }}>
              ISO 19650 information management led by an MSc-qualified BIM manager with 14+ years on infrastructure.
            </p>
            <ul className="tick-list">
              {bim.map(([b, t]) => (
                <li key={b}><strong>{b}</strong>{t}</li>
              ))}
            </ul>
            <div className="btn-row" style={{ marginTop: 24 }}>
              <Link className="btn" href="/contact?company=consultancy&type=iso19650#enquiry">Request an ISO 19650 readiness check</Link>
            </div>
          </div>
          <div className="span-7">
            <InformationCycle />
          </div>
        </div>
      </section>

      {/* Sectors and capability statement */}
      <section className="section section--concrete" aria-labelledby="sectors-title">
        <div className="container grid">
          <div className="span-4">
            <p className="label">Sectors</p>
            <h2 id="sectors-title">Who we work for</h2>
            <p className="muted">
              See every service by sector on the <Link href="/services">services index</Link>.
            </p>
          </div>
          <div className="span-8">
            <SectorsServed ids={["public-estate", "social-housing", "energy-grid", "data-centres", "commercial-mixed-use", "residential"]} />
            <div style={{ marginTop: 32 }}>
              <CapabilityCard company={company} />
            </div>
          </div>
        </div>
      </section>

      <EnquirySection
        company={company}
        title="Tell us about the job"
        intro={<p>Ask for a free 30-minute project review, or tell us what you need.</p>}
      />
      <CrossLinks />
    </div>
  );
}
