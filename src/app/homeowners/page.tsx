import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { homeownerArea, homeownerEnquiryHref, homeownerPromises, homeownerServices } from "@/content/homeowners";
import { faqSchema, serviceSchema } from "@/lib/schema";
import styles from "./homeowners.module.css";

/* HO-01 (spec 5c). Copy follows section 7b; prices TO CONFIRM in src/content/homeowners.ts. */

export const metadata: Metadata = {
  title: { absolute: "Home extension advice, Birmingham | Nseya Consultancy" },
  description: "Independent, fixed-fee advice before you build an extension, loft or renovation. Feasibility Report £595, report in 5 working days.",
  alternates: { canonical: "/homeowners" },
};

const BOOK = homeownerEnquiryHref("feasibility-report");

const steps = [
  { title: "Ask", text: "Send a short enquiry. We confirm the fixed fee, the visit date and our terms in writing within one working day." },
  { title: "Visit", text: "We visit your home, look at the site and go through your plans and any quotes." },
  { title: "Report", text: "Your written report within five working days of the visit." },
  { title: "Call", text: "A 30-minute call to walk you through it and answer your questions." },
];

const faqs = [
  {
    q: "I already have a builder's quote. Do I still need this?",
    a: "That is the best time to book. We check the quote against the work, the likely cost range and the risks, so you know whether it is fair before you sign.",
  },
  { q: "Is this a building survey?", a: homeownerPromises.notA },
  { q: "Will you try to sell me a build?", a: homeownerPromises.independence },
  { q: "What if the report does not answer my question?", a: homeownerPromises.guarantee },
  { q: "Which areas do you cover?", a: `${homeownerArea}. Enter your postcode when you book and we will confirm.` },
  {
    q: "Can I cancel?",
    a: "Yes. You have 14 days to cancel after you agree to go ahead. If you ask us to start sooner, we charge fairly for work already done. Our written terms come with your confirmation.",
  },
];

export default function HomeownersPage() {
  return (
    <div data-company="consultancy">
      <PageHero
        crumbs={[{ name: "Homeowners", href: "/homeowners" }]}
        label="For homeowners · Nseya Consultancy"
        title="Independent building advice before you spend £50k"
        lede="Planning an extension, a loft conversion or a major renovation, or buying a home to improve? Get builder-honest advice for a fixed fee, in writing, in five working days."
      >
        <div className="btn-row" style={{ marginTop: 24 }}>
          <Link className="btn" href={BOOK}>Book a Feasibility Report</Link>
          <a className="btn btn--ghost" href="#services">See all four services</a>
        </div>
        <p className="hero__meta"><span>{homeownerArea}</span><span>Fixed fees, agreed in writing</span><span>Report in 5 working days</span></p>
      </PageHero>

      {/* Services */}
      <section className="section" id="services" aria-labelledby="services-title">
        <div className="container">
          <p className="label">Four services</p>
          <h2 id="services-title">Start small. Go further only if you need to.</h2>
          <ol className={styles.ladder}>
            {homeownerServices.map((s, i) => (
              <li key={s.slug} id={s.slug} className={s.core ? styles.core : undefined} data-reveal>
                <span className={styles.step}>{String(i + 1).padStart(2, "0")}{s.core ? " · Most popular" : ""}</span>
                <h3>{s.name}</h3>
                <p className={styles.price}>{s.priceLabel}</p>
                <p>{s.gets}</p>
                <dl className={styles.meta}>
                  <dt>Delivery</dt><dd>{s.delivery}</dd>
                  <dt>Next step</dt><dd>{s.next}</dd>
                </dl>
                <Link className={s.core ? "btn" : "btn btn--ghost"} href={homeownerEnquiryHref(s.slug)}>Book {s.name}</Link>
                <JsonLd data={serviceSchema(s.name, s.gets, "Nseya Consultancy", `/homeowners#${s.slug}`)} />
              </li>
            ))}
          </ol>
          <p className="small muted" style={{ marginTop: 16 }}>Prices for {homeownerArea}.</p>
        </div>
      </section>

      {/* How it works */}
      <section className="section section--concrete" aria-labelledby="how-title">
        <div className="container grid">
          <div className="span-4">
            <p className="label">How it works</p>
            <h2 id="how-title">Ask, visit, report, call</h2>
          </div>
          <ol className="span-7 steps">
            {steps.map((s) => (
              <li key={s.title}><h3>{s.title}</h3><p>{s.text}</p></li>
            ))}
          </ol>
        </div>
      </section>

      {/* Promise, guarantee, boundaries */}
      <section className="section section--dark drawing-grid" aria-labelledby="promise-title">
        <div className="container">
          <p className="label">Our promise</p>
          <h2 id="promise-title">Honest advice, or your money back</h2>
          <div className="cards" style={{ marginTop: 32 }}>
            <div className="card"><h3>Promise</h3><p>{homeownerPromises.promise}</p></div>
            <div className="card"><h3>Guarantee</h3><p>{homeownerPromises.guarantee}</p></div>
            <div className="card"><h3>Independence</h3><p>{homeownerPromises.independence}</p></div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="not-title">
        <div className="container grid">
          <div className="span-4">
            <p className="label">What a report is not</p>
            <h2 id="not-title">What a report is not</h2>
          </div>
          <div className="span-7">
            <p className="lede" style={{ color: "var(--ink)" }}>{homeownerPromises.notA}</p>
            {/* Sample report pages (spec HO-01) go here once a real, approved sample exists, labelled "Sample". */}
          </div>
        </div>
      </section>

      {/* Building it */}
      <section className="section section--concrete" aria-labelledby="build-title">
        <div className="container grid">
          <div className="span-6">
            <p className="label">Ready to build?</p>
            <h2 id="build-title">Want us to build it too?</h2>
            <p>
              Nseya Construction builds extensions, conversions and new homes, with a written fixed-price quote. It is your choice,
              disclosed in writing, and our quote is compared fairly against others.
            </p>
            <Link className="link-arrow" href="/construction#homeowners">Nseya Construction for homeowners</Link>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section" aria-labelledby="faq-title">
        <div className="container grid">
          <div className="span-4">
            <p className="label">Questions</p>
            <h2 id="faq-title">Questions homeowners ask</h2>
          </div>
          <div className="span-8 faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <div><p>{f.a}</p></div>
              </details>
            ))}

          </div>
          <JsonLd data={faqSchema(faqs)} />
        </div>
      </section>

      <CtaBand title="Know before you build." text="Feasibility Report, £595. Your report within five working days of the visit." href={BOOK} cta="Book a Feasibility Report" />
    </div>
  );
}
