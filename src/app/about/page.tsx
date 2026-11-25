import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import styles from "@/components/home/about.module.css";
import { legalEntityName, structureCompanies } from "@/components/home/structureData";
import { GroupStructure } from "@/components/modules/GroupStructure";
import { PageHero } from "@/components/PageHero";
import { group, leadership } from "@/content/settings";
import { getCompanies, getLegalEntity, showDrafts } from "@/lib/cms";

export const metadata: Metadata = {
  title: "About the group",
  description:
    "Who we are: the structure of Nseya Group Construction, its founder Justin Nseya MCIOB, our values and the legal entity you contract with.",
  alternates: { canonical: "/about" },
};

/**
 * DRAFT pull quote for Justin to replace with his own words (spec 7a: "a pull
 * quote from Justin"). Never rendered in production; shown on staging only
 * when SHOW_DRAFTS is set, with a draft label.
 */
const DRAFT_PULL_QUOTE = "[Draft for Justin to write] Why I started the group, in one or two sentences, in my own words.";

const values = [
  { title: "Safe sites, every day", text: "No job is worth an injury. Every site has a named supervisor, a plan and the right training, under CDM 2015." },
  { title: "Honest numbers", text: "We report cost, programme and risk from the same data the site team uses, and we say when something is late." },
  { title: "Pay people on time", text: "Suppliers and subcontractors are paid within 30 days. Payment applications go through one platform, so nothing gets lost." },
  { title: "Bring people into the industry", text: "We plan for half of our staff to be graduates, and we recruit through apprenticeships, Jobcentre Plus and local routes." },
  { title: "One system, one record", text: "Projects run in CONSTRUX and the business runs in VERYX, so clients, staff and suppliers all see the same information." },
];

export default function AboutPage() {
  const entity = getLegalEntity();
  const companies = getCompanies();
  const drafts = showDrafts();

  return (
    <div data-company="group">
      <PageHero
        crumbs={[{ name: "About", href: "/about" }]}
        label="About the group"
        title="A new construction group, built to be easy to buy from"
        lede={`${group.name} brings together three companies under one leadership team. We start trading in January ${group.tradingStart}.`}
      />

      {/* Mission */}
      <section className="section" aria-labelledby="mission-title">
        <div className="container grid">
          <div className="span-4">
            <p className="label">Mission</p>
            <h2 id="mission-title">What we are here to do</h2>
          </div>
          <div className="span-7">
            <p className="lede" style={{ color: "var(--ink)" }}>
              To plan, set up and build projects for public and private clients, in energy, housing, data centres and commercial
              property, with one accountable
              team, a vetted supply chain and one set of project data.
            </p>
            <p>
              The three companies cover the life of a project. Nseya Consultancy helps clients decide, plan and control it.
              ETABLIX sets up and runs the site and the welfare a workforce needs. Nseya Construction builds it. A client can
              use one company or all three.
            </p>
          </div>
        </div>
      </section>

      {/* Structure */}
      <section className="section section--concrete" aria-labelledby="structure-title">
        <div className="container">
          <p className="label">Group structure</p>
          <h2 id="structure-title">Three companies and the services they share</h2>
          <p className="muted" style={{ marginBottom: 32 }}>
            Until the three companies are incorporated, all work is contracted through {entity.legalName}, company number{" "}
            {entity.companyNumber}. The diagram shows the group as it will trade, with the shared services that support all
            three companies.
          </p>
          <GroupStructure companies={structureCompanies()} legalEntity={legalEntityName()} />
        </div>
      </section>

      {/* Values */}
      <section className="section" aria-labelledby="values-title">
        <div className="container grid">
          <div className="span-4">
            <p className="label">Values</p>
            <h2 id="values-title">How we work</h2>
            <p className="muted">Five commitments that clients, staff and suppliers can hold us to.</p>
          </div>
          <ol className={`steps span-7 ${styles.values}`}>
            {values.map((v) => (
              <li key={v.title} data-reveal>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Leadership */}
      <section className="section section--dark drawing-grid" aria-labelledby="leadership-title">
        <div className="container grid">
          <div className="span-5">
            <p className="label">Leadership</p>
            <h2 id="leadership-title">
              {leadership.name} {leadership.postNominals}
            </h2>
            <p className={styles.role}>{leadership.role}</p>
            <p>
              Justin founded the group and leads all three companies. {leadership.postNominals === "MCIOB" && "He is a Member of the Chartered Institute of Building."}
            </p>
            <p className="small">
              Project experience listed here is Justin&apos;s own, from roles before the group was formed. It is not the
              group&apos;s track record.
            </p>
          </div>
          <div className={styles.rightCol}>
            {leadership.cv.length > 0 ? (
              <ul className={styles.cv}>
                {leadership.cv.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : (
              drafts && (
                <div className="notice notice--draft" style={{ color: "var(--ink)" }}>
                  <p><strong>Draft (staging only):</strong> Justin to add his factual CV lines in the leadership settings. Nothing is shown here in production until they exist.</p>
                </div>
              )
            )}
            {drafts && (
              <blockquote className="pull-quote" style={{ marginTop: 32 }}>
                <p style={{ margin: 0 }}>{DRAFT_PULL_QUOTE}</p>
                <cite>{leadership.name}, {leadership.role} · draft, not shown in production</cite>
              </blockquote>
            )}
          </div>
        </div>
      </section>

      {/* Start of trading */}
      <section className="section section--tight" aria-labelledby="trading-title">
        <div className="container grid">
          <div className="span-8">
            <p className="label">Start of trading</p>
            <h2 id="trading-title">We start trading in January {group.tradingStart}</h2>
            <p>
              The group has no trading history, turnover or completed projects yet, so this site does not show any. Accreditations
              are listed only once certificates are held, and client logos only with written permission. Case studies will
              be added as our first jobs complete.
            </p>
            <p>
              Until then, our existing websites stay live: <a href={group.etablixUrl} rel="noopener">etablix.com</a> for ETABLIX,
              and <a href={group.legacyResidentialUrl} rel="noopener">jnseya.co.uk</a> for home renovations and extensions,
              which will move to this site during {group.tradingStart}.
            </p>
          </div>
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

      <CtaBand
        title="Talk to the group"
        text="Send an enquiry and the right company will reply within one working day."
        href="/contact"
        cta="Contact us"
      />
    </div>
  );
}
