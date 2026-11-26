import type { Metadata } from "next";
import Link from "next/link";
import { CapabilityCard, CrossLinks, EnquirySection, ExternalLink } from "@/components/company/CompanyBlocks";
import { CompanyDrawing } from "@/components/company/CompanyDrawing";
import { JsonLd } from "@/components/JsonLd";
import { LandToHandover } from "@/components/modules/LandToHandover";
import { PageHero } from "@/components/PageHero";
import { getCompany, getServices } from "@/lib/cms";
import { serviceSchema } from "@/lib/schema";
import { group } from "@/content/settings";
import type { Service } from "@/content/types";

/* Copy: Phase 1 copy deck, revision 1 (25 Nov 2026), Nseya Construction. */

export const metadata: Metadata = {
  title: { absolute: "Nseya Construction | Buildings and power, BIM-led" },
  description: "Civils, M&E and HVAC for buildings, substations, cable routes and data centres. Live weekly reporting. Subcontractors paid in 30 days.",
  alternates: { canonical: "/construction" },
};

const buildingsSlugs = ["renovations-and-extensions", "design-and-build-housing", "commercial-and-mixed-use", "mechanical-electrical-hvac"];
const powerSlugs = ["substation-civils", "cable-civils", "data-centre-construction"];

const onTrack = [
  { title: "Modelled before it's built.", text: "Every package is clash-checked in the model before it reaches site." },
  { title: "One interface matrix.", text: "Who supplies, installs, tests and certifies every item, agreed before work starts." },
  { title: "Weekly truth.", text: "Progress, cost, risks and open questions, in writing, every week." },
  { title: "Back-to-back contracts.", text: "Our subcontractors carry the same obligations we carry to you." },
  { title: "Safety without exceptions.", text: "CDM 2015 duties, permits, inspection and test plans, signed off by our managers." },
];

const bim = [
  {
    name: "Federated models",
    what: "Architectural, structural, civils and M&E models combined into one coordinated model, issued through the common data environment with status codes.",
    get: "One current model that every trade builds from",
  },
  {
    name: "Clash review",
    what: "Weekly clash detection between disciplines before work is released to site, with each clash given an owner and a date to resolve it.",
    get: "Clash report and resolved-issues log",
  },
  {
    name: "4D sequences",
    what: "The construction programme linked to the model, so the build sequence, logistics and temporary works can be checked before they happen.",
    get: "4D sequence for key stages and site logistics",
  },
  {
    name: "Digital handover and asset data",
    what: "As-built models, test certificates and O&M information checked against the client's asset information requirements and handed over as structured data (COBie where required).",
    get: "Asset information model ready for facilities management",
  },
];

/** Anchored service names, so the services index and matrix can link to each one. */
function ServiceAnchors({ services, companyName }: { services: Service[]; companyName: string }) {
  return (
    <ul className="anchor-list">
      {services.map((s) => (
        <li key={s.slug} id={s.slug}>
          {s.name}
          <JsonLd data={serviceSchema(s.name, s.summary, companyName, `/construction#${s.slug}`)} />
        </li>
      ))}
    </ul>
  );
}

