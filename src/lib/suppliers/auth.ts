import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/** Random URL-safe token (32 bytes) and its SHA-256 hash (only the hash is stored). */
export function newToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

function secret() {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET must be set (32+ characters) in production");
  return "development-only-session-secret-not-for-production";
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

export const SESSION_COOKIE = "nseya_supplier";
// Matches the cookies page: strictly necessary, 7 days or until sign out.
const SESSION_HOURS = 7 * 24;

export async function setSupplierSession(supplierId: string) {
  const exp = Date.now() + SESSION_HOURS * 3600_000;
  const payload = `${supplierId}.${exp}`;
  (await cookies()).set(SESSION_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/suppliers",
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function clearSupplierSession() {
  (await cookies()).delete({ name: SESSION_COOKIE, path: "/suppliers" });
}

/** Returns the signed-in supplier id, or null. */
export async function getSupplierSession(): Promise<string | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const i = raw.lastIndexOf(".");
  const payload = raw.slice(0, i);
  const sig = raw.slice(i + 1);
  const expected = sign(payload);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const [id, exp] = payload.split(".");
  if (!id || Number(exp) < Date.now()) return null;
  return id;
}

/** Constant-time bearer check for cron routes. */
export function cronAuthorised(header: string | null): boolean {
  const s = process.env.CRON_SECRET;
  if (!s || !header) return false;
  const expected = Buffer.from(`Bearer ${s}`);
  const got = Buffer.from(header);
  return got.length === expected.length && timingSafeEqual(got, expected);
}
