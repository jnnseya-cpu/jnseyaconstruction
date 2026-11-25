import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { CompanyCards } from "@/components/home/CompanyCards";
import styles from "@/components/home/home.module.css";
import { legalEntityName, structureCompanies } from "@/components/home/structureData";
import { GroupStructure } from "@/components/modules/GroupStructure";
import { HeroDrawing } from "@/components/modules/HeroDrawing";
import { HowWeDeliver } from "@/components/modules/HowWeDeliver";
import { Stat } from "@/components/Stat";
import { group } from "@/content/settings";
import { getCompanies, getLegalEntity, getServices } from "@/lib/cms";

export const metadata: Metadata = {
  title: { absolute: "Nseya Groupe Construction | Birmingham" },
  description:
    "Nseya Consultancy, ETABLIX site services and Nseya Construction: one Birmingham group for public, energy, housing and data-centre clients.",
  alternates: { canonical: "/" },
};

const clients = [
  {
    code: "S-01",
    name: "Public sector",
    text: "Councils, NHS trusts and public bodies buying through tenders and frameworks.",
    companies: ["consultancy", "etablix", "construction"] as const,
  },
  {
    code: "S-02",
    name: "Energy and grid",
    text: "Generation, substations and 33kV and 132kV cable routes, for clients and EPC contractors.",
    companies: ["etablix", "construction"] as const,
  },
  {
    code: "S-03",
    name: "Housing",
    text: "Housing associations and developers: feasibility, cost control and small-site design and build.",
    companies: ["consultancy", "construction"] as const,
  },
  {
    code: "S-04",
    name: "Data centres",
    text: "Civils, power and cooling packages, and the site services a large workforce needs.",
    companies: ["etablix", "construction"] as const,
  },
];
const shortName = { consultancy: "Consultancy", etablix: "ETABLIX", construction: "Construction" };

export default function HomePage() {
  const companies = getCompanies();
  const entity = getLegalEntity();
  return (
    <div data-company="group">
      {/* Hero */}
      <section className="hero drawing-grid">
        <div className={`container hero__inner ${styles.heroGrid}`}>
          <div>
            <p className="label">Nseya Groupe Construction · Birmingham</p>
            <h1>{group.promise}</h1>
            <p className="lede">
              Nseya Consultancy, ETABLIX and Nseya Construction work as one group, for public-sector, energy, housing and
              data-centre clients across the UK.
            </p>
            <div className="btn-row">
              <Link className="btn" href="#companies">Find the right company</Link>
              <Link className="btn btn--ghost" href="/contact">Send an enquiry</Link>
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

      {/* Companies */}
      <section className="section" id="companies" aria-labelledby="companies-title">
        <div className="container">
          <div className={styles.split} style={{ marginBottom: 40 }}>
            <div>
              <p className="label">Three companies</p>
              <h2 id="companies-title">Go straight to the company you want to buy from</h2>
            </div>
            <p className="muted" style={{ alignSelf: "end" }}>
              Each company has its own colour on this site, so you always know which one you are dealing with. ETABLIX
              also has its own website, etablix.com.
            </p>
          </div>
          <CompanyCards companies={companies} servicesFor={(id) => getServices(id)} />
        </div>
      </section>

      {/* Who we work for */}
      <section className="section section--concrete drawing-grid--light" aria-labelledby="clients-title">
        <div className="container">
          <p className="label">Who we work for</p>
          <h2 id="clients-title">Four kinds of client</h2>
          <ul className={styles.clients}>
            {clients.map((c) => (
              <li key={c.code} data-reveal>
                <span className={styles.clientCode}>{c.code}</span>
                <h3>{c.name}</h3>
                <p>{c.text}</p>
                <div className={styles.dots} aria-label="Companies that serve this sector">
                  {c.companies.map((id) => (
                    <span key={id} data-company={id}>{shortName[id]}</span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
          <p style={{ marginTop: 24 }}>
            <Link className="link-arrow" href="/services">See every service by company and sector</Link>
          </p>
        </div>
      </section>

      {/* How we deliver */}
      <section className="section section--dark drawing-grid" aria-labelledby="deliver-title">
        <div className="container">
          <p className="label">How we deliver</p>
          <h2 id="deliver-title" style={{ maxWidth: "20ch" }}>A small team that manages a large, checked supply chain</h2>
          <HowWeDeliver />
        </div>
      </section>

      {/* Group structure explorer */}
      <section className="section" aria-labelledby="structure-title">
        <div className="container">
          <p className="label">Group structure</p>
          <h2 id="structure-title">Choose a company to see what it does</h2>
          <GroupStructure companies={structureCompanies()} legalEntity={legalEntityName()} />
        </div>
      </section>

      {/* Honest start */}
      <section className="section section--concrete section--tight" aria-labelledby="start-title">
        <div className="container grid">
          <div className={`span-5 ${styles.statement}`}>
            <h2 id="start-title" style={{ fontSize: "var(--fs-h3)" }}>We start trading in January {group.tradingStart}</h2>
            <p>
              The group is new. We do not have a trading history, turnover or completed projects to show yet, and we will
              not pretend otherwise. Case studies will appear here as our first jobs finish, with each client&apos;s
              permission.
            </p>
            <p style={{ margin: 0 }}>
              <Link className="link-arrow" href="/about">About the group and its founder</Link>
            </p>
          </div>
          <div className={`${styles.rightCol} ${styles.facts}`} style={{ alignContent: "center" }}>
            <Stat value="80%" countTo={80} label="of project work delivered through a vetted supply chain" kind="Group plan" />
            <Stat value="30 days" countTo={30} label="payment terms for suppliers and subcontractors" kind="Policy" />
            <Stat value="32" countTo={32} label="staff by 2029, half of them graduates" kind="Target" />
            <Stat value="60" countTo={60} label="approved suppliers by the end of 2027" kind="Target" />
          </div>
        </div>
      </section>

      {/* Careers and suppliers */}
      <section aria-label="Careers and suppliers">
        <div className={styles.audiences}>
          <div className={`${styles.aud} ${styles.audCareers}`}>
            <p className="label">Careers</p>
            <h2>Start a career in construction</h2>
            <p>We are hiring graduates, apprentices and trainees, including people who have never worked in construction.</p>
            <ul className={styles.checks}>
              <li>A two-year Graduate Academy for any degree subject</li>
              <li>Paid apprenticeships and trainee roles from age 16</li>
              <li>A mentor, a CSCS card and site safety training for every starter</li>
            </ul>
            <div className="btn-row">
              <Link className="btn" href="/careers">Explore careers</Link>
              <Link className="btn btn--ghost" href="/careers/vacancies">See vacancies</Link>
            </div>
          </div>
          <div className={`${styles.aud} ${styles.audSuppliers}`}>
            <p className="label">Suppliers and subcontractors</p>
            <h2>Work on our projects</h2>
            <p>Most of our work goes to specialist firms. Register once, keep your documents current, and we will contact you as work comes up.</p>
            <ul className={styles.checks}>
              <li>Payment within 30 days</li>
              <li>A free seat on the project&apos;s CONSTRUX or VERYX platform</li>
              <li>Site-services firms register on etablix.com</li>
            </ul>
            <div className="btn-row">
              <Link className="btn" href="/suppliers">Register as a supplier</Link>
            </div>
          </div>
        </div>
      </section>

      <CtaBand
        title="Tell us about your project"
        text="We reply to every enquiry within one working day."
        href="/contact"
        cta="Send an enquiry"
        secondary={{ href: "/about#company-details", label: "Company details for buyers" }}
      />
    </div>
  );
}
