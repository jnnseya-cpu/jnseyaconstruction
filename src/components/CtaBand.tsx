import Link from "next/link";
import type { ReactNode } from "react";

export function CtaBand({ title, text, href, cta, secondary }: { title: string; text?: ReactNode; href: string; cta: string; secondary?: { href: string; label: string } }) {
  return (
    <section className="cta-band drawing-grid" aria-label={title}>
      <div className="container cta-band__inner">
        <div>
          <h2>{title}</h2>
          {text && <p>{text}</p>}
        </div>
        <div className="btn-row">
          <Link className="btn" href={href}>{cta}</Link>
          {secondary && <Link className="btn btn--ghost" href={secondary.href}>{secondary.label}</Link>}
        </div>
      </div>
    </section>
  );
}
