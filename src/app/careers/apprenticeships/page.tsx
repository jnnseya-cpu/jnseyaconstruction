import type { Metadata } from "next";
import Link from "next/link";
import { CareersNav } from "@/components/careers/CareersNav";
import styles from "@/components/careers/careers.module.css";
import { CtaBand } from "@/components/CtaBand";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Apprenticeships and trainee roles",
  description: "Paid construction apprenticeships and trainee jobs in Birmingham. No experience needed. Training is free. Jobcentre referrals welcome.",
  alternates: { canonical: "/careers/apprenticeships" },
};

/* CR-03: written for a reading age of 11 or below. Short sentences. Explain every special word. */

const roles = [
  { title: "Document control", text: "You keep drawings and papers up to date. You make sure everyone has the right version." },
  { title: "Project controls", text: "You help track the plan for a job. You check what is done and what is late." },
  { title: "Commercial administration", text: "You help keep track of money on a job. You check orders, bills and payments." },
  { title: "Trainee site supervisor", text: "You learn to run part of a building site. You check work is safe and done right." },
  { title: "Trainee site-services supervisor", text: "You help run site cabins, welfare, security and cleaning for ETABLIX." },
];

export default function ApprenticeshipsPage() {
  return (
    <div data-company="group">
      <PageHero
        crumbs={[{ name: "Careers", href: "/careers" }, { name: "Apprenticeships and trainees", href: "/careers/apprenticeships" }]}
        label="Route 02 · Apprenticeships and trainees"
        title="Get paid while you learn"
        lede="You do not need any experience. You do not need to know about building. We pay you, and we pay for your training."
      >
        <div className="btn-row" style={{ marginTop: 24 }}>
          <Link className="btn" href="/careers/apply?route=apprentice">Apply now</Link>
          <Link className="btn btn--ghost" href="/careers/vacancies?route=apprentice">See jobs</Link>
        </div>
      </PageHero>
      <CareersNav current="/careers/apprenticeships" />

      <section className="section">
        <div className="container">
          <p className="label">The jobs</p>
          <h2>What you could do</h2>
          <div className="cards" style={{ marginTop: 24 }}>
            {roles.map((r) => (
              <div className="card" key={r.title}>
                <h3 style={{ fontSize: "1.25rem" }}>{r.title}</h3>
                <p>{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--concrete">
        <div className={`container ${styles.twoCol}`}>
          <div>
            <p className="label">Who can apply</p>
            <h2>You can apply if you are 16 or over</h2>
            <p>These jobs are for you if:</p>
            <ul>
              <li>you have just left school or college</li>
              <li>you are not in work, school or training right now</li>
              <li>a Jobcentre work coach sent you to us</li>
              <li>you want to change job and try construction</li>
            </ul>
            <p>You do not need a CV. You can answer three short questions instead.</p>
          </div>
          <div>
            <p className="label">What you get</p>
            <h2>Training is free</h2>
            <ul>
              <li>A paid job from day one.</li>
              <li>Your training is paid for. You do not pay anything.</li>
              <li>A mentor. This is a person at work who helps you learn.</li>
              <li>A CSCS card. This is the card you need to work on most building sites.</li>
              <li>Safety training before you go on site.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="label">Help to apply</p>
          <h2>Ways someone can send you to us</h2>
          <p className="lede">If you get help to find work, ask your adviser about us. They can send your name to us.</p>
          <div className="cards" style={{ marginTop: 24 }}>
            <div className="card">
              <h3 style={{ fontSize: "1.25rem" }}>Jobcentre Plus</h3>
              <p>Tell your work coach you want to work in construction. Ask them to refer you to Nseya Group Construction.</p>
            </div>
            <div className="card">
              <h3 style={{ fontSize: "1.25rem" }}>SWAP</h3>
              <p>
                SWAP means sector-based work academy programme. It is a short course from Jobcentre Plus. It can include training,
                time on a work site and a job interview. Ask your work coach if there is one with us.
              </p>
            </div>
            <div className="card">
              <h3 style={{ fontSize: "1.25rem" }}>WMCA Construction Gateway</h3>
              <p>
                WMCA is the West Midlands Combined Authority. Its Construction Gateway gives free training to people who want to
                work in construction. It can send you to employers like us.
              </p>
            </div>
          </div>
          <p className="small muted" style={{ marginTop: 20 }}>
            On the form, you can tell us who sent you. This is your choice. It does not change how we look at your application.
          </p>
        </div>
      </section>

      <CtaBand
        title="Ready to apply?"
        text="It takes about five minutes on a phone."
        href="/careers/apply?route=apprentice"
        cta="Apply now"
        secondary={{ href: "/careers/talent-pool", label: "Tell me about future jobs" }}
      />
    </div>
  );
}
