import type { Metadata } from "next";
import Link from "next/link";
import { CareersNav } from "@/components/careers/CareersNav";
import styles from "@/components/careers/careers.module.css";
import { VacancyCard } from "@/components/careers/VacancyCard";
import { CtaBand } from "@/components/CtaBand";
import { PageHero } from "@/components/PageHero";
import { Stat } from "@/components/Stat";
import { getOpenVacancies, showDrafts } from "@/lib/cms";

export const revalidate = 3600; // vacancy count and closing dates refresh hourly

export const metadata: Metadata = {
  title: "Careers and Graduate Academy",
  description: "Graduate, apprentice, trainee and experienced roles in construction in Birmingham. No construction experience needed for most entry routes.",
  alternates: { canonical: "/careers" },
};

const routes = [
  {
    no: "Route 01",
    href: "/careers/graduate-academy",
    title: "Nseya Graduate Academy",
    text: "A paid two-year programme with three rotations across the group, SSSTS and SMSTS, and a path to chartered membership.",
    who: "For graduates of any degree who are still looking for a graduate job three months or more after finishing.",
  },
  {
    no: "Route 02",
    href: "/careers/apprenticeships",
    title: "Apprenticeships and trainee roles",
    text: "Paid jobs with fully funded training in document control, project controls, commercial administration and site supervision.",
    who: "For anyone aged 16 or over, including people out of work, referred by Jobcentre Plus, or changing career.",
  },
  {
    no: "Route 03",
    href: "/careers/experienced",
    title: "Experienced roles",
    text: "Project and site managers, HSEQ, commercial and MEP specialists who will also mentor the people coming in behind them.",
    who: "For people with construction, engineering or site-services experience.",
  },
];

const starter = [
  { code: "01", title: "A named mentor", text: "Someone experienced who meets you regularly from your first week." },
  { code: "02", title: "CSCS card", text: "We pay for the health and safety test and your card." },
  { code: "03", title: "Site safety training", text: "Paid training before you set foot on site, then SSSTS or SMSTS when you are ready." },
  { code: "04", title: "CONSTRUX and VERYX training", text: "Hands-on training in the systems the group uses to run projects and the business." },
];

export default function CareersPage() {
  const open = getOpenVacancies();
  return (
    <div data-company="group">
      <PageHero
        crumbs={[{ name: "Careers", href: "/careers" }]}
        label="Careers"
        title="Start or grow a career in construction"
        lede="We are a new Birmingham construction group starting to trade in 2027. We plan to grow to 32 people by 2029, and we want half of them to be graduates and a fifth to come from people who were not in work, education or training."
        aside={
          <div className={styles.count}>
            <span className={styles.countNo}>{open.length}</span>
            <span>
              {open.length === 1 ? "vacancy open now" : "vacancies open now"}
              <br />
              <Link href="/careers/vacancies">See vacancies</Link>
            </span>
          </div>
        }
      />
      <CareersNav current="/careers" />

      <section className="section">
        <div className="container">
          <div className="grid">
            <div className="span-5">
              <p className="label">Who we hire and why</p>
              <h2>Three ways in</h2>
            </div>
            <div className="span-7">
              <p className="lede">
                Most of our work is delivered through a vetted supply chain, so our own team is managers, supervisors, planners and
                commercial people. Those are skills people can learn. We would rather train someone who wants to learn than wait for the
                perfect CV.
              </p>
            </div>
          </div>
          <div className={styles.routes} style={{ marginTop: 32 }}>
            {routes.map((r) => (
              <article key={r.href} className={styles.route}>
                <span className={styles.routeNo}>{r.no}</span>
                <h3><Link href={r.href} className="stretched">{r.title}</Link></h3>
                <p>{r.text}</p>
                <p className={styles.routeFor}>{r.who}</p>
                <span className="link-arrow" aria-hidden="true">Find out more</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--concrete">
        <div className="container">
          <div className="grid">
            <div className="span-4">
              <p className="label">What every starter gets</p>
              <h2>The same start for everyone</h2>
              <p className="muted">Whether you join as an apprentice or a project manager.</p>
            </div>
            <div className="span-8">
              <ul className={styles.starter}>
                {starter.map((s) => (
                  <li key={s.code}>
                    <span className={styles.starterCode}>{s.code}</span>
                    <strong>{s.title}</strong>
                    <span>{s.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--dark drawing-grid">
        <div className="container">
          <p className="label">Our hiring plan</p>
          <h2 style={{ maxWidth: "24ch" }}>Who we aim to hire, 2027 to 2029</h2>
          <div className="cards" style={{ marginTop: 32 }}>
            <Stat value="32" countTo={32} label="People in the group by 2029" kind="Group plan" />
            <Stat value="50%" countTo={50} label="Of hires from graduates" kind="Target" />
            <Stat value="20%" countTo={20} label="Of hires from people not in work, education or training" kind="Target" />
            <Stat value="10" countTo={10} label="Working days: our longest reply time to any applicant" kind="Policy" />
          </div>
          <p className="illustrative" style={{ marginTop: 24 }}>Targets from the group business plan. We will report real figures once we are hiring.</p>
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

      <section className="section">
        <div className="container">
          <div className="grid" style={{ alignItems: "end" }}>
            <div className="span-8">
              <p className="label">Open now</p>
              <h2>Current vacancies</h2>
            </div>
            <div className="span-4" style={{ textAlign: "right" }}>
              <Link href="/careers/vacancies" className="link-arrow">All vacancies and filters</Link>
            </div>
          </div>
          {open.length > 0 ? (
            <div className="cards cards--2" style={{ marginTop: 24 }}>
              {open.slice(0, 4).map((v) => <VacancyCard key={v.slug} v={v} />)}
            </div>
          ) : (
            <div className="notice" style={{ marginTop: 24 }}>
              <p>
                We have no roles open right now. Our first roles open for 2027.{" "}
                <Link href="/careers/talent-pool">Join our talent pool</Link> and we will contact you when a role that suits you opens.
              </p>
            </div>
          )}
        </div>
      </section>

      <CtaBand
        title="Not sure which route is for you?"
        text="Tell us what you are interested in and we will contact you when a suitable role opens."
        href="/careers/talent-pool"
        cta="Join the talent pool"
        secondary={{ href: "/careers/how-we-recruit", label: "How we recruit" }}
      />
    </div>
  );
}
