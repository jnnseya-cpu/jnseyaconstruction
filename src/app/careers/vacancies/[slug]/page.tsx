import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CareersNav } from "@/components/careers/CareersNav";
import styles from "@/components/careers/careers.module.css";
import { contractLabels } from "@/components/careers/schema";
import { companyLabel } from "@/components/careers/VacancyCard";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import type { Vacancy } from "@/content/types";
import { getVacancy, routeLabels, siteUrl } from "@/lib/cms";
import { formatDate, formatSalary } from "@/lib/format";
import { jobPostingSchema } from "@/lib/schema";

// Rendered on request so a vacancy disappears the moment its closing date passes.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const v = getVacancy((await params).slug);
  if (!v) return { title: "Vacancy closed", robots: { index: false } };
  return {
    title: `${v.title}`.slice(0, 58),
    description: `${v.summary}`.slice(0, 154),
    alternates: { canonical: `/careers/vacancies/${v.slug}` },
    robots: v.status === "draft" ? { index: false } : undefined,
  };
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function jobDescriptionHtml(v: Vacancy) {
  const list = (title: string, items: string[]) => `<h3>${esc(title)}</h3><ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
  return `<p>${esc(v.summary)}</p>${list("What you will do", v.whatYouWillDo)}${list("What you get", v.whatYouGet)}${list("What we look for", v.whatWeLookFor)}<p>Hours: ${esc(v.hours)}</p>`;
}

export default async function VacancyPage({ params }: Props) {
  const v = getVacancy((await params).slug);
  if (!v) notFound();
  const url = `${siteUrl()}/careers/vacancies/${v.slug}`;
  const company = v.company === "group" ? "group" : v.company;

  return (
    <div data-company={company}>
      <PageHero
        crumbs={[
          { name: "Careers", href: "/careers" },
          { name: "Vacancies", href: "/careers/vacancies" },
          { name: v.title, href: `/careers/vacancies/${v.slug}` },
        ]}
        label={`${routeLabels[v.route]} · ${companyLabel(v.company)}`}
        title={v.title}
        lede={v.summary}
      >
        <div className="btn-row" style={{ marginTop: 24 }}>
          <Link className="btn" href={`/careers/vacancies/${v.slug}/apply`}>Apply for this role</Link>
        </div>
      </PageHero>
      <CareersNav current="/careers/vacancies" />

      <section className="section">
        <div className={`container ${styles.vacancyLayout}`}>
          <div className={styles.plain}>
            {v.status === "draft" && (
              <div className="notice notice--draft" style={{ marginBottom: 24 }}>
                <p>Draft vacancy shown on staging only. Not visible on the live site.</p>
              </div>
            )}
            <h2>What you will do</h2>
            <ul>{v.whatYouWillDo.map((i) => <li key={i}>{i}</li>)}</ul>
            <h2>What you get</h2>
            <ul>{v.whatYouGet.map((i) => <li key={i}>{i}</li>)}</ul>
            <h2>What we look for</h2>
            <ul>{v.whatWeLookFor.map((i) => <li key={i}>{i}</li>)}</ul>
            <h2>How to apply</h2>
            <p>
              Apply online. It takes about five minutes on a phone. You can upload a CV, or answer three short questions instead. We reply
              to every applicant within five working days. <Link href="/careers/how-we-recruit">See how we recruit</Link>.
            </p>
            <p>
              If you need the application in another format, or any adjustments, tell us on the form or contact us and we will help.
            </p>
            <p><Link className="btn" href={`/careers/vacancies/${v.slug}/apply`}>Apply for this role</Link></p>
          </div>
          <aside className={styles.factsheet} aria-label="Job details">
            <dl>
              <div><dt>Company</dt><dd>{companyLabel(v.company)}</dd></div>
              <div><dt>Employer</dt><dd>{v.employer}</dd></div>
              <div><dt>Location</dt><dd>{v.location}</dd></div>
              <div><dt>Salary</dt><dd>{formatSalary(v.salary)}</dd></div>
              <div><dt>Hours</dt><dd>{v.hours}</dd></div>
              <div><dt>Contract</dt><dd>{contractLabels[v.contractType]}</dd></div>
              <div><dt>Closing date</dt><dd><time dateTime={v.closingDate}>{formatDate(v.closingDate)}</time> (end of day)</dd></div>
            </dl>
            <a
              className="link-arrow link-external"
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Share on LinkedIn<span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </aside>
        </div>
      </section>
      <JsonLd data={jobPostingSchema(v, jobDescriptionHtml(v))} />
    </div>
  );
}
