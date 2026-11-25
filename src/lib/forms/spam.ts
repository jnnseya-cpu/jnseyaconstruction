import "server-only";

/** Honeypot field name. Real people never see or fill it. */
export const HONEYPOT = "website_url";

/**
 * Spam protection without a visual puzzle (section 6, rule 2): honeypot plus
 * Cloudflare Turnstile when keys are configured.
 */
export async function isSpam(form: FormData, ip?: string | null): Promise<boolean> {
  const hp = form.get(HONEYPOT);
  if (typeof hp === "string" && hp.trim() !== "") return true;
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return false;
  const token = form.get("cf-turnstile-response");
  if (typeof token !== "string" || !token) return true;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const json = (await res.json()) as { success?: boolean };
    return !json.success;
  } catch {
    // Fail open with honeypot only, rather than block a real enquiry.
    return false;
  }
}
