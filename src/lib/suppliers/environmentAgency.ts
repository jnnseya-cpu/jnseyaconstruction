import "server-only";
import { normaliseWasteCarrierNumber, type RegisterCheck } from "./tickets";

/**
 * Environment Agency public register of waste carriers, brokers and dealers
 * (England). Free, no API key: https://environment.data.gov.uk/public-register
 *
 * NOT VERIFIED against the live service: the build sandbox could not reach
 * environment.data.gov.uk. Parsing is defensive: an unrecognised response is
 * treated as "unavailable" (null), so the application carries on and the
 * check is stored as "not checked" for the coordinator. TO CONFIRM before
 * launch: run one known CBDU number through /api/environment-agency/<number>.
 */
const REGISTER_URL = "https://environment.data.gov.uk/public-register/waste-carriers-brokers/registration.json";

export interface WasteCarrierEntry {
  number: string;
  name?: string;
  tier: "upper" | "lower";
  expiry?: string;
  /** False when the register shows it as expired, revoked or cancelled. */
  live: boolean;
  status?: string;
}

type Json = Record<string, unknown>;
const isObj = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);

/** Linked-data values arrive as strings, {"@value": …}, {label: …} or one-item arrays. */
function text(v: unknown): string | undefined {
  if (Array.isArray(v)) return text(v[0]);
  if (typeof v === "string") return v.trim() || undefined;
  if (typeof v === "number") return String(v);
  if (isObj(v)) return text(v["@value"] ?? v.label ?? v.prefLabel ?? v.name ?? v.comment);
  return undefined;
}

function itemsOf(j: unknown): Json[] | null {
  if (Array.isArray(j)) return j.filter(isObj);
  if (!isObj(j)) return null;
  if (Array.isArray(j.items)) return j.items.filter(isObj);
  if (isObj(j.result) && Array.isArray(j.result.items)) return j.result.items.filter(isObj);
  return null;
}

const squash = (s: string) => s.replace(/[\s-]+/g, "").toUpperCase();

function itemNumber(it: Json): string | undefined {
  const direct = text(it.registrationNumber ?? it.registration_number ?? it.number ?? it.notation);
  if (direct) return squash(direct);
  const id = text(it["@id"]);
  const m = id ? /(CBD[UL]\d+)/i.exec(id) : null;
  return m ? m[1].toUpperCase() : undefined;
}

/** Parse one register response for `number`. Exported for tests. */
export function parseRegisterResponse(j: unknown, number: string): WasteCarrierEntry | "not-found" | null {
  const items = itemsOf(j);
  if (!items) return null;
  if (!items.length) return "not-found";
  const it = items.find((x) => itemNumber(x) === number);
  // Items that do not match mean the filter was not understood: do not call it "not found".
  if (!it) return null;
  const tier = normaliseWasteCarrierNumber(number)!.tier;
  const rawExpiry = text(it.expiryDate ?? it.expiry_date ?? it.expires);
  const expiry = rawExpiry && /^\d{4}-\d{2}-\d{2}/.test(rawExpiry) ? rawExpiry.slice(0, 10) : undefined;
  const status = text(it.registrationStatus ?? it.status);
  const holder = isObj(it.holder) ? it.holder : undefined;
  const name = text(holder?.name ?? it.name ?? it.holderName ?? it.businessName);
  const dead = /revok|cancel|expir|inactive|refus|withdraw/i.test(status ?? "");
  const past = !!expiry && new Date(`${expiry}T23:59:59Z`) < new Date();
  return { number, name, tier, expiry, status, live: !dead && !past };
}

/** Null when the register is unreachable or answers in a shape we do not recognise. */
export async function lookupWasteCarrier(number: string): Promise<WasteCarrierEntry | "not-found" | null> {
  try {
    const res = await fetch(`${REGISTER_URL}?number=${encodeURIComponent(number)}&_limit=10`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });
    if (res.status === 404) return "not-found";
    if (!res.ok) return null;
    return parseRegisterResponse(await res.json(), number);
  } catch {
    return null;
  }
}

/** Live check for the supplier record and automatic checks. */
export async function checkWasteCarrier(input: string, now = new Date()): Promise<RegisterCheck> {
  const n = normaliseWasteCarrierNumber(input);
  const checkedAt = now.toISOString();
  if (!n) return { result: "fail", detail: "Not a valid waste carrier number (CBDU or CBDL followed by digits)", checkedAt };
  const r = await lookupWasteCarrier(n.number);
  if (r === null) return { result: "not-checked", detail: "Environment Agency register unavailable; coordinator to check manually", checkedAt, tier: n.tier };
  if (r === "not-found") return { result: "fail", detail: `${n.number} not found on the Environment Agency register`, checkedAt, tier: n.tier };
  return {
    result: r.live ? "pass" : "fail",
    detail: r.live
      ? `${n.number} live on the Environment Agency register${r.name ? ` (${r.name})` : ""}`
      : `${n.number} is ${r.status ? r.status.toLowerCase() : "expired"} on the Environment Agency register`,
    checkedAt,
    tier: n.tier,
    registerExpiry: r.expiry,
  };
}
