# Email setup (live since 27 Nov 2026)

One Hostinger mailbox, **contact@nseyagroup.com**, receives everything. **careers@**, **suppliers@** and **justin.n@** are aliases of it, so all four addresses arrive in the same inbox (read in Outlook). Hostinger provides the mailbox; **DNS for nseyagroup.com is managed in Vercel** (Domains → nseyagroup.com → DNS Records), not in hPanel.

## 1. Mailbox and aliases (Hostinger)

hPanel → Emails → nseyagroup.com → Email accounts → contact@ → Manage → Aliases:

- `careers@nseyagroup.com`
- `suppliers@nseyagroup.com`
- `justin.n@nseyagroup.com`

Optional Outlook rules on contact@: mail to careers@ → "Careers"; to suppliers@ → "Supply chain"; to justin.n@ → "Justin / alerts".

## 2. DNS records (Vercel DNS)

Hostinger's own email check ("Email domain DNS settings") shows MX, SPF, DKIM and DMARC; all four were passing on 27 Nov 2026. Keep **one** SPF record only (currently `v=spf1 include:_spf.mail.hostinger.com ~all`). Add any other sending service to that same record, never as a second `v=spf1` record.

The other group domains (nseyagroup.co.uk, nseya.uk, nseyagroupe.com) send no email: give each a TXT `v=spf1 -all` at `@` and a TXT `v=DMARC1; p=reject` at `_dmarc`, so nobody can send mail pretending to be them.

## 3. The website's own emails

The site sends acknowledgements, reference numbers, alerts and sign-in links through Hostinger SMTP, logged in as contact@. In Vercel (Production):

```
SMTP_URL=smtps://contact%40nseyagroup.com:PASSWORD@smtp.hostinger.com:465
EMAIL_FROM=Nseya Group Construction <contact@nseyagroup.com>
```

- Inside `SMTP_URL`, `@` in the username **and in the password** is written `%40`. Other characters to encode in the password: `:`→`%3A`, `/`→`%2F`, `#`→`%23`, `?`→`%3F`, `%`→`%25`. Outlook and Hostinger keep the real password unchanged.
- The login and the `EMAIL_FROM` address must be the same mailbox.
- After changing either value, redeploy.
- If sending fails, the database event log records the reason (no personal data): in the Neon SQL Editor run
  `SELECT created_at, data FROM records WHERE kind = 'event_log' ORDER BY created_at DESC LIMIT 5;`
  `EAUTH` / `535` means the login was refused (usually encoding); `ETIMEDOUT` / `ECONNECTION` means the server could not be reached.

Where the site sends each form (defaults in `src/content/settings.ts`, overridable in Vercel with `INBOX_*`):

| Form | Address | Arrives in |
| --- | --- | --- |
| Project enquiries, diagnostic, general contact | contact@ | contact@ |
| Job applications, talent pool | careers@ | contact@ (alias) |
| Supplier registrations and document renewals | suppliers@ | contact@ (alias) |
| System alerts (a form failing twice in an hour) | justin.n@ | contact@ (alias) |

## 4. Checks

1. Send a test email to careers@, suppliers@ and justin.n@: all three arrive in the contact@ inbox.
2. Submit a test enquiry: the acknowledgement arrives and Gmail's "Show original" shows SPF, DKIM and DMARC as PASS.
3. Run nseyagroup.com through a mail checker (for example MXToolbox) for MX, SPF, DKIM and DMARC.
