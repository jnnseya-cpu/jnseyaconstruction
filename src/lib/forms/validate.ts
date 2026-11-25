import { z } from "zod";
import type { FieldErrors } from "./types";

export const req = (label: string, max = 200) => z.string().trim().min(1, `Enter ${label}`).max(max, `${label[0].toUpperCase()}${label.slice(1)} must be ${max} characters or fewer`);
export const opt = (max = 200) => z.string().trim().max(max).optional().or(z.literal("")).transform((v) => v || undefined);
export const email = z.string().trim().min(1, "Enter your email address").max(254).email("Enter an email address in the correct format, like name@example.com");
export const phone = (required: boolean) =>
  required
    ? z.string().trim().min(1, "Enter your phone number").regex(/^[+\d][\d\s()-]{6,19}$/, "Enter a phone number, like 0121 000 0000 or +44 121 000 0000")
    : z.string().trim().regex(/^([+\d][\d\s()-]{6,19})?$/, "Enter a phone number, like 0121 000 0000").optional().transform((v) => v || undefined);
export const consent = z.literal("yes", { error: "You must agree to how we use your information before you send this form" });
export const oneOf = <T extends readonly [string, ...string[]]>(values: T, message: string) => z.enum(values, { error: message });

/** Read FormData into a plain object; repeated keys become arrays. */
export function formToObject(form: FormData, arrays: string[] = []) {
  const out: Record<string, string | string[]> = {};
  for (const [k, v] of form.entries()) {
    if (typeof v !== "string") continue;
    if (k.startsWith("$ACTION") || k === "cf-turnstile-response") continue;
    if (arrays.includes(k)) {
      (out[k] ??= []);
      (out[k] as string[]).push(v);
    } else out[k] = v;
  }
  for (const a of arrays) out[a] ??= [];
  return out;
}

export function zodErrors(err: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
