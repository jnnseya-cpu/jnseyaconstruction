import Link from "next/link";
import type { Company } from "@/content/types";
import styles from "./home.module.css";

/** Three colour-coded company cards; each reaches its page in one click (PG-01). Copy from the Phase 1 copy deck. */
export function CompanyCards({ companies }: { companies: Company[] }) {
  return (
    <ul className={styles.companyGrid}>
      {companies.map((c, i) => (
        <li key={c.id} data-company={c.id} className={`card card--company ${styles.companyCard}`} data-reveal>
          <span className="card__code">{String(i + 1).padStart(2, "0")} / {c.shortName.toUpperCase()}</span>
          <h3>
            <Link href={c.path} className={`stretched ${styles.cardLink}`}>{c.name}</Link>
          </h3>
          <p className={styles.tagline}>{c.tagline}</p>
          <p>{c.summary}</p>
          <div className={`card__foot ${styles.foot}`}>
            {c.externalSite ? (
              <a className={`link-arrow link-external ${styles.above}`} href={c.externalSite.url} rel="noopener">
                {c.cardCta}
                <span className="visually-hidden"> (separate website)</span>
              </a>
            ) : (
              <span className="link-arrow" aria-hidden="true">{c.cardCta}</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
