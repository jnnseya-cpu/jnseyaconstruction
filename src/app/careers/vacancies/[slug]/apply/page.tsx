import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { PageHero } from "@/components/PageHero";
import { getVacancy } from "@/lib/cms";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const v = getVacancy((await params).slug);
  return { title: v ? `Apply: ${v.title}`.slice(0, 58) : "Vacancy closed", robots: { index: false } };
}

export default async function ApplyPage({ params }: Props) {
  const v = getVacancy((await params).slug);
  if (!v) notFound();
  return (
    <div data-company={v.company === "group" ? "group" : v.company}>
      <PageHero
        crumbs={[
          { name: "Careers", href: "/careers" },
          { name: "Vacancies", href: "/careers/vacancies" },
          { name: v.title, href: `/careers/vacancies/${v.slug}` },
          { name: "Apply", href: `/careers/vacancies/${v.slug}/apply` },
        ]}
        label="Apply"
        title={`Apply: ${v.title}`}
        lede={`Closes ${formatDate(v.closingDate)}. About five minutes. What you type is saved on this device if you need to stop and come back.`}
      />
      <section className="section">
        <div className="container">
          <ApplicationForm role={v.title} vacancySlug={v.slug} graduate={v.route === "graduate"} />
          <p className="small muted" style={{ marginTop: 32 }}>
            Questions about the role? <Link href={`/careers/vacancies/${v.slug}`}>Read the job details again</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
