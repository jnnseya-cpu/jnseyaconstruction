/** Stat tile. `kind` is mandatory so targets are never shown as achievements. */
export function Stat({ value, label, kind, countTo }: { value: string; label: string; kind: "Target" | "Group plan" | "Policy" | "Fact"; countTo?: number }) {
  return (
    <div className="stat" data-reveal>
      <span className="stat__value" data-count={countTo}>{value}</span>
      <span className="stat__label">{label}</span>
      <span className="stat__kind">{kind}</span>
    </div>
  );
}
