export function formatDate(iso: string) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" }).format(new Date(`${iso}T12:00:00Z`));
}

export function formatSalary(s: { min: number; max: number; period: "YEAR" | "HOUR" }) {
  const f = (n: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: s.period === "HOUR" ? 2 : 0 }).format(n);
  const per = s.period === "YEAR" ? "a year" : "an hour";
  return s.min === s.max ? `${f(s.min)} ${per}` : `${f(s.min)} to ${f(s.max)} ${per}`;
}
