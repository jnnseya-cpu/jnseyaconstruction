import type { Metadata } from "next";
import Link from "next/link";
import { CareersNav } from "@/components/careers/CareersNav";
import styles from "@/components/careers/careers.module.css";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Inclusion and support",
  description: "Our equal-opportunity statement, our work towards Disability Confident, and support for people returning to work.",
  alternates: { canonical: "/careers/inclusion" },
};

/* CR-08. Partners (Jobcentre Plus, WMCA, universities) are named as partners
   only once they agree in writing. None are named as partners yet. */
export default function InclusionPage() {
  return (
    <div data-company="group">
      <PageHero
        crumbs={[{ name: "Careers", href: "/careers" }, { name: "Inclusion and support", href: "/careers/inclusion" }]}
        label="Inclusion and support"
        title="Construction should be open to everyone who wants to learn"
      />
      <CareersNav current="/careers/inclusion" />
      <section className="section">
        <div className={`container ${styles.twoCol}`}>
          <div>
            <p className="label">Equal opportunity</p>
            <h2>Our equal-opportunity statement</h2>
            <p>
              Nseya Group Construction (JNN Global Ltd) gives everyone an equal chance. We recruit, train, pay and promote people on
              their skills and potential. We do not discriminate because of age, disability, gender reassignment, marriage or civil
              partnership, pregnancy or maternity, race, religion or belief, sex or sexual orientation, the protected characteristics in
              the Equality Act 2010.
            </p>
            <p>
              Equality monitoring questions on our application form are optional. Answers are stored separately with no name attached,
              are never seen by anyone shortlisting, and are used only in anonymous reports.
            </p>
          </div>
          <div>
            <p className="label">Disability</p>
            <h2>Working towards Disability Confident</h2>
            <p>
              We are working towards the government&apos;s Disability Confident scheme. Until we are accepted, we will not use the scheme&apos;s
              badge. We already offer reasonable adjustments at every stage of recruitment and at work.
            </p>
            <p><Link href="/careers/how-we-recruit">Read about adjustments when you apply</Link></p>
          </div>
        </div>
      </section>
      <section className="section section--concrete">
        <div className={`container ${styles.twoCol}`}>
          <div>
            <p className="label">Returning to work</p>
            <h2>Support if you have been out of work</h2>
            <ul>
              <li>No CV needed. Answer three short questions instead.</li>
              <li>Gaps in your history are fine. Caring, illness, study and job-hunting all count as life, not as a problem.</li>
              <li>A named mentor from your first week.</li>
              <li>Paid training before you start on site, and a CSCS card paid for by us.</li>
              <li>Talk to us about hours or start dates that fit around caring or other commitments.</li>
            </ul>
          </div>
          <div>
            <p className="label">Partners</p>
            <h2>Who refers people to us</h2>
            <p>
              Jobcentre Plus work coaches, the WMCA Construction Gateway and university careers services can refer people to us. We will
              list organisations as partners here only once they have agreed in writing to be named.
            </p>
            <p><Link href="/careers/apprenticeships">How referrals work</Link></p>
          </div>
        </div>
      </section>
    </div>
  );
}
