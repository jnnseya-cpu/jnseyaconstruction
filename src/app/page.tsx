import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { Commitments, Reasons } from "@/components/company/Promises";
import { CompanyCards } from "@/components/home/CompanyCards";
import styles from "@/components/home/home.module.css";
import { legalEntityName, structureCompanies } from "@/components/home/structureData";
import { GroupStructure } from "@/components/modules/GroupStructure";
import { HeroDrawing } from "@/components/modules/HeroDrawing";
import { HowWeDeliver } from "@/components/modules/HowWeDeliver";
import { LandToHandover } from "@/components/modules/LandToHandover";
import { group } from "@/content/settings";
import { getCompanies, getLegalEntity } from "@/lib/cms";

/* Copy: Phase 1 copy deck, revision 1 (25 Nov 2026), Home. */

export const metadata: Metadata = {
  title: { absolute: "Nseya Group Construction | Build with certainty" },
  description:
    "Project management, BIM, site services and construction for buildings, power and data centres. Fixed-fee proposal in 5 working days.",
  alternates: { canonical: "/" },
};



const sectors = ["Landowners and developers", "Public estate", "Social housing", "Energy and grid", "Data centres", "Commercial and mixed-use", "Homeowners"];



export default function HomePage() {
  const companies = getCompanies();
  const entity = getLegalEntity();
  return (
    <div data-company="group">
      {/* Hero */}
      <section className="hero drawing-grid">
        <div className={`container hero__inner ${styles.heroGrid}`}>
          <div>
            <p className="label">Nseya Group Construction · Birmingham</p>
            <h1>{group.promise}</h1>
            <p className="lede">
              Consultancy, site services and construction for buildings, power and data centres — led by a chartered
              construction manager and controlled live, every week.
            </p>
            <div className="btn-row">
              <Link className="btn" href="/contact">Get a fixed-fee proposal in 5 working days</Link>
              <Link className="btn btn--ghost" href="#how-we-deliver">See how we deliver</Link>
            </div>
            <p className="hero__meta">
              <span>Trading from January {group.tradingStart}</span>
              <span>{entity.legalName} · {entity.companyNumber}</span>
            </p>
          </div>
          <div className={styles.heroDrawing}>
            <HeroDrawing />
          </div>
        </div>
      </section>

      {/* Three companies */}
      <section className="section" id="companies" aria-labelledby="companies-title">
        <div className="container">
          <p className="label">Three companies</p>
          <h2 id="companies-title" style={{ marginBottom: 40 }}>Three companies. One standard.</h2>
          <CompanyCards companies={companies} />
        </div>
      </section>

      {/* From land to handover */}
      <section className="section section--tight" aria-labelledby="land-title">
        <div className="container">
          <p className="label">From land to handover</p>
          <h2 id="land-title">From a piece of land to a finished building</h2>
          <p className="lede" style={{ marginBottom: 32 }}>
            Appraisal, acquisition, planning from pre-planning, grid connection, design, build and handover, run by one group. Use the whole journey, or only the
            stages you need.
          </p>
          <LandToHandover />
        </div>
      </section>

      <Reasons />

      {/* How we deliver */}
      <section className="section section--dark drawing-grid" id="how-we-deliver" aria-labelledby="deliver-title">
        <div className="container">
          <p className="label">How we deliver</p>
          <h2 id="deliver-title">How we deliver</h2>
          <p className="lede">About 80% of the work is delivered by vetted subcontractors, led by our own managers and supervisors.</p>
          <HowWeDeliver />
        </div>
      </section>

      {/* Who we work for */}
      <section className="section section--tight" aria-labelledby="clients-title">
        <div className="container">
          <p className="label">Who we work for</p>
          <h2 id="clients-title" className="visually-hidden">Who we work for</h2>
          <ul className={styles.sectorList}>
            {sectors.map((s) => <li key={s}>{s}</li>)}
          </ul>
          <p style={{ marginTop: 24 }}>
            <Link className="link-arrow" href="/services">See every service by company and sector</Link>
          </p>
        </div>
      </section>

      <Commitments />

      {/* Group structure explorer (spec section 7a) */}
      <section className="section" aria-labelledby="structure-title">
        <div className="container">
          <p className="label">Group structure</p>
          <h2 id="structure-title">How the group works</h2>
          <GroupStructure companies={structureCompanies()} legalEntity={legalEntityName()} />
        </div>
      </section>

      {/* Careers and suppliers */}
      <section aria-label="Careers and suppliers">
        <div className={styles.audiences}>
          <div className={`${styles.aud} ${styles.audCareers}`}>
            <p className="label">Careers</p>
            <h2>Graduated, still waiting?</h2>
            <p>Our Graduate Academy is a paid route into construction, with a path to chartership.</p>
            <div className="btn-row">
              <Link className="btn" href="/careers/graduate-academy">See the Academy</Link>
            </div>
          </div>
          <div className={`${styles.aud} ${styles.audSuppliers}`}>
            <p className="label">Suppliers and subcontractors</p>
            <h2>Specialist contractor or supplier?</h2>
            <p>Paid in 30 days, a pipeline you can plan around.</p>
            <div className="btn-row">
              <Link className="btn" href="/suppliers">Join our supply chain</Link>
            </div>
          </div>
        </div>
      </section>

      <CtaBand
        title="Have a project in mind?"
        text="Tell us about it today and get a fixed-fee proposal within five working days."
        href="/contact"
        cta="Start your enquiry"
      />
    </div>
  );
}
