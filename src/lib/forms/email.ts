import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import nodemailer from "nodemailer";
import { mailboxes } from "@/content/settings";
import { logEvent } from "./log";

/**
 * Transactional email (section 6). SMTP through the provider configured in
 * SMTP_URL (SPF, DKIM and DMARC are set on the sending domain at WEB-13).
 * Without SMTP_URL in development, messages are written to ./storage/outbox.
 * Failed sends are retried 3 times, then logged and alerted (rule 6).
 */

export interface Email {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}

let transport: ReturnType<typeof nodemailer.createTransport> | null = null;

async function deliver(msg: Email) {
  const from = process.env.EMAIL_FROM || `Nseya Groupe Construction <${mailboxes.hello}>`;
  if (process.env.SMTP_URL) {
    transport ??= nodemailer.createTransport(process.env.SMTP_URL);
    await transport.sendMail({ from, ...msg });
    return;
  }
  if (process.env.NODE_ENV === "production") throw new Error("SMTP_URL not configured");
  const dir = path.resolve(process.cwd(), "storage", "outbox");
  await fs.mkdir(dir, { recursive: true });
  const name = `${new Date().toISOString().replace(/[:.]/g, "-")}-${Math.random().toString(36).slice(2, 8)}.txt`;
  await fs.writeFile(path.join(dir, name), `From: ${from}\nTo: ${msg.to}\nSubject: ${msg.subject}\n${msg.replyTo ? `Reply-To: ${msg.replyTo}\n` : ""}\n${msg.text}\n`);
}

export async function sendEmail(msg: Email, context: string): Promise<boolean> {
  if (!msg.to) {
    await logEvent("email_skipped", { context, reason: "no recipient configured" });
    return false;
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await deliver(msg);
      return true;
    } catch (err) {
      if (attempt === 3) {
        // No personal data in logs (NF-08): context and error class only.
        await logEvent("email_failed", { context, error: err instanceof Error ? err.name : "unknown" }, { alertOnRepeat: true });
        return false;
      }
      await new Promise((r) => setTimeout(r, 300 * attempt));
    }
  }
  return false;
}

export const inbox = {
  group: () => process.env.INBOX_GROUP || mailboxes.hello,
  consultancy: () => process.env.INBOX_CONSULTANCY || process.env.INBOX_GROUP || mailboxes.hello,
  etablix: () => process.env.INBOX_ETABLIX || process.env.INBOX_GROUP || mailboxes.hello,
  construction: () => process.env.INBOX_CONSTRUCTION || process.env.INBOX_GROUP || mailboxes.hello,
  supplyChain: () => process.env.INBOX_SUPPLY_CHAIN || mailboxes.suppliers,
  people: () => process.env.INBOX_PEOPLE || mailboxes.careers,
  alerts: () => process.env.INBOX_ALERTS || mailboxes.justin,
};

export const signature = `\n\nNseya Groupe Construction\nJNN Global Ltd, company number 15405437, registered in England and Wales.\nRegistered office: 30 Fairford Road, Kingstanding, Birmingham B44 8DJ.`;
