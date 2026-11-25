import type { Metadata } from "next";
import Link from "next/link";
import { CareersNav } from "@/components/careers/CareersNav";
import { CtaBand } from "@/components/CtaBand";
import { JsonLd } from "@/components/JsonLd";
import { GraduateJourney } from "@/components/modules/GraduateJourney";
import { PageHero } from "@/components/PageHero";
import type { Faq } from "@/content/types";
import { faqSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Nseya Graduate Academy",
  description: "A paid two-year construction graduate programme in Birmingham for graduates of any degree still looking for a graduate job.",
  alternates: { canonical: "/careers/graduate-academy" },
};

/** TO CONFIRM (Justin): starting salary range and intake dates before launch. */
/** TO CONFIRM (copy deck sign-off): graduate starting salary. */
const SALARY_RANGE = "£28,000 a year";
const INTAKES = ["September 2027 (planned)", "January 2028 (planned)"];

const faqs: Faq[] = [
  {
    q: "Does my degree have to be in construction or engineering?",
    a: "No. Any degree subject is welcome. We teach you the construction knowledge you need. What matters is that you are reliable, curious and comfortable with numbers.",
  },
  {
    q: "I graduated more than a year ago. Can I still apply?",
    a: "Yes. The Academy is for graduates who are still looking for a graduate job three months or more after finishing their degree. There is no upper limit.",
  },
  {
    q: "Is it paid?",
    a: `Yes. It is a paid job from day one. The starting salary is ${SALARY_RANGE}.`,
  },
  {
    q: "Do I need a CV?",
    a: "No. You can upload a CV, or answer three short questions instead. Both are treated the same.",
  },
  {
    q: "Will I work on site?",
    a: "Yes, for part of the programme. You will spend time in the office and on site across the three rotations. We pay for your CSCS card and safety training first.",
  },
  {
    q: "What happens at the end of the two years?",
    a: "We aim to offer every graduate who completes the programme a permanent role, and to keep supporting you towards chartered membership.",
  },
];

export default function GraduateAcademyPage() {
  return (
    <div data-company="group">
      <PageHero
        crumbs={[{ name: "Careers", href: "/careers" }, { name: "Graduate Academy", href: "/careers/graduate-academy" }]}
        label="Route 01 · Graduate Academy"
        title="Nseya Graduate Academy"
        lede="A paid two-year programme for graduates who are still looking for a graduate job three months or more after finishing their degree. Any degree subject."
      >
        <div className="btn-row" style={{ marginTop: 24 }}>
          <Link className="btn" href="/careers/apply?route=graduate">Apply to the Academy</Link>
          <Link className="btn btn--ghost" href="#journey">See the two years</Link>
        </div>
      </PageHero>
      <CareersNav current="/careers/graduate-academy" />

      <section className="section">
        <div className="container grid">
          <div className="span-6">
            <p className="label">Who it is for</p>
            <h2>You have a degree, but not yet the job</h2>
            <p>Many good graduates do not get onto a graduate scheme first time. The Academy is for you if:</p>
            <ul>
              <li>you have finished a degree in any subject, and</li>
              <li>you are still looking for a graduate job three months or more after finishing, and</li>
              <li>you want a career managing building, energy or infrastructure projects.</li>
            </ul>
          </div>
          <div className="span-5 start-8">
            <table className="table" style={{ border: "1px solid var(--line)" }}>
              <caption className="visually-hidden">Graduate Academy at a glance</caption>
              <tbody>
                <tr><th scope="row">Length</th><td>Two years, three rotations</td></tr>
                <tr><th scope="row">Starting salary</th><td>{SALARY_RANGE}</td></tr>
                <tr><th scope="row">Location</th><td>Birmingham and project sites</td></tr>
                <tr><th scope="row">Intakes</th><td>{INTAKES.join("; ")}</td></tr>
                <tr><th scope="row">Courses</th><td>CSCS, SSSTS, SMSTS</td></tr>
                <tr><th scope="row">Chartered routes</th><td>CIOB, RICS, ICE, IET</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section section--concrete" id="journey">
        <div className="container">
          <p className="label">The journey</p>
          <h2>Month by month, from day one to chartership</h2>
          <p className="lede" style={{ marginBottom: 32 }}>
            You spend about eight months in each of the three companies, so you see a project from first study to handover.
          </p>
          <GraduateJourney />
        </div>
      </section>

      <section className="section">
        <div className="container grid">
          <div className="span-6">
            <p className="label">Qualifications</p>
            <h2>What you will gain</h2>
            <dl className="dl">
              <dt>CSCS</dt><dd>Construction Skills Certification Scheme card, needed to work on most UK sites.</dd>
              <dt>SSSTS</dt><dd>Site Supervisors&apos; Safety Training Scheme (CITB, two days).</dd>
              <dt>SMSTS</dt><dd>Site Management Safety Training Scheme (CITB, five days).</dd>
            </dl>
          </div>
          <div className="span-5 start-8">
            <p className="label">Chartered routes</p>
            <h2>Pick the body that fits you</h2>
            <ul>
              <li><strong>CIOB</strong>: Chartered Institute of Building, for construction and project management.</li>
              <li><strong>RICS</strong>: Royal Institution of Chartered Surveyors, for cost and commercial.</li>
              <li><strong>ICE</strong>: Institution of Civil Engineers, for civils and infrastructure.</li>
              <li><strong>IET</strong>: Institution of Engineering and Technology, for power and electrical.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section section--concrete">
        <div className="container grid">
          <div className="span-4">
            <p className="label">Questions</p>
            <h2>Frequently asked questions</h2>
          </div>
          <div className="span-8 faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <div><p>{f.a}</p></div>
              </details>
            ))}
          </div>
        </div>
        <JsonLd data={faqSchema(faqs)} />
      </section>

      <CtaBand
        title="Apply to the Graduate Academy"
        text="It takes about five minutes on a phone. You do not need a CV."
        href="/careers/apply?route=graduate"
        cta="Apply now"
        secondary={{ href: "/careers/vacancies?route=graduate", label: "See Academy vacancies" }}
      />
    </div>
  );
}
