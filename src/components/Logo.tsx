/**
 * Hexagon mark. Stand-in drawn from the brand description (hexagon-N root mark,
 * hexagon-E for ETABLIX) until the official SVG logo files are supplied; swap
 * the paths here and every use updates.
 */
export function HexMark({ letter = "N", size = 36, accent = "var(--accent-on-dark)" }: { letter?: "N" | "E"; size?: number; accent?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="none" stroke={accent} strokeWidth="2.5" />
      {letter === "N" ? (
        <path d="M13 28V12l14 16V12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="miter" />
      ) : (
        <path d="M27 12H14v16h13M14 20h11" fill="none" stroke="currentColor" strokeWidth="3" />
      )}
    </svg>
  );
}
