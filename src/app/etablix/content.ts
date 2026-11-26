/**
 * ETABLIX wording for the group site's short overview page (PG-04).
 *
 * Wording drafted from the group website specification (etablix.com could not
 * be reached from the build environment) and Confirmed by Justin, 26 Nov 2026 as matching etablix.com:
 *  - what the TSLM and WVLM acronyms stand for (deliberately not spelled out here);
 *  - the names and descriptions of the two delivery models other than Prime;
 *  - the lifecycle phase descriptions;
 *  - the trades list (etablix.com lists 21 trades; only examples are given here).
 */

export interface DeliveryModel {
  name: string;
  summary: string;
  /** Prime is never offered as available (PG-04 acceptance). */
  status: "available" | "not-open";
  /** Only confirmed models render. */
  confirmed: boolean;
}

export const etablixContent = {
  overview:
    "ETABLIX plans, sets up, runs and removes the temporary facilities a construction project needs: site cabins, welfare, security, cleaning and, on the largest projects, workforce villages. One accountable team manages them for the whole life of the site.",
  methods: [
    {
      code: "TSLM",
      /** Anchor matches the service slug used by the services index. */
      anchor: "integrated-site-services",
      summary:
        "TSLM is the ETABLIX lifecycle method for temporary site services. It covers the compound, cabins, welfare, security, cleaning and utilities from the first plan to the day the site is cleared.",
    },
    {
      code: "WVLM",
      anchor: "workforce-villages",
      summary:
        "WVLM applies the same lifecycle to workforce villages: beds, meals, laundry and transport for large project workforces, sized to the workforce peak and scaled down as it falls.",
    },
  ],
  lifecycle: [
    {
      phase: "Plan",
      summary: "Size the site services to the programme and the workforce curve before anything is ordered.",
      items: ["Workforce and programme review", "Compound layout and utilities plan", "Permits, access and traffic management plan", "Budget and supply-chain plan"],
    },
    {
      phase: "Establish",
      summary: "Deliver, connect and commission everything so the site is ready for the first shift.",
      items: ["Cabins and welfare delivered and connected", "Fencing, gates and security in place", "Utilities and generators commissioned", "Inspections and handover to site team"],
    },
    {
      phase: "Operate",
      summary: "Run the services day to day and scale them with the workforce.",
      items: ["Cleaning, security and maintenance rotas", "Weekly checks against the site plan", "Scaling up or down with headcount", "Monthly service report"],
    },
    {
      phase: "Remove",
      summary: "Take everything away and leave the land as agreed.",
      items: ["Phased removal as trades finish", "Disconnection and waste records", "Reinstatement of the ground", "Close-out report"],
    },
  ],
  deliveryModels: [
    {
      name: "Prime",
      summary: "ETABLIX as the prime contractor for site services.",
      status: "not-open",
      confirmed: true,
    },
    // Names still to be supplied; kept hidden (confirmed: false) so nothing is invented. Prime is the only model shown.
    { name: "Delivery model 2 (name to confirm)", summary: "", status: "available", confirmed: false },
    { name: "Delivery model 3 (name to confirm)", summary: "", status: "available", confirmed: false },
  ] satisfies DeliveryModel[] as DeliveryModel[],
  /** Examples only; the full list of 21 trades is on etablix.com. */
  tradeExamples: ["Site cabins and offices", "Welfare units", "Security", "Cleaning", "Generators and temporary power", "Traffic management", "Workforce accommodation", "Catering", "Transport"],
};
