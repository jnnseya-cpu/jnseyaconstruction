import net from "node:net";
import nodemailer from "nodemailer";
import { describe, expect, it } from "vitest";
import { smtpErrorDetail } from "@/lib/forms/email";

/** A fake SMTP server that refuses every login, like a wrong password. */
function refusingServer(): Promise<{ port: number; close: () => void }> {
  return new Promise((resolve) => {
    const server = net.createServer((sock) => {
      sock.write("220 fake ESMTP\r\n");
      sock.on("data", (buf) => {
        const line = buf.toString();
        if (/^EHLO/i.test(line)) sock.write("250-fake\r\n250 AUTH PLAIN LOGIN\r\n");
        else if (/^AUTH/i.test(line)) sock.write("535 5.7.8 Authentication failed\r\n");
        else if (/^QUIT/i.test(line)) sock.end("221 bye\r\n");
        else sock.write("250 ok\r\n");
      });
    });
    server.listen(0, "127.0.0.1", () => {
      const port = (server.address() as net.AddressInfo).port;
      resolve({ port, close: () => server.close() });
    });
  });
}

describe("SMTP failure logging", () => {
  it("records the code, command and reply code of a refused login, and no personal data", async () => {
    const srv = await refusingServer();
    const t = nodemailer.createTransport({
      // Same shape the site uses: SMTP_URL plus timeouts.
      url: `smtp://someone%40example.com:secret@127.0.0.1:${srv.port}`,
      connectionTimeout: 10_000,
    });
    const err = await t.sendMail({ from: "a@example.com", to: "b@example.com", subject: "x", text: "y" }).catch((e) => e);
    srv.close();
    const detail = smtpErrorDetail(err);
    expect(detail).toMatchObject({ code: "EAUTH", responseCode: 535 });
    expect(JSON.stringify(detail)).not.toMatch(/example\.com|secret/);
  });

  it("names a missing SMTP_URL", () => {
    expect(smtpErrorDetail(new Error("SMTP_URL not configured"))).toMatchObject({ code: "NO_SMTP_URL" });
  });
});
