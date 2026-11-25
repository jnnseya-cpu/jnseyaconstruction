import "server-only";
import { store } from "./store";

/**
 * Operational log (NF-08). Never pass personal data here: form names,
 * reference numbers and error classes only. Raises an alert if the same
 * failure happens twice within an hour (section 6, rule 6).
 */
export async function logEvent(event: string, detail: Record<string, string | number | boolean>, opts: { alertOnRepeat?: boolean } = {}) {
  const line: Record<string, string | number | boolean> = { event, ...detail, at: new Date().toISOString() };
  console.log(JSON.stringify(line));
  try {
    const s = store();
    await s.insert("event_log", line, { expiresAt: new Date(Date.now() + 90 * 86400_000) });
    if (opts.alertOnRepeat) {
      const hourAgo = Date.now() - 3600_000;
      const recent = (await s.list<typeof line>("event_log")).filter(
        (r) => r.data.event === event && r.data.context === detail.context && new Date(r.createdAt).getTime() > hourAgo,
      );
      if (recent.length >= 2) {
        console.error(JSON.stringify({ event: "ALERT", reason: `${event} twice within an hour`, context: detail.context }));
        // Alert via email without recursion into sendEmail's own failure path.
        const { sendEmail, inbox } = await import("./email");
        if (event !== "email_failed") {
          await sendEmail({ to: inbox.alerts(), subject: `Website alert: ${event} (${detail.context})`, text: JSON.stringify(line, null, 2) }, "alert");
        }
      }
    }
  } catch {
    /* logging must never break a submission */
  }
}
