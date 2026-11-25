import styles from "./HeroDrawing.module.css";

/**
 * DWG NGC-001. Engineering-style line drawing drawn in code: a mixed-use
 * building, a substation and a workforce village on one ground line.
 * Illustrative only; it does not show a Nseya project.
 */
export function HeroDrawing() {
  return (
    <figure className={`${styles.figure} draw-in`}>
      <svg viewBox="0 0 640 400" role="img" aria-labelledby="dwg1-title dwg1-desc" className={`${styles.svg} draw`}>
        <title id="dwg1-title">Illustrative engineering drawing</title>
        <desc id="dwg1-desc">
          A line drawing of the three kinds of work the group does: a four-storey building on the left, a substation with a
          transformer and gantry in the middle, and a row of workforce village cabins on the right, all on one ground line.
        </desc>
        {/* Ground and dimension line */}
        <g className={styles.thin}>
          <line data-draw x1="10" y1="320" x2="630" y2="320" />
          <line data-draw x1="30" y1="350" x2="210" y2="350" />
          <line x1="30" y1="344" x2="30" y2="356" />
          <line x1="210" y1="344" x2="210" y2="356" />
          <line data-draw x1="250" y1="350" x2="420" y2="350" />
          <line x1="250" y1="344" x2="250" y2="356" />
          <line x1="420" y1="344" x2="420" y2="356" />
          <line data-draw x1="450" y1="350" x2="620" y2="350" />
          <line x1="450" y1="344" x2="450" y2="356" />
          <line x1="620" y1="344" x2="620" y2="356" />
        </g>
        <g className={styles.note}>
          <text x="120" y="368" textAnchor="middle">A · BUILDINGS</text>
          <text x="335" y="368" textAnchor="middle">B · SUBSTATION</text>
          <text x="535" y="368" textAnchor="middle">C · WORKFORCE VILLAGE</text>
        </g>

        {/* A: four-storey mixed-use building */}
        <g className={styles.line} style={{ ["--delay" as string]: "0.1s" }}>
          <polyline data-draw points="40,320 40,130 200,130 200,320" />
          <line data-draw x1="40" y1="178" x2="200" y2="178" />
          <line data-draw x1="40" y1="226" x2="200" y2="226" />
          <line data-draw x1="40" y1="274" x2="200" y2="274" />
          <polyline data-draw points="34,130 120,96 206,130" />
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2, 3].map((c) => (
              <rect key={`${r}-${c}`} data-draw x={54 + c * 38} y={142 + r * 48} width="20" height="24" className={styles.thin} />
            )),
          )}
          <rect data-draw x="108" y="290" width="24" height="30" />
        </g>

        {/* B: substation with transformer, gantry and control building */}
        <g className={styles.line}>
          <polyline data-draw points="260,320 260,190 280,190 280,320" />
          <polyline data-draw points="390,320 390,190 410,190 410,320" />
          <line data-draw x1="260" y1="200" x2="410" y2="200" />
          <line data-draw x1="270" y1="190" x2="270" y2="168" />
          <line data-draw x1="400" y1="190" x2="400" y2="168" />
          <line data-draw x1="270" y1="168" x2="400" y2="168" />
          <rect data-draw x="300" y="250" width="70" height="56" />
          <line data-draw x1="300" y1="306" x2="370" y2="306" />
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} data-draw x1={306 + i * 14} y1="250" x2={306 + i * 14} y2="236" className={styles.thin} />
          ))}
          <circle data-draw cx="320" cy="228" r="7" />
          <circle data-draw cx="335" cy="228" r="7" />
          <circle data-draw cx="350" cy="228" r="7" />
          <path data-draw d="M335 221 L335 200" className={styles.thin} />
        </g>
        {/* Cable route below ground */}
        <g className={styles.accent}>
          <path data-draw d="M200 334 H560" strokeDasharray="6 5" />
          <rect data-draw x="300" y="326" width="70" height="16" />
        </g>

        {/* C: workforce village cabins in two stacks */}
        <g className={styles.line}>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect data-draw x={460 + i * 52} y="282" width="46" height="38" />
              <rect data-draw x={460 + i * 52} y="244" width="46" height="38" />
              <rect data-draw x={468 + i * 52} y="292" width="10" height="12" className={styles.thin} />
              <rect data-draw x={468 + i * 52} y="254" width="10" height="12" className={styles.thin} />
            </g>
          ))}
          <polyline data-draw points="456,244 456,236 616,236 616,244" />
          <line data-draw x1="616" y1="244" x2="616" y2="320" className={styles.thin} />
        </g>

        {/* Grid marks */}
        <g className={styles.note}>
          <text x="40" y="118" textAnchor="middle">①</text>
          <text x="200" y="118" textAnchor="middle">②</text>
          <text x="20" y="324">±0.00</text>
        </g>
      </svg>
      <figcaption className={styles.titleBlock}>
        <span>DWG NGC-001</span>
        <span>Group scope · Elevation</span>
        <span>Illustrative · NTS</span>
      </figcaption>
    </figure>
  );
}
