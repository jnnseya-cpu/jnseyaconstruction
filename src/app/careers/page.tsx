import type { Metadata } from "next";
import Link from "next/link";
import { CareersNav } from "@/components/careers/CareersNav";
import styles from "@/components/careers/careers.module.css";
import { VacancyCard } from "@/components/careers/VacancyCard";
import { PageHero } from "@/components/PageHero";
import { getOpenVacancies, showDrafts } from "@/lib/cms";

export const revalidate = 3600; // vacancy count and closing dates refresh hourly

/* Copy: Phase 1 copy deck, revision 1 (25 Nov 2026), Careers and the Nseya Graduate Academy. */

export const metadata: Metadata = {
  title: { absolute: "Careers at Nseya | Graduate Academy and site roles" },
  description: "Graduated and still waiting for a break? A paid two-year programme with a route to chartership. Apply in 5 minutes, no CV needed.",
  alternates: { canonical: "/careers" },
};

/** Graduate starting salary: Confirmed by Justin, 26 Nov 2026. */
const SALARY = "£28,000";
const APPLY_NO_CV = "/careers/apply?route=graduate&mode=no-cv";

const getList: [string, string][] = [
  ["A real job, paid from day one.", ` Starting salary ${SALARY}.`],
  ["Three rotations", " across consultancy, site services and construction."],
  ["Site qualifications:", " SSSTS or SMSTS in your first year."],
  ["A route to chartership", " with CIOB, RICS, ICE or IET."],
  ["A named mentor", " and the same digital tools our managers use."],
];

const years = [
  { when: "Months 1–3", what: "Induction, site safety, CONSTRUX and BIM basics." },
  { when: "Months 4–12", what: "First rotation, on live projects." },
  { when: "Year 2", what: "Two more rotations, your own work package, and your chartership plan." },
];

export default function CareersPage() {
  const open = getOpenVacancies();
  return (
    <div data-company="group">
      <PageHero
        crumbs={[{ name: "Careers", href: "/careers" }]}
        label="Careers and the Nseya Graduate Academy"
        title="Graduated, still waiting? Start here."
        lede="The Nseya Graduate Academy is a paid two-year programme with three rotations and a route to chartership. Any degree. No construction experience needed."
        aside={
          <div className={styles.count}>
            <span className={styles.countNo}>{open.length}</span>
            <span>
              {open.length === 1 ? "vacancy open now" : "vacancies open now"}
              <br />
              <Link href="/careers/vacancies">See current roles</Link>
            </span>
          </div>
        }
      >
        <div className="btn-row" style={{ marginTop: 24 }}>
          <Link className="btn" href={APPLY_NO_CV}>Apply in 5 minutes — no CV needed</Link>
          <Link className="btn btn--ghost" href="/careers/vacancies">See current roles</Link>
        </div>
      </PageHero>
      <CareersNav current="/careers" />

      <section className="section">
        <div className="container grid">
          <div className="span-4">
            <p className="label">Who it&apos;s for</p>
            <h2>Who it&apos;s for</h2>
          </div>
          <div className="span-7">
            <p className="lede" style={{ color: "var(--ink)" }}>
              You graduated three months ago or more, you&apos;ve sent the applications, and you&apos;re still waiting.
              You&apos;re not the problem. The doors were. This one is open.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--concrete">
        <div className="container grid">
          <div className="span-4">
            <p className="label">What you get</p>
            <h2>What you get</h2>
          </div>
          <ul className="span-8 tick-list" style={{ fontSize: "1.125rem" }}>
            {getList.map(([b, t]) => (
              <li key={b}><strong>{b}</strong>{t}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--dark drawing-grid">
        <div className="container">
          <p className="label">Your first two years</p>
          <h2>Your first two years</h2>
          <ol className="steps" style={{ marginTop: 32, maxWidth: 760 }}>
            {years.map((y) => (
              <li key={y.when}><h3>{y.when}</h3><p>{y.what}</p></li>
            ))}
          </ol>
          <p style={{ marginTop: 16 }}>
            <Link className="link-arrow" href="/careers/graduate-academy">The full Graduate Academy journey</Link>
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container grid">
          <div className="span-6">
            <p className="label">Not a graduate?</p>
            <h2>Not a graduate?</h2>
            <p className="lede" style={{ color: "var(--ink)" }}>
              We also hire apprentices, trainee site supervisors and people referred by Jobcentre Plus. One in five of our people
              will join this way.
            </p>
            <div className="btn-row">
              <Link className="btn" href="/careers/vacancies">See all roles</Link>
              <Link className="btn btn--ghost" href="/careers/apprenticeships">Apprenticeships and trainee roles</Link>
            </div>
          </div>
          <div className="span-5 start-8">
            <p className="label">How to apply</p>
            <h2>How to apply</h2>
            <ol className="steps">
              <li><h3>Apply</h3><p>Upload your CV, or answer three short questions instead.</p></li>
              <li><h3>Reply</h3><p>We reply within five working days.</p></li>
              <li><h3>Decision</h3><p>Interview, then a decision within four weeks of applying.</p></li>
            </ol>
            <Link className="btn" href={APPLY_NO_CV}>Apply in 5 minutes — no CV needed</Link>
          </div>
        </div>
      </section>

      {showDrafts() && (
        <section className="section section--tight">
          <div className="container">
            <div className={styles.photoSlot}>
              PHOTO SLOT (staging only): real team photo from the December shot list, with everyone&apos;s consent. No stock or AI images.
            </div>
          </div>
        </section>
      )}

      <section className="section section--concrete">
        <div className="container">
          <div className="grid" style={{ alignItems: "end" }}>
            <div className="span-8">
              <p className="label">Open now</p>
              <h2>Current roles</h2>
            </div>
            <div className="span-4" style={{ textAlign: "right" }}>
              <Link href="/careers/vacancies" className="link-arrow">All roles and filters</Link>
            </div>
          </div>
          {open.length > 0 ? (
            <div className="cards cards--2" style={{ marginTop: 24 }}>
              {open.slice(0, 4).map((v) => <VacancyCard key={v.slug} v={v} />)}
            </div>
          ) : (
            <div className="notice" style={{ marginTop: 24 }}>
              <p>
                No roles are open right now. <Link href="/careers/talent-pool">Join our talent pool</Link> and we will contact you when one opens.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
