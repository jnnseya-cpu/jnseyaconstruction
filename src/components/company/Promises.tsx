import styles from "@/components/home/home.module.css";
import { commitments, reasons } from "@/content/commitments";

/** Four reasons to choose us (spec 7b: every company page, in this order). */
export function Reasons({ title = "Why clients choose us" }: { title?: string }) {
  return (
    <section className="section section--concrete drawing-grid--light" aria-labelledby="why-title">
      <div className="container">
        <p className="label">Why clients choose us</p>
        <h2 id="why-title">{title}</h2>
        <div className={styles.reasons}>
          {reasons.map((r) => (
            <div key={r.title} data-reveal>
              <h3>{r.title}</h3>
              <p>{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** The six published commitments (spec 7b: every company page). */
export function Commitments() {
  return (
    <section className="section section--dark drawing-grid" aria-labelledby="promises-title">
      <div className="container">
        <p className="label">Our promises to you</p>
        <h2 id="promises-title">Our promises to you</h2>
        <ul className={styles.promises}>
          {commitments.map(([a, b, c]) => (
            <li key={b} data-reveal>{a}<strong>{b}</strong>{c}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
