import Link from "next/link";
import type { Company, Service } from "@/content/types";
import styles from "./home.module.css";

/** Three colour-coded company cards; the whole card links to the company page (PG-01). */
export function CompanyCards({ companies, servicesFor }: { companies: Company[]; servicesFor: (id: Company["id"]) => Service[] }) {
  return (
    <ul className={styles.companyGrid}>
      {companies.map((c, i) => (
        <li key={c.id} data-company={c.id} className={`card card--company ${styles.companyCard}`} data-reveal>
          <span className="card__code">{String(i + 1).padStart(2, "0")} / {c.shortName.toUpperCase()}</span>
          <h3>
            <Link href={c.path} className={`stretched ${styles.cardLink}`}>{c.name}</Link>
          </h3>
          <p>{c.summary}</p>
          <ul className={styles.miniList}>
            {servicesFor(c.id).slice(0, 4).map((s) => (
              <li key={s.slug}>{s.name}</li>
            ))}
          </ul>
          <div className={`card__foot ${styles.foot}`}>
            <span className="link-arrow" aria-hidden="true">Go to {c.shortName}</span>
            {c.externalSite && (
              <a className={`link-arrow link-external ${styles.above}`} href={c.externalSite.url} rel="noopener">
                {c.externalSite.label}
                <span className="visually-hidden"> (separate website)</span>
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
