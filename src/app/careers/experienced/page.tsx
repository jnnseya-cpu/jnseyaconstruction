import type { Metadata } from "next";
import Link from "next/link";
import { CareersNav } from "@/components/careers/CareersNav";
import styles from "@/components/careers/careers.module.css";
import { CtaBand } from "@/components/CtaBand";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Experienced roles",
  description: "Project, site, HSEQ, commercial and MEP roles with Nseya Groupe Construction in Birmingham, with growth shares for director roles.",
  alternates: { canonical: "/careers/experienced" },
};

const roles = [
  { title: "Project managers", text: "Run projects from contract award to handover under NEC4 and JCT, with programme, cost and risk in CONSTRUX." },
  { title: "Site managers", text: "Lead the site team and supply chain day to day, and hold the site to CDM 2015." },
  { title: "HSEQ", text: "Set and audit health, safety, environment and quality standards across the three companies." },
  { title: "Commercial", text: "Quantity surveyors and commercial managers for valuations, change, subcontract accounts and final accounts." },
  { title: "MEP", text: "Mechanical, electrical and HVAC engineers and managers for building, power and data-centre work." },
];

export default function ExperiencedPage() {
  return (
    <div data-company="group">
      <PageHero
        crumbs={[{ name: "Careers", href: "/careers" }, { name: "Experienced roles", href: "/careers/experienced" }]}
        label="Route 03 · Experienced roles"
        title="Help build a construction group from the start"
        lede="We are hiring the people who will lead our projects, and train the graduates and apprentices who join after them."
      >
        <div className="btn-row" style={{ marginTop: 24 }}>
          <Link className="btn" href="/careers/vacancies?route=experienced">See experienced vacancies</Link>
          <Link className="btn btn--ghost" href="/careers/talent-pool">Register your interest</Link>
        </div>
      </PageHero>
      <CareersNav current="/careers/experienced" />

      <section className="section">
        <div className="container">
          <p className="label">Leadership and specialist roles</p>
          <h2>Roles we expect to hire</h2>
          <div className="table-wrap" style={{ marginTop: 24 }}>
            <table className="table">
              <thead><tr><th scope="col">Role</th><th scope="col">What the job involves</th></tr></thead>
              <tbody>
                {roles.map((r) => (
                  <tr key={r.title}><th scope="row">{r.title}</th><td>{r.text}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section section--concrete">
        <div className={`container ${styles.twoCol}`}>
          <div>
            <p className="label">What we offer</p>
            <h2>A real stake in what you build</h2>
            <ul>
              <li><strong>Growth shares for director roles.</strong> Directors share in the value they help create.</li>
              <li><strong>A path to ownership.</strong> Senior people can become part-owners as the group grows.</li>
              <li><strong>CONSTRUX tools.</strong> Programme, cost, risk and supply chain in one system, so you spend less time on spreadsheets.</li>
              <li><strong>A vetted supply chain.</strong> About 80% of work is delivered by subcontractors and suppliers we have checked.</li>
            </ul>
          </div>
          <div>
            <p className="label">Mentoring duties</p>
            <h2>Everyone senior mentors someone</h2>
            <p>Half of our planned hires are graduates, and a fifth come from people who were out of work, education or training. Every experienced hire:</p>
            <ul>
              <li>mentors at least one graduate, apprentice or trainee</li>
              <li>meets them regularly and helps with their training record</li>
              <li>takes them on site and into meetings, so they learn by doing</li>
            </ul>
          </div>
        </div>
      </section>

      <CtaBand
        title="No role that fits yet?"
        text="Tell us what you do and we will contact you when one opens."
        href="/careers/talent-pool"
        cta="Join the talent pool"
      />
    </div>
  );
}
