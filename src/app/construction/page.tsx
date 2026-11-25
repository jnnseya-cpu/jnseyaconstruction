import type { Metadata } from "next";
import Link from "next/link";
import { CapabilityCard, CrossLinks, EnquirySection, ExternalLink, ServiceBlock, ServiceIndex, type ServiceDetail } from "@/components/company/CompanyBlocks";
import { CompanyDrawing } from "@/components/company/CompanyDrawing";
import { PageHero } from "@/components/PageHero";
import { getCompany, getServices } from "@/lib/cms";
import { group } from "@/content/settings";

export const metadata: Metadata = {
  title: "Nseya Construction: buildings, power and digital",
  description: "Buildings from renovation to mixed-use, and civils, M&E and HVAC for substations, 33kV and 132kV cable routes and data centres.",
  alternates: { canonical: "/construction" },
};

const details: Record<string, ServiceDetail> = {
  "renovations-and-extensions": {
    problem: "Homeowners need one builder who manages the whole job, keeps the house safe to live in, and finishes when promised.",
    whatWeDo: [
      "Survey, price and programme the work before you commit.",
      "Manage building control and party wall matters with your designer.",
      "Run the job with a named supervisor and a weekly update.",
    ],
    deliverables: ["Fixed written quote", "Programme with key dates", "Building control completion certificate", "Handover pack with guarantees"],
  },
  "design-and-build-housing": {
    problem: "Small housing sites are often too small for large contractors and too complex for small builders.",
    whatWeDo: [
      "Take the scheme from planning drawings to technical design with our design team.",
      "Build to the Building Regulations and the client's employer's requirements.",
      "Manage trades through a vetted supply chain under one programme.",
    ],
    deliverables: ["Contract sum and programme", "Technical design package", "Completed homes with handover documents", "Defects period management"],
  },
  "commercial-and-mixed-use": {
    problem: "Occupied buildings and tight urban sites need careful phasing, safe working and clear communication with the people around them.",
    whatWeDo: [
      "Plan phasing and logistics around occupants and neighbours.",
      "Deliver fit-out, refurbishment and new build as principal contractor under CDM 2015.",
      "Coordinate M&E with the building fabric so services are tested before handover.",
    ],
    deliverables: ["Construction phase plan", "Logistics and phasing plan", "Commissioned building services", "Health and safety file and O&M manuals"],
  },
  "substation-civils": {
    problem: "Grid connections are held back by civils: foundations, bunds and cable trenches that must be ready before electrical works can start.",
    whatWeDo: [
      "Build plant foundations, transformer bunds, cable trenches and access roads.",
      "Put up control-building shells ready for fit-out.",
      "Work to the asset owner's specifications and site rules, with temporary works designed and checked under BS 5975.",
    ],
    deliverables: ["Civils package to programme", "As-built records and survey", "Inspection and test records", "Temporary works register"],
  },
  "cable-civils": {
    problem: "Cable routes cross roads, fields and services. Delays in trenching and ducting hold up cable pulling and jointing.",
    whatWeDo: [
      "Excavate trenches, lay ducts and build joint bays for 33kV and 132kV circuits.",
      "Arrange street-works notices and traffic management for routes in the highway.",
      "Manage HDD crossings through specialist subcontractors.",
    ],
    deliverables: ["Duct route ready for cable pulling", "Joint bays built to specification", "As-laid route records", "Reinstatement records"],
  },
  "data-centre-construction": {
    problem: "Data-centre programmes are set by the date power and cooling are available. Civils and services have to be ready on time.",
    whatWeDo: [
      "Deliver civils, power distribution and cooling packages for halls and campuses.",
      "Coordinate with the client's commissioning team from early in the programme.",
      "Report progress from CONSTRUX so the client sees one set of figures.",
    ],
    deliverables: ["Package delivery to programme", "Coordinated services drawings", "Test and commissioning records", "Handover documents"],
  },
  "mechanical-electrical-hvac": {
    problem: "Building services are often the last to finish and the first to be blamed. Late design changes and poor coordination show up at commissioning.",
    whatWeDo: [
      "Install mechanical, electrical, heating, ventilation and air-conditioning systems.",
      "Coordinate services with the structure and finishes before installation starts.",
      "Test and commission, and train the people who will run the building.",
    ],
    deliverables: ["Coordinated installation drawings", "Test and commissioning certificates", "O&M manuals", "User training"],
  },
};

const buildingsSlugs = ["renovations-and-extensions", "design-and-build-housing", "commercial-and-mixed-use"];
const powerSlugs = ["substation-civils", "cable-civils", "data-centre-construction"];

const disciplines = [
  { name: "Civils", text: "Foundations, drainage, trenches, ducts, bunds, roads and hardstandings." },
  { name: "M&E", text: "Mechanical and electrical installation, from distribution boards to plant rooms." },
  { name: "HVAC", text: "Heating, ventilation and air-conditioning, including cooling for data halls." },
  { name: "Building services", text: "Coordination, testing and commissioning of all services before handover." },
];

