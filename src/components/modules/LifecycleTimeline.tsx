import styles from "./LifecycleTimeline.module.css";

/**
 * TSLM / WVLM lifecycle timeline (section 7a, P1). An ordered list styled as a
 * timeline: fully readable without JavaScript, stacks vertically on mobile.
 */
export function LifecycleTimeline({ phases }: { phases: { phase: string; summary: string; items: string[] }[] }) {
  return (
    <ol className={styles.timeline} aria-label="Lifecycle phases">
      {phases.map((p, i) => (
        <li key={p.phase} className={styles.phase} data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
          <div className={styles.marker} aria-hidden="true">
            <span>{String(i + 1).padStart(2, "0")}</span>
          </div>
          <h3 className={styles.name}>{p.phase}</h3>
          <p className={styles.summary}>{p.summary}</p>
          <ul className={styles.items}>
            {p.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
