import type { ReactNode } from "react";
import { Breadcrumb, type Crumb } from "./Breadcrumb";

export function PageHero({
  label,
  title,
  lede,
  crumbs,
  children,
  aside,
}: {
  label?: string;
  title: ReactNode;
  lede?: ReactNode;
  crumbs: Crumb[];
  children?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="hero hero--page drawing-grid">
      <div className="container hero__inner">
        <Breadcrumb items={crumbs} />
        <div className="grid" style={{ alignItems: "end" }}>
          <div className={aside ? "span-7" : "span-8"}>
            {label && <p className="label">{label}</p>}
            <h1>{title}</h1>
            {lede && <p className="lede">{lede}</p>}
            {children}
          </div>
          {aside && <div className="span-5">{aside}</div>}
        </div>
      </div>
    </section>
  );
}
