import "server-only";
import { siteUrl } from "@/lib/cms";
import { inbox, sendEmail, signature } from "@/lib/forms/email";
import { logEvent } from "@/lib/forms/log";
import { store } from "@/lib/forms/store";
import { collectFileIds, purgeIncoming, removeObject, writeExport } from "@/lib/forms/blob";
import { construxCsv } from "./export";
import type { SupplierRecord } from "./model";
import { reminderKey, remindersDue } from "./rules";
import { computeOrderGates, newlyBlocked, suspendingExpired, ticketForDocType } from "./tickets";

export async function supplierRecords() {
  return store().list<SupplierRecord>("supplier");
}

/**
 * Daily job (section 5b "Monitoring"; section 9 retention):
 * 1. 30- and 7-day expiry reminders (idempotent, keys kept on the record);
 * 2. suspension from new awards when a document has expired, and the
 *    ticket order gates (an expired ticket blocks only the work that needs it);
 * 3. retention purge of expired records;
 * 4. CONSTRUX daily CSV export.
 */
export async function runDaily(now = new Date()) {
  const s = store();
  let reminders = 0;
  let suspended = 0;
  let reinstated = 0;
  let gatesBlocked = 0;
  const records = await supplierRecords();

  for (const rec of records) {
    const r = rec.data;
    if (r.status === "not-approved") continue;
    const due = remindersDue(r.documents, r.remindersSent, now);
    const sent = [...r.remindersSent];
    for (const { doc, stage, days } of due) {
      const ticket = ticketForDocType(doc.type);
      const consequence = ticket
        ? `If it expires, you cannot receive orders for work that needs ${ticket.label} until it is replaced.`
        : "If a required document expires, you are suspended from new awards until it is replaced.";
      const ok = await sendEmail(
        {
          to: r.email,
          subject: `${doc.label} expires in ${days} day${days === 1 ? "" : "s"} (${rec.ref})`,
          text: `Dear ${r.company.contactName},\n\nYour ${ticket ? doc.label : doc.label.toLowerCase()} on our records expires on ${doc.expiry}.\n\nPlease upload the renewed document before then: ${siteUrl()}/suppliers/account\n\n${consequence}${signature}`,
        },
        `supplier reminder ${stage}`,
      );
      if (ok) {
        sent.push(reminderKey(doc, stage));
        reminders++;
      }
    }
    const isSuspended = suspendingExpired(r.documents, now).length > 0;
    if (isSuspended && !r.suspended) {
      suspended++;
      await sendEmail(
        {
          to: inbox.supplyChain(),
          subject: `[${rec.ref}] Suspended from new awards: expired document`,
          text: `${r.company.legalName} has an expired document: ${suspendingExpired(r.documents, now).map((d) => d.label).join(", ")}. The supplier is suspended from new awards until it is replaced.`,
        },
        "supplier suspension alert",
      );
      await sendEmail(
        {
          to: r.email,
          subject: `Action needed: expired document (${rec.ref})`,
          text: `Dear ${r.company.contactName},\n\nA document on our records has expired, so we cannot offer you new work until it is replaced. Upload the renewed document here: ${siteUrl()}/suppliers/account${signature}`,
        },
        "supplier suspension notice",
      );
    }
    if (!isSuspended && r.suspended) reinstated++;

    // Ticket order gates: block the work an expired or missing ticket covers.
    const gates = computeOrderGates(r, now);
    const blockedNow = newlyBlocked(r.orderGates, gates);
    if (blockedNow.length && r.orderGates) {
      gatesBlocked += blockedNow.length;
      const lines = blockedNow.map((g) => `- ${g.label}: ${g.blockedBy.map((b) => `${b.label} (${b.detail})`).join("; ")}`).join("\n");
      await sendEmail(
        {
          to: inbox.supplyChain(),
          subject: `[${rec.ref}] Blocked from orders: ticket missing or expired`,
          text: `${r.company.legalName} can no longer receive orders for:\n${lines}\n\nThe block lifts when a valid ticket is uploaded.`,
        },
        "supplier gate alert",
      );
      await sendEmail(
        {
          to: r.email,
          subject: `Action needed: ticket expired (${rec.ref})`,
          text: `Dear ${r.company.contactName},\n\nWe cannot offer you orders for this work until a valid ticket is on our records:\n${blockedNow.map((g) => `- ${g.label}: upload ${g.blockedBy.map((b) => b.toUnblock).join("; and ")}`).join("\n")}\n\nUpload it here: ${siteUrl()}/suppliers/account${signature}`,
        },
        "supplier gate notice",
      );
    }
    const gatesChanged = JSON.stringify(gates) !== JSON.stringify(r.orderGates ?? []);
    if (sent.length !== r.remindersSent.length || isSuspended !== r.suspended || gatesChanged) {
      await s.update<SupplierRecord>("supplier", rec.id, {
        ...r,
        remindersSent: sent,
        suspended: isSuspended,
        orderGates: gates,
        orderGatesAt: gatesChanged ? now.toISOString() : r.orderGatesAt,
      });
    }
  }

  // Retention (section 9): delete the files of records that are about to expire, then the records.
  let filesDeleted = 0;
  for (const kind of ["enquiry", "diagnostic", "application", "supplier_draft", "supplier"] as const) {
    for (const r of await s.list(kind)) {
      if (!r.expiresAt || new Date(r.expiresAt) >= now) continue;
      for (const id of collectFileIds(r.data)) {
        await removeObject("files", id);
        filesDeleted++;
      }
    }
  }
  const purged = await s.purgeExpired(now);
  const incomingPurged = await purgeIncoming();
  const csv = construxCsv((await supplierRecords()).map((x) => ({ ref: x.ref, data: x.data })), now);
  const file = `construx-suppliers-${now.toISOString().slice(0, 10)}.csv`;
  await writeExport(file, csv);

  const summary = { reminders, suspended, reinstated, gatesBlocked, purged, filesDeleted, incomingPurged, exported: records.length, file };
  await logEvent("daily_job", summary);
  return summary;
}
