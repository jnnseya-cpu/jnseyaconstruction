import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { PageHero } from "@/components/PageHero";
import { categories } from "@/lib/suppliers/catalogue";
import { gbp, minimums } from "@/lib/suppliers/minimums";

export const metadata: Metadata = {
  title: "Suppliers and subcontractors",
  description: "Join the Nseya Groupe Construction supply chain: 30-day payment, a free seat on the project platform, and a clear online vetting process.",
  alternates: { canonical: "/suppliers" },
};

const workflow = [
  { stage: "Submitted", what: "You get a reference number (for example SUP-2027-0001). Your supplier record is created and our supply-chain coordinator is alerted.", who: "System", time: "Instant" },
  { stage: "Automatic checks", what: "Companies House status, documents present, expiry dates in the future, insurance limits against our minimums.", who: "System", time: "Instant" },
  { stage: "Review", what: "The coordinator checks your evidence and references. Subcontracts over " + gbp(minimums.creditCheckOver) + " also get a credit check.", who: "Supply-chain coordinator", time: "10 working days" },
  { stage: "Decision", what: "Approved, approved with conditions (for example jobs under £50,000 only), more information needed, or not approved. Each comes with a reason by email.", who: "Coordinator; HSEQ manager signs off health and safety", time: "Same day as review" },
  { stage: "Onboarding", what: "When you win your first package, we set up your seat in the project's CONSTRUX or VERYX and book supervisor training.", who: "Project manager", time: "5 working days from award" },
  { stage: "Monitoring", what: "Reminders 30 and 7 days before any certificate or insurance expires. An expired document suspends you from new awards until it is replaced. Quarterly credit re-check and a performance score after each job.", who: "System and coordinator", time: "Ongoing" },
];

export default function SuppliersPage() {
  return (
    <>
      <PageHero
        label="Suppliers and subcontractors"
        title="Work with us"
        lede="About 80% of our work is delivered by subcontractors and suppliers. We vet them as carefully as we recruit staff, and we pay them on time."
        crumbs={[{ name: "Suppliers", href: "/suppliers" }]}
      >
        <div className="btn-row" style={{ marginTop: 28 }}>
          <Link className="btn" href="/suppliers/apply">Apply to join</Link>
          <Link className="btn btn--ghost" href="/suppliers/account">Supplier sign in</Link>
        </div>
      </PageHero>

      <section className="section">
        <div className="container grid">
          <div className="span-5">
            <p className="label">Why work with us</p>
            <h2>What you get</h2>
            <p className="muted">We start trading in 2027. These are the terms every approved supplier works on from day one.</p>
          </div>
          <div className="span-7">
            <ol className="steps">
              <li><h3>Payment in 30 days</h3><p>Valid payment applications are paid within 30 days. No pay-when-paid.</p></li>
              <li><h3>A free seat on the project&apos;s platform</h3><p>You get a free seat in CONSTRUX or VERYX for each project you work on, with training for your supervisor.</p></li>
              <li><h3>A steady pipeline, shared early</h3><p>From spring 2027, approved suppliers will see work packages as they come to market, by region and trade, and can express interest.</p></li>
            </ol>
          </div>
        </div>
      </section>

      <section className="section section--concrete" aria-labelledby="platform-rule">
        <div className="container grid">
          <div className="span-5">
            <p className="label">The platform rule</p>
            <h2 id="platform-rule">One rule we do not bend</h2>
          </div>
          <div className="span-7">
            <p className="pull-quote" style={{ fontWeight: 500 }}>
              Every subcontractor must work in CONSTRUX or VERYX, whichever the project uses. Payment applications are accepted only through it.
            </p>
            <p style={{ marginTop: 20 }}>This keeps drawings, permits, inspections and valuations in one place, so you are paid on evidence rather than paperwork chased by email.</p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="expect">
        <div className="container">
          <p className="label">What we expect</p>
          <h2 id="expect">What we expect from you</h2>
          <div className="cards" style={{ marginTop: 28 }}>
            {[
              ["Safety", "Safe systems of work, competent and carded operatives, and a valid SSIP certificate or equivalent evidence."],
              ["Quality", "Work right first time, inspected and recorded in the project platform."],
              ["The supplier code", "Our supplier code covers conduct, environment, data and how we resolve disputes."],
              ["No modern slavery", "Fair recruitment, no worker fees, and checks in your own supply chain."],
              ["Fair payment", "Pay your own suppliers and operatives on terms at least as good as ours."],
            ].map(([t, p]) => (
              <div className="card" key={t}><h3 style={{ fontSize: "1.125rem" }}>{t}</h3><p>{p}</p></div>
            ))}
          </div>
          <p style={{ marginTop: 24 }}><Link className="link-arrow" href="/suppliers/code-and-policies">Read the supplier code and policies</Link></p>
        </div>
      </section>

      <section className="section section--concrete" aria-labelledby="categories">
        <div className="container">
          <p className="label">Who can apply</p>
          <h2 id="categories">Categories we want to hear from</h2>
          <div className="table-wrap" style={{ marginTop: 24 }}>
            <table className="table">
              <thead><tr><th scope="col">Category</th><th scope="col">Examples</th><th scope="col">Register on</th></tr></thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}><th scope="row">{c.name}</th><td>{c.examples.join(", ")}</td><td><Link href="/suppliers/apply">This site</Link></td></tr>
                ))}
                <tr data-company="etablix">
                  <th scope="row">Site-services suppliers for ETABLIX</th>
                  <td>Cabins, welfare, security, cleaning and the other ETABLIX site-services trades</td>
                  <td><a href="https://etablix.com" rel="noopener">etablix.com <span aria-hidden="true">↗</span><span className="visually-hidden">(separate website)</span></a></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="notice" data-company="etablix" style={{ marginTop: 24 }}>
            <p><strong>Site-services suppliers register on etablix.com.</strong> ETABLIX has its own website and supplier registration. Both registrations feed the same supplier records, so you only need to register once.</p>
            <p><a className="link-arrow link-external" href="https://etablix.com" rel="noopener">Visit etablix.com<span className="visually-hidden"> (separate website)</span></a></p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="vetting">
        <div className="container">
          <p className="label">How vetting works</p>
          <h2 id="vetting">From application to first job</h2>
          <p className="lede">Apply online in six short steps. With your documents ready, it takes about 20 minutes on a phone or computer, and you can stop and finish later.</p>
          <div className="table-wrap" style={{ marginTop: 24 }}>
            <table className="table">
              <thead><tr><th scope="col">Stage</th><th scope="col">What happens</th><th scope="col">Who acts</th><th scope="col">Target time</th></tr></thead>
              <tbody>{workflow.map((w) => (<tr key={w.stage}><th scope="row">{w.stage}</th><td>{w.what}</td><td>{w.who}</td><td className="mono">{w.time}</td></tr>))}</tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section section--concrete" aria-labelledby="minimums">
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
              <dt>Company status</dt><dd>Active at Companies House, with no insolvency status</dd>
            </dl>
          </div>
        </div>
      </section>

      <CtaBand title="Ready to apply?" text="Six steps. Your progress is saved, and we reply with a decision within 10 working days." href="/suppliers/apply" cta="Apply to join" secondary={{ href: "/suppliers/account", label: "Supplier sign in" }} />
    </>
  );
}
