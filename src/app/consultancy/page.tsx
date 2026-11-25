import type { Metadata } from "next";
import Link from "next/link";
import { CapabilityCard, CrossLinks, EnquirySection, SectorsServed, ServiceBlock, ServiceIndex, type ServiceDetail } from "@/components/company/CompanyBlocks";
import { CompanyDrawing } from "@/components/company/CompanyDrawing";
import { PageHero } from "@/components/PageHero";
import { InformationCycle } from "@/components/modules/InformationCycle";
import { getCompany, getServices } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Nseya Consultancy: project and cost managers",
  description: "Project, cost and controls management, feasibility, BIM to ISO 19650, tender support and Bid-On from Nseya Consultancy, Birmingham.",
  alternates: { canonical: "/consultancy" },
};

const details: Record<string, ServiceDetail> = {
  "project-management": {
    problem: "Projects drift when nobody on the client side owns the brief, the programme and the decisions. Problems surface late, when they cost most to fix.",
    whatWeDo: [
      "Set the brief, the budget and the decision points with you at the start.",
      "Run the project through the RIBA Plan of Work stages, with a gate review at each stage.",
      "Manage the contract under NEC4 or JCT: early warnings, compensation events and change.",
      "Chair progress meetings and keep one list of actions and owners.",
    ],
    deliverables: ["Project execution plan", "Monthly progress report", "Risk and issues register", "Handover and close-out file"],
  },
  "cost-management": {
    problem: "Budgets are set once and then lose touch with the design. By the time a tender comes back, the gap is too big to close without cutting scope.",
    whatWeDo: [
      "Prepare cost plans measured to NRM 1 and keep them in step with the design.",
      "Price changes before they are instructed, so decisions are made with the cost in view.",
      "Value work monthly and agree final accounts.",
    ],
    deliverables: ["Order of cost estimate and cost plans", "Cost report against budget every month", "Interim valuations", "Final account"],
  },
  "project-controls": {
    problem: "Programme, cost and risk are often reported from separate spreadsheets that disagree. Clients cannot tell whether the project is on track.",
    whatWeDo: [
      "Build and maintain the baseline programme, then track progress against it each week.",
      "Report earned value from one set of project data in CONSTRUX.",
      "Run quantified risk reviews and keep the change log current.",
    ],
    deliverables: ["Baseline and updated programmes", "Earned value report", "Quantified risk register", "Change control log"],
  },
  "feasibility-studies": {
    problem: "Schemes often spend heavily on design before anyone has tested whether the site, the budget and the programme work together.",
    whatWeDo: [
      "Review the site: constraints, access, utilities, planning history.",
      "Test options against cost and programme, and set out the risks of each.",
      "Recommend whether to proceed, and what to do first if you do.",
    ],
    deliverables: ["Feasibility report with options appraisal", "Order of cost estimate per option", "Outline programme", "Risk register"],
  },
  "bim-information-management": {
    problem: "Design, cost and site teams each keep their own version of the information. Clients get models and documents at handover that nobody can find, trust or use to run the building.",
    whatWeDo: [
      "Write the client's information requirements: organisational, asset, project and exchange information requirements (OIR, AIR, PIR, EIR).",
      "Assess each team's capability and agree the BIM execution plan and the master information delivery plan (MIDP).",
      "Set up and run the common data environment, with naming, status codes and approval steps to BS EN ISO 19650-2 and the UK National Annex.",
      "Check each information exchange against the requirements before it is accepted.",
    ],
    deliverables: ["Information requirements (OIR, AIR, PIR, EIR)", "BIM execution plan and MIDP", "Common data environment set up and run", "Information model accepted at handover"],
  },
  "tender-and-procurement": {
    problem: "A weak procurement route or unclear tender documents lead to bids that cannot be compared, and to claims later.",
    whatWeDo: [
      "Advise on the procurement route, contract form and lotting.",
      "Prepare tender documents, run clarifications and evaluate quality and price.",
      "Run procurements in line with the Procurement Act 2023 for public-sector clients.",
    ],
    deliverables: ["Procurement strategy", "Tender documents and evaluation model", "Tender report and award recommendation", "Contract documents ready to sign"],
  },
  "bid-on": {
    problem: "Smaller contractors and suppliers lose public tenders on presentation and compliance, not on capability.",
    whatWeDo: [
      "Review each opportunity with you and give a clear bid or no-bid view.",
      "Plan the bid, draft and review quality answers against the scoring criteria.",
      "Check compliance and support pricing before submission.",
    ],
    deliverables: ["Bid/no-bid review", "Bid plan and response matrix", "Reviewed quality answers", "Compliance check before submission"],
  },
};

