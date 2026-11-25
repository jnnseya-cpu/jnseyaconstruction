import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { PageHero } from "@/components/PageHero";
import { group } from "@/content/settings";
import { gbp, minimums } from "@/lib/suppliers/minimums";

/* Copy: Phase 1 copy deck, revision 1 (25 Nov 2026), Suppliers and subcontractors. */

export const metadata: Metadata = {
  title: { absolute: "Work with Nseya | Join our approved supply chain" },
  description: "Paid in 30 days. A free platform seat. A decision in 10 working days. Apply to join our supply chain.",
  alternates: { canonical: "/suppliers" },
};

const why = [
  { title: "Paid in 30 days.", text: "Every time. That's our standard, not a target." },
  { title: "One application, kept current.", text: "Upload your documents once; we remind you before anything expires." },
  {
    title: "A free seat in CONSTRUX or VERYX.",
    text: "Diaries, RAMS, inspections and payment applications in one place, so getting paid is quick and clean.",
  },
  { title: "Repeat work.", text: "Perform well and you're first in line for the next package." },
];

const wanted = [
  "Groundworks and civils",
  "Electrical, mechanical and HVAC",
  "Cable laying and jointing (33kV and 132kV)",
  "Substation civils, testing and commissioning",
  "Steel, envelope, roofing and finishes",
  "Plant and equipment hire",
  "Materials",
  "Designers, QS and engineering consultants",
];

const how = [
  { title: "Apply online", text: "in about 20 minutes. We look up your company details for you." },
  { title: "We check", text: "your accreditations, insurance and references." },
  { title: "Decision within 10 working days,", text: "with reasons." },
  { title: "Onboarded within 5 working days", text: "of your first award." },
];

export default function SuppliersPage() {
  return (
    <>
      <PageHero
        label="Suppliers and subcontractors"
        title="Paid in 30 days. A pipeline you can plan around."
        lede="One application. A free seat on the project's platform. A decision within 10 working days."
        crumbs={[{ name: "Suppliers", href: "/suppliers" }]}
      >
        <div className="btn-row" style={{ marginTop: 28 }}>
          <Link className="btn" href="/suppliers/apply">Apply to join our supply chain</Link>
          <Link className="btn btn--ghost" href="/suppliers/code-and-policies">Read our supplier code</Link>
        </div>
        <p className="hero__meta"><span>Already approved?</span><span><Link href="/suppliers/account">Supplier sign in</Link></span></p>
      </PageHero>

      <section className="section" aria-labelledby="why-title">
        <div className="container">
          <p className="label">Why work with us</p>
          <h2 id="why-title">Why work with us</h2>
          <div className="cards" style={{ marginTop: 32 }}>
            {why.map((w) => (
              <div className="card" key={w.title} data-reveal>
                <h3>{w.title}</h3>
                <p>{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--concrete" aria-labelledby="expect-title">
        <div className="container grid">
          <div className="span-4">
            <p className="label">What we expect</p>
            <h2 id="expect-title">What we expect</h2>
          </div>
          <div className="span-7">
            <p className="lede" style={{ color: "var(--ink)" }}>
              Safe, competent people. Insurance in date. Honest pricing. And every job run in the project&apos;s platform —
              CONSTRUX or VERYX — because that&apos;s how we pay quickly and prove quality to our clients.
            </p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="wanted-title">
        <div className="container">
          <p className="label">Who we&apos;re looking for</p>
          <h2 id="wanted-title">Who we&apos;re looking for</h2>
          <ul className="anchor-list wanted-list">
            {wanted.map((w) => <li key={w}>{w}</li>)}
          </ul>
          <p className="small" style={{ marginTop: 20 }}>
            <em>
              Site-services suppliers (cabins, welfare, security, cleaning and more) apply through{" "}
              <a href={group.etablixUrl} rel="noopener">etablix.com<span className="visually-hidden"> (separate website)</span></a>.
            </em>
          </p>
        </div>
      </section>

      <section className="section section--dark drawing-grid" aria-labelledby="how-title">
        <div className="container grid">
          <div className="span-4">
            <p className="label">How it works</p>
            <h2 id="how-title">How it works</h2>
          </div>
          <div className="span-7">
            <ol className="steps">
              {how.map((h) => (
                <li key={h.title}><h3>{h.title}</h3><p>{h.text}</p></li>
              ))}
            </ol>
            <Link className="btn" href="/suppliers/apply">Apply to join our supply chain</Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="minimums">
        <div className="container grid">
          <div className="span-5">
            <p className="label">Group minimums</p>
            <h2 id="minimums">Checked automatically when you apply</h2>
            <p className="muted">We never ask for bank details on the application. After approval we request them through your signed-in supplier account and confirm them by phone on a number we already hold.</p>
          </div>
          <div className="span-7">
            <dl className="dl">
              <dt>Employer&apos;s liability</dt><dd>{gbp(minimums.employersLiability)}</dd>
              <dt>Public liability</dt><dd>{gbp(minimums.publicLiability)} ({gbp(minimums.publicLiabilityPowerHighway)} for power and highway work)</dd>
              <dt>Professional indemnity</dt><dd>{gbp(minimums.professionalIndemnityDesigners)} for designers and consultants</dd>
              <dt>Health and safety</dt><dd>A valid SSIP certificate, Constructionline Gold, or equivalent evidence</dd>
              <dt>Company status</dt><dd>Active at Companies House, with no insolvency status. Sole traders and partnerships are checked by phone instead.</dd>
            </dl>
          </div>
        </div>
      </section>

      <CtaBand title="Paid in 30 days. A pipeline you can plan around." text="Apply online in about 20 minutes. A decision within 10 working days." href="/suppliers/apply" cta="Apply to join our supply chain" secondary={{ href: "/suppliers/account", label: "Supplier sign in" }} />
    </>
  );
}