export default function ConstructionPage() {
  const company = getCompany("construction");
  const all = getServices("construction");
  const bySlug = (slugs: string[]) => all.filter((s) => slugs.includes(s.slug));
  const buildings = bySlug(buildingsSlugs);
  const power = bySlug(powerSlugs);
  const mep = all.filter((s) => !buildingsSlugs.includes(s.slug) && !powerSlugs.includes(s.slug));
  let n = 0;
  return (
    <div data-company="construction">
      <PageHero
        crumbs={[{ name: "Nseya Construction", href: "/construction" }]}
        label="Nseya Construction"
        title="Buildings, and the civils behind power and digital infrastructure"
        lede="Two markets, one delivery model: our managers and supervisors lead every job, with the work delivered through a vetted supply chain and tracked in CONSTRUX."
        aside={<CompanyDrawing kind="construction" />}
      >
        <div className="btn-row" style={{ marginTop: 24 }}>
          <a className="btn" href="#enquiry">Send a project enquiry</a>
          <a className="btn btn--ghost" href="#power-and-digital">Power and digital</a>
        </div>
        <p className="hero__meta"><span>Part of Nseya Groupe Construction</span><span>Birmingham · West Midlands</span><span>Trading from 2027</span></p>
      </PageHero>

      <section className="section section--tight section--concrete" aria-label="Two markets">
        <div className="container cards cards--2">
          <a href="#buildings" className="card card--link card--company">
            <span className="card__code">MARKET 01</span>
            <h2 style={{ fontSize: "var(--fs-h3)", margin: 0 }}>Buildings</h2>
            <p>Renovation, extensions, small-site housing, commercial and mixed-use buildings and the public estate.</p>
            <span className="card__foot link-arrow">Buildings services</span>
          </a>
          <a href="#power-and-digital" className="card card--link card--company">
            <span className="card__code">MARKET 02</span>
            <h2 style={{ fontSize: "var(--fs-h3)", margin: 0 }}>Power and digital</h2>
            <p>Generation, substations, data centres, and 33kV and 132kV cable civils.</p>
            <span className="card__foot link-arrow">Power and digital services</span>
          </a>
        </div>
      </section>

      <section className="section" id="buildings" aria-labelledby="buildings-title">
        <div className="container grid">
          <div className="span-4">
            <div style={{ position: "sticky", top: "calc(var(--header-h) + 24px)" }}>
              <p className="label">Market 01</p>
              <h2 id="buildings-title">Buildings</h2>
              <p className="muted">From a single renovation to a mixed-use scheme.</p>
              <div className="notice small" style={{ marginTop: 16 }}>
                <p>
                  Home renovations, extensions and loft conversions are still on{" "}
                  <ExternalLink href={group.legacyResidentialUrl} className="">jnseya.co.uk</ExternalLink> while that content moves to this site during 2027.
                </p>
              </div>
              <div className="section--dark" style={{ padding: "20px 20px 8px", marginTop: 20 }}>
                <ServiceIndex services={[...buildings, ...power, ...mep]} title="All construction services" />
              </div>
            </div>
          </div>
          <div className="span-8">
            {buildings.map((s) => <ServiceBlock key={s.slug} service={s} detail={details[s.slug]} index={n++} company={company} />)}
          </div>
        </div>
      </section>

      <section className="section section--concrete" id="power-and-digital" aria-labelledby="power-title">
        <div className="container grid">
          <div className="span-4">
            <p className="label">Market 02</p>
            <h2 id="power-title">Power and digital</h2>
            <p className="muted">Civils and building services for generation sites, substations, cable routes and data centres.</p>
          </div>
          <div className="span-8">
            {power.map((s) => <ServiceBlock key={s.slug} service={s} detail={details[s.slug]} index={n++} company={company} />)}
            {mep.map((s) => <ServiceBlock key={s.slug} service={s} detail={details[s.slug]} index={n++} company={company} />)}
          </div>
        </div>
      </section>

      <section className="section section--dark drawing-grid" aria-labelledby="disciplines-title">
        <div className="container">
          <p className="label">Disciplines</p>
          <h2 id="disciplines-title">Four disciplines across both markets</h2>
          <div className="cards" style={{ marginTop: 32 }}>
            {disciplines.map((d) => (
              <div className="card" key={d.name} data-reveal>
                <h3>{d.name}</h3>
                <p>{d.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="delivery-title">
        <div className="container grid">
          <div className="span-5">
            <p className="label">Delivery model</p>
            <h2 id="delivery-title">How we deliver</h2>
            <p className="muted">
              Our own managers and supervisors plan and lead every job. About 80% of the work is delivered by subcontractors and suppliers we have vetted.
              Every subcontractor works in CONSTRUX or VERYX, whichever the project uses, so progress, quality records and payment applications are in one place.
            </p>
            <p>
              <Link className="link-arrow" href="/suppliers">Register as a subcontractor</Link>
            </p>
          </div>
          <div className="span-7">
            <ol className="steps">
              <li><h3>Plan</h3><p>Programme, logistics, temporary works and the construction phase plan, agreed before work starts.</p></li>
              <li><h3>Procure</h3><p>Packages let to vetted subcontractors with valid insurance and health and safety evidence, paid on 30-day terms.</p></li>
              <li><h3>Build</h3><p>Our supervisors lead each day on site. Inspections, permits and test records go into CONSTRUX as the work happens.</p></li>
              <li><h3>Hand over</h3><p>Commissioning, as-built records, the health and safety file and O&amp;M manuals, complete at handover.</p></li>
            </ol>
            <div style={{ marginTop: 24 }}>
              <CapabilityCard company={company} />
            </div>
          </div>
        </div>
      </section>

      <EnquirySection
        company={company}
        title="Tell us about your project"
        intro={<p>The form is already set to Nseya Construction. Include the location, the scope and when you want to start.</p>}
      />
      <CrossLinks />
    </div>
  );
}
