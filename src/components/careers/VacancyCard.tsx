import Link from "next/link";
import type { Vacancy } from "@/content/types";
import { routeLabels } from "@/lib/cms";
import { formatDate, formatSalary } from "@/lib/format";
import { companyFilterOptions, contractLabels } from "./schema";

export const companyLabel = (c: Vacancy["company"]) => companyFilterOptions.find((o) => o.value === c)?.label ?? "Nseya Groupe";

/** Vacancy card (section 7 core component). */
export function VacancyCard({ v }: { v: Vacancy }) {
  return (
    <article className="vacancy-card" data-company={v.company === "group" ? "group" : v.company}>
      <p className="label" style={{ margin: 0 }}>{routeLabels[v.route]} · {companyLabel(v.company)}</p>
      <h3>
        <Link href={`/careers/vacancies/${v.slug}`} className="stretched">{v.title}</Link>
      </h3>
      {v.status === "draft" && <p style={{ margin: 0 }}><span className="tag tag--warn">Draft: staging only</span></p>}
      <p className="muted" style={{ margin: 0 }}>{v.summary}</p>
      <dl>
        <div><dt>Location</dt><dd>{v.location}</dd></div>
        <div><dt>Salary</dt><dd>{formatSalary(v.salary)}</dd></div>
        <div><dt>Contract</dt><dd>{contractLabels[v.contractType]}</dd></div>
        <div><dt>Closes</dt><dd>{formatDate(v.closingDate)}</dd></div>
      </dl>
    </article>
  );
}
