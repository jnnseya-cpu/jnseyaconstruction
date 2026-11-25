# Email setup: Microsoft 365 with the domain at Hostinger

Decided 26 Nov 2026: one Microsoft 365 mailbox, **contact@nseyagroup.com**, with **careers@** and **suppliers@** as aliases that arrive in the same inbox. **justin@** is a separate mailbox for system alerts and personal mail. The domain stays registered at Hostinger; its DNS records are edited there (hPanel → Domains → nseyagroup.com → DNS / Nameservers).

## 1. Microsoft 365

1. Buy Microsoft 365 Business Basic (or Standard) for two users: contact@ and justin@.
2. Admin centre → **Settings → Domains → Add domain** → `nseyagroup.com`. Microsoft shows a TXT record (`MS=ms…`). Add it in Hostinger DNS, then press **Verify**.
3. Create the users **contact@nseyagroup.com** and **justin@nseyagroup.com**.
4. Admin centre → **Users → Active users → contact@** → **Manage username and email** → add the aliases:
   - `careers@nseyagroup.com`
   - `suppliers@nseyagroup.com`
5. In Outlook for contact@, add rules: messages sent to careers@ → folder "Careers"; sent to suppliers@ → folder "Supply chain".

## 2. DNS records at Hostinger

Use the exact values Microsoft shows under **Settings → Domains → nseyagroup.com → DNS records**. They look like this:

| Type | Name | Value | Notes |
| --- | --- | --- | --- |
| MX | @ | `nseyagroup-com.mail.protection.outlook.com` (priority 0) | Delete any Hostinger email MX records first |
| CNAME | autodiscover | `autodiscover.outlook.com` | Outlook set-up |
| TXT | @ | `v=spf1 include:spf.protection.outlook.com include:<website email service> -all` | **One** SPF record only: combine Microsoft and the website's email service |
| CNAME | selector1._domainkey | value from Microsoft Defender → Email authentication → DKIM | Then switch DKIM **on** for nseyagroup.com |
| CNAME | selector2._domainkey | value from the same page | |
| TXT | _dmarc | `v=DMARC1; p=none; rua=mailto:justin@nseyagroup.com` | Start at `p=none`; move to `p=quarantine` after 2 to 4 weeks of clean reports |

The other group domains (nseyagroup.co.uk, nseya.uk, nseyagroupe.com) send no email: give each `v=spf1 -all` and `v=DMARC1; p=reject` so nobody can send mail pretending to be them.

## 3. The website's own emails

The site sends acknowledgements, reference numbers, alerts and sign-in links automatically. These go through a **transactional email service**, not through the Microsoft 365 mailbox. Microsoft is retiring the password-based sending (SMTP AUTH) that websites use, and a transactional service is what the specification asks for.

- Choose a service with an EU or UK region and an SMTP option (for example Postmark, Resend, Brevo or Amazon SES in eu-west-2).
- Verify `nseyagroup.com` with it. It gives one SPF `include:` (merge it into the single SPF record above) and its own DKIM records.
- In Vercel, set `SMTP_URL` to the service's SMTP address and `EMAIL_FROM="Nseya Group Construction <contact@nseyagroup.com>"`. Replies from applicants and clients then land in the contact@ inbox.

Where the site sends each form (defaults in `src/content/settings.ts`, overridable in Vercel):

| Form | Inbox |
| --- | --- |
| Project enquiries, diagnostic, general contact | contact@ |
| Job applications, talent pool | careers@ (alias, arrives in contact@) |
| Supplier registrations and document renewals | suppliers@ (alias, arrives in contact@) |
| System alerts (a form failing twice in an hour) | justin@ |

## 4. Check before 4 January 2027

1. Send a test email to contact@, careers@ and suppliers@: all three arrive in the contact@ inbox.
2. Submit a test enquiry on the staging site: the acknowledgement arrives, and its headers show `spf=pass`, `dkim=pass`, `dmarc=pass`.
3. Run nseyagroup.com through a mail checker (for example MXToolbox) for MX, SPF, DKIM and DMARC.
