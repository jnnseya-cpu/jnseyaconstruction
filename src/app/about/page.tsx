import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/home/about.module.css";
import { legalEntityName, structureCompanies } from "@/components/home/structureData";
import { GroupStructure } from "@/components/modules/GroupStructure";
import { CtaBand } from "@/components/CtaBand";
import { PageHero } from "@/components/PageHero";
import { group, leadership } from "@/content/settings";
import { getCompanies, getLegalEntity } from "@/lib/cms";

/* Copy: Phase 1 copy deck, revision 1 (25 Nov 2026), About the group. */

export const metadata: Metadata = {
  title: { absolute: "About Nseya Group Construction | Birmingham" },
  description:
    "A Birmingham group of three companies: consultancy, site services and construction. Led by Justin Nseya MCIOB, chartered construction manager.",
  alternates: { canonical: "/about" },
};

const values = [
  { title: "Certainty.", text: "We promise what we can measure, and we measure what we promise." },
  { title: "Openness.", text: "You see the same numbers we see, every week." },
  {
    title: "Opportunity.",
    text: "Half of our people will be graduates who were still waiting for a break, and one in five will come from local young people, apprenticeships and Jobcentre referrals.",
  },
];

export default function AboutPage() {
  const entity = getLegalEntity();
  const companies = getCompanies();

  return (
    <div data-company="group">
      <PageHero
        crumbs={[{ name: "About", href: "/about" }]}
        label="About the group"
        title="Built by someone who has delivered the hard jobs."
        lede={`${group.name} is a Birmingham group of three companies — consultancy, site services and construction — created for one reason: clients deserve certainty, and most projects don't give them any.`}
      />

      {/* The founder */}
      <section className="section section--dark drawing-grid" aria-labelledby="leadership-title">
        <div className="container grid">
          <div className="span-5">
            <p className="label">The founder</p>
            <h2 id="leadership-title">
              {leadership.name} {leadership.postNominals}
            </h2>
            <p className={styles.role}>{leadership.role}</p>
          </div>
          <div className={styles.rightCol}>
            {leadership.cv.map((line) => (
              <p key={line} className="lede">{line}</p>
            ))}
            <p>
              Justin has written single-contractor procurement packages for site management and workforce villages on major grid
              projects. He knows what clients ask contractors for, because he has written the questions.
            </p>
            <p className="small">
              <em>
                The projects above are Justin&apos;s personal experience. {group.name} starts trading in January {group.tradingStart} and
                will publish its own case studies as each job completes.
              </em>
            </p>
          </div>
        </div>
      </section>

      {/* How the group works */}
      <section className="section section--concrete" aria-labelledby="structure-title">
        <div className="container">
          <p className="label">How the group works</p>
          <h2 id="structure-title">How the group works</h2>
          <p className="lede" style={{ color: "var(--ink)", marginBottom: 32 }}>
            Consultancy wins the brief. ETABLIX runs the site. Construction delivers the build. Each company is a separate
            business with its own insurance and accountability, and a strict rule: Nseya Construction never bids a tender that
            Nseya Consultancy runs for a client.
          </p>
          <GroupStructure companies={structureCompanies()} legalEntity={legalEntityName()} />
        </div>
      </section>

      {/* What we stand for */}
      <section className="section" aria-labelledby="values-title">
        <div className="container grid">
          <div className="span-4">
            <p className="label">Values</p>
            <h2 id="values-title">What we stand for</h2>
          </div>
          <ul className={`span-7 ${styles.valuesList}`}>
            {values.map((v) => (
              <li key={v.title} data-reveal>
                <strong>{v.title}</strong> {v.text}
              </li>
            ))}
          </ul>
        </div>
        <div className="container btn-row" style={{ marginTop: 32 }}>
          <Link className="btn" href="/contact">Work with us</Link>
          <Link className="btn btn--ghost" href="/careers">Join us</Link>
        </div>
      </section>

      {/* Company details */}
      <section className="section section--concrete" id="company-details" aria-labelledby="details-title">
        <div className="container grid">
          <div className="span-4">
            <p className="label">For buyers</p>
            <h2 id="details-title">Company details</h2>
            <p className="muted">The legal entity that contracts with you, as required by the Companies Act 2006.</p>
          </div>
          <div className="span-7">
            <dl className="dl">
              <dt>Legal name</dt>
              <dd>{entity.legalName}</dd>
              <dt>Company number</dt>
              <dd className="mono">{entity.companyNumber}</dd>
              <dt>Registration</dt>
              <dd>{entity.placeOfRegistration}</dd>
              <dt>Registered office</dt>
              <dd>{entity.registeredOffice}</dd>
              {entity.icoRegistration && (
                <>
                  <dt>ICO registration</dt>
                  <dd className="mono">{entity.icoRegistration}</dd>
                </>
              )}
              {entity.tradingAs && (
                <>
                  <dt>Trading names</dt>
                  <dd>{entity.tradingAs}</dd>
                </>
              )}
              <dt>Group companies</dt>
              <dd>{companies.map((c) => c.name).join(", ")} (to be incorporated)</dd>
            </dl>
            <p style={{ marginTop: 24 }}>
              <Link className="link-arrow" href="/suppliers/code-and-policies">Policies and supplier code</Link>
            </p>
          </div>
        </div>
      </section>

      <CtaBand title="Have a project in mind?" text="Tell us about it today and get a fixed-fee proposal within five working days." href="/contact" cta="Start your enquiry" />
    </div>
  );
}