const numberWord = (n: number) => ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"][n] ?? String(n);

const engagement = [
  { name: "Fixed fee", text: "For a defined scope with clear outputs, such as a feasibility study or a single procurement. You know the cost before we start." },
  { name: "Day rate", text: "For work where the scope is still forming, or for short support. We agree a day rate and report the days used every week." },
  { name: "Retainer", text: "For ongoing support across a programme of work. A set number of days each month, with a named lead." },
];

export default function ConsultancyPage() {
  const company = getCompany("consultancy");
  const services = getServices("consultancy");
  return (
    <div data-company="consultancy">
      <PageHero
        crumbs={[{ name: "Nseya Consultancy", href: "/consultancy" }]}
        label="Nseya Consultancy"
        title="Project, cost and controls management you can check every month"
        lede="We manage projects for clients and support contractors with tenders. Every report shows the programme, the cost and the risks from one set of data."
        aside={<CompanyDrawing kind="consultancy" />}
      >
        <div className="btn-row" style={{ marginTop: 24 }}>
          <a className="btn" href="#enquiry">Send an enquiry</a>
          <a className="btn btn--ghost" href="#services">See our services</a>
        </div>
        <p className="hero__meta"><span>Part of Nseya Groupe Construction</span><span>Birmingham</span><span>Trading from 2027</span></p>
      </PageHero>

      <section className="section" id="services" aria-labelledby="services-title">
        <div className="container grid">
          <div className="span-4">
            <div style={{ position: "sticky", top: "calc(var(--header-h) + 24px)" }}>
              <h2 id="services-title">{numberWord(services.length)} services</h2>
              <p className="muted">Each can be bought on its own, or together as client-side project management.</p>
              <div className="section--dark" style={{ padding: "20px 20px 8px", marginTop: 20 }}>
                <ServiceIndex services={services} />
              </div>
            </div>
          </div>
          <div className="span-8">
            {services.map((s, i) => (
              <ServiceBlock key={s.slug} service={s} detail={details[s.slug]} index={i} company={company} extra={s.slug === "bim-information-management" ? <InformationCycle /> : undefined} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--dark drawing-grid" aria-labelledby="engage-title">
        <div className="container">
          <p className="label">How to engage us</p>
          <h2 id="engage-title">Three ways to buy</h2>
          <p className="lede">We agree the fee basis in writing before any work starts. Our proposal sets out the scope, the people and the outputs.</p>
          <div className="cards" style={{ marginTop: 32 }}>
            {engagement.map((e, i) => (
              <div className="card" key={e.name} data-reveal>
                <span className="mono small" style={{ color: "var(--accent-on-dark)" }}>{String(i + 1).padStart(2, "0")}</span>
                <h3>{e.name}</h3>
                <p>{e.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="sectors-title">
        <div className="container grid">
          <div className="span-4">
            <p className="label">Sectors</p>
            <h2 id="sectors-title">Who we work for</h2>
            <p className="muted">
              Public-sector clients, housing providers and private developers, and contractors who bid for their work. See every service by sector on the{" "}
              <Link href="/services">services index</Link>.
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
        title="Tell us about your project"
        intro={<p>The form is already set to Nseya Consultancy. Tell us what stage the project is at and what you need help with.</p>}
      />
      <CrossLinks />
    </div>
  );
}
