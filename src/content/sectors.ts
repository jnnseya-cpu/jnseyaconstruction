import type { Sector } from "./types";

export const sectors: Sector[] = [
  { id: "public-estate", name: "Public estate", summary: "Councils, NHS trusts, schools and blue-light estates." },
  { id: "social-housing", name: "Social housing", summary: "Housing associations and council housing programmes." },
  { id: "energy-grid", name: "Energy and grid", summary: "Generation, substations and 33kV and 132kV cable routes." },
  { id: "data-centres", name: "Data centres", summary: "Civils, power and cooling for data-centre campuses." },
  { id: "commercial-mixed-use", name: "Commercial and mixed-use", summary: "Offices, retail and mixed-use schemes." },
  { id: "residential", name: "Residential", summary: "Renovations, extensions, loft conversions and small sites." },
];
