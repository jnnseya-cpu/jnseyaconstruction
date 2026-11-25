import type { Metadata } from "next";
import Link from "next/link";
import { CareersNav } from "@/components/careers/CareersNav";
import { CtaBand } from "@/components/CtaBand";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "How we recruit",
  description: "Our four recruitment steps and timings, reasonable adjustments, and our promise to reply to every applicant within 10 working days.",
  alternates: { canonical: "/careers/how-we-recruit" },
};

/* CR-07. TO CONFIRM with the recruiter: each timing below must be one the
   recruiter can actually deliver. The 10-working-day reply is a spec commitment. */
const steps = [
  { title: "Apply", time: "About 5 minutes", text: "Apply online with a CV, or answer three short questions instead. You get an email with your reference number straight away." },
  { title: "Short call", time: "Within 10 working days", text: "If you are shortlisted, we call you for about 15 minutes to talk about the role and answer your questions. If not, we email to tell you." },
  { title: "Interview or site visit", time: "Usually within 2 weeks of the call", text: "Meet the team in person or by video. For site roles, this may be a visit to a site or our office. We tell you what to expect beforehand." },
  { title: "Offer", time: "Within 5 working days of the interview", text: "We email you our decision. If we offer you the role, we then check your right to work in the UK in person and agree a start date." },
];

export default function HowWeRecruitPage() {
  return (
    <div data-company="group">
      <PageHero
        crumbs={[{ name: "Careers", href: "/careers" }, { name: "How we recruit", href: "/careers/how-we-recruit" }]}
        label="How we recruit"
        title="Four steps, and an answer every time"
        lede="We reply to every applicant within 10 working days, whatever the outcome."
      />
      <CareersNav current="/careers/how-we-recruit" />
      <section className="section">
        <div className="container grid">
          <div className="span-7">
            <ol className="steps">
              {steps.map((s) => (
                <li key={s.title}>
                  <h3>{s.title}</h3>
                  <p className="mono small" style={{ color: "var(--accent-text)", marginBottom: 6 }}>{s.time}</p>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="span-4 start-8">
            <div className="notice">
              <h2 style={{ fontSize: "1.25rem" }}>Reasonable adjustments</h2>
              <p>
                Tell us if you need anything to take part fairly. For example: extra time, questions in advance, a step-free venue, a
                video call instead of a visit, or someone with you. Tell us on the application form or reply to any of our emails.
              </p>
              <p>Asking for an adjustment never counts against you.</p>
            </div>
            <h2 style={{ fontSize: "1.25rem", marginTop: 32 }}>What we never ask for online</h2>
            <p>
              We do not ask for passports, visas or other identity documents through this website. We check your right to work in person
              after an offer.
            </p>
            <p><Link href="/careers/inclusion">Inclusion and support</Link></p>
          </div>
        </div>
      </section>
      <CtaBand title="See what is open now" href="/careers/vacancies" cta="Current vacancies" secondary={{ href: "/careers/talent-pool", label: "Join the talent pool" }} />
    </div>
  );
}
