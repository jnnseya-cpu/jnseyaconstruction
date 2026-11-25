import type { ReactNode } from "react";
import { PageHero } from "./PageHero";
import { formatDate } from "@/lib/format";

export function LegalPage({ title, lede, path, updated, children }: { title: string; lede?: string; path: string; updated: string; children: ReactNode }) {
  return (
    <>
      <PageHero label="Legal" title={title} lede={lede} crumbs={[{ name: title, href: path }]} />
      <section className="section">
        <div className="container grid">
          <article className="span-8 legal-body">
            <p className="mono small muted">Last updated {formatDate(updated)}</p>
            {children}
          </article>
        </div>
      </section>
    </>
  );
}