export default function ConstructionPage() {
  const company = getCompany("construction");
  const all = getServices("construction");
  const pick = (slugs: string[]) => slugs.map((sl) => all.find((s) => s.slug === sl)).filter((s): s is Service => !!s);
  return (
    <div data-company="construction">
      <PageHero
        crumbs={[{ name: "Nseya Construction", href: "/construction" }]}
        label="Nseya Construction"
        title="Built on programme. Proven every week."
        lede="From pre-planning and grid connection to handover: buildings and power infrastructure — civils, M&E, HVAC and building services — delivered BIM-led, with cost and programme reported to you every week."
        aside={<CompanyDrawing kind="construction" />}
      >
        <div className="btn-row" style={{ marginTop: 24 }}>
          <Link className="btn" href="/contact?company=construction&type=price#enquiry">Send us your drawings for a price</Link>
          <a className="btn btn--ghost" href="#what-we-build">See what we build</a>
        </div>
        <p className="hero__meta"><span>Part of Nseya Group Construction</span><span>Birmingham</span><span>Trading from 2027</span></p>
      </PageHero>

      {/* Two markets */}
      <section className="section" id="what-we-build" aria-labelledby="markets-title">
        <div className="container">
          <p className="label">What we build</p>
          <h2 id="markets-title">Two markets, one standard</h2>
          <div className="card" id="land" style={{ marginTop: 32 }}>
            <h3>Land, planning and grid connection</h3>
            <p>
              From appraisal and pre-planning, through planning permission and the grid connection, to land made ready to build on:
              clearance, demolition, remediation, earthworks, roads, drainage and utilities.
            </p>
            <ServiceAnchors services={pick(["pre-planning-to-handover", "grid-connection-works", "site-enabling-works"])} companyName={company.name} />
          </div>
          <div className="cards cards--2" style={{ marginTop: 20 }}>
            <div className="card" id="buildings">
              <h3>Buildings</h3>
              <p>Renovations, extensions and refurbishments; heating, ventilation and electrical upgrades; new homes and estates; schools, health and commercial mixed-use.</p>
              <ServiceAnchors services={pick(buildingsSlugs)} companyName={company.name} />
              <p className="small">
                Home renovations, extensions and lofts are on <ExternalLink href={group.legacyResidentialUrl} className="">jnseya.co.uk</ExternalLink> until
                they move to this site during 2027.
              </p>
            </div>
            <div className="card" id="power-and-digital">
              <h3>Power and digital</h3>
              <p>33kV and 132kV cable-route civils, substation and BESS civils, control buildings, and M&amp;E and HVAC packages for data centres.</p>
              <ServiceAnchors services={pick(powerSlugs)} companyName={company.name} />
            </div>
          </div>
        </div>
      </section>

      {/* From land to handover */}
      <section className="section section--tight" aria-labelledby="land-title">
        <div className="container">
          <p className="label">From land to handover</p>
          <h2 id="land-title">From appraisal to handover</h2>
          <p className="lede" style={{ color: "var(--ink)", marginBottom: 32 }}>
            With Nseya Consultancy we take a site from appraisal and pre-planning, through planning permission and grid connection, to build and handover.
          </p>
          <LandToHandover />
        </div>
      </section>

      {/* How we keep your job on track */}
      <section className="section section--concrete" aria-labelledby="track-title">
        <div className="container grid">
          <div className="span-4">
            <p className="label">Delivery model</p>
            <h2 id="track-title">How we keep your job on track</h2>
            <p>
              <Link className="link-arrow" href="/suppliers">Register as a subcontractor</Link>
            </p>
          </div>
          <ul className="span-8 service-list">
            {onTrack.map((t, i) => (
              <li key={t.title} data-reveal>
                <span className="service-list__no" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{t.title}</h3>
                  <p>{t.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Power and digital */}
      <section className="section section--dark drawing-grid" aria-labelledby="power-title">
        <div className="container grid">
          <div className="span-7">
            <p className="label">Power and digital</p>
            <h2 id="power-title">From 33kV to 132kV: civils that protect your energisation date.</h2>
            <p className="lede">
              Trenching, ductbanks, joint bays, HDD interfaces, substation foundations, plinths and control buildings — run by a
              manager who has delivered grid and data-centre programmes. Specialist jointing and HV testing stay with approved
              specialists; we own the civils, the programme and every interface, and we can run the grid connection end to end,
              from application to energisation.
            </p>
            <Link className="btn" href="/contact?company=construction&type=power#enquiry">Talk to our power team</Link>
          </div>
        </div>
      </section>

      <section className="section" id="bim" aria-labelledby="bim-title">
        <div className="container grid">
          <div className="span-4">
            <p className="label">BIM-led delivery</p>
            <h2 id="bim-title">Built from the model, handed over as data</h2>
            <p className="muted">
              We run projects to BS EN ISO 19650-2. Design and site teams work from one federated model in a common data environment, and the client
              receives asset data they can use to run the building or network.
            </p>
            <p>
              <Link className="link-arrow" href="/consultancy#bim-information-management">Information management from Nseya Consultancy</Link>
            </p>
          </div>
          <div className="span-8">
            <div className="table-wrap">
              <table className="table">
                <caption className="visually-hidden">The four parts of BIM-led delivery</caption>
                <thead>
                  <tr><th scope="col">What</th><th scope="col">What we do</th><th scope="col">What you get</th></tr>
                </thead>
                <tbody>
                  {bim.map((b) => (
                    <tr key={b.name}>
                      <th scope="row">{b.name}</th>
                      <td>{b.what}</td>
                      <td>{b.get}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
              Because we start where we can prove ourselves: right-sized jobs, published commitments and senior management on
              every site. Your project is visible to you live, every week. If we slip, you&apos;ll know before we tell you.
            </p>
            <div className="btn-row">
              <Link className="btn" href="/contact?company=construction&type=price#enquiry">Send us your drawings for a price</Link>
            </div>
            <div style={{ marginTop: 32 }}>
              <CapabilityCard company={company} />
            </div>
          </div>
        </div>
      </section>

      <EnquirySection
        company={company}
        title="Tell us about the job"
        intro={<p>Attach drawings or a specification for a price.</p>}
      />
      <CrossLinks />
    </div>
  );
}
