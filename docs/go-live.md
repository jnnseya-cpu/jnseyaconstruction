# Go-live runbook

Everything in this list is done by Justin (accounts, secrets, DNS). The code is ready on the `main` branch (created 26 Nov 2026 from `claude/adoring-thompson-1rifxc`). Details for each step are in `docs/deploy-vercel.md` and `docs/email-setup.md`.

Work top to bottom. Steps 1 to 6 make a working site on a Vercel address; steps 7 and 8 put it on www.nseyagroup.com.

## Must have before anyone sees the site

| # | Step | Where | Time | If skipped |
| --- | --- | --- | --- | --- |
| 1 | Vercel **Pro** team; import the GitHub repository. Production branch: `main`. Other branches get preview deployments. | vercel.com | 15 min | No site |
| 2 | PostgreSQL in London (Neon via the Vercel integration, region `aws-eu-west-2`). Copy the **pooled** connection string into `DATABASE_URL`, then run `npm run db:migrate` once against it. | Vercel → Storage | 15 min | **Every form fails** (production refuses to run forms without a database) |
| 3 | Site email through Hostinger SMTP: set `SMTP_URL=smtps://contact%40nseyagroup.com:PASSWORD@smtp.hostinger.com:465` (encode `@` in the password as `%40`) and `EMAIL_FROM="Nseya Group Construction <contact@nseyagroup.com>"`. | Vercel | 10 min | Nobody gets reference numbers, acknowledgements or alerts |
| 4 | Hostinger mailbox contact@ with careers@, suppliers@ and justin.n@ as aliases. MX, SPF, DKIM and DMARC (DNS is managed in Vercel). | Hostinger + Vercel DNS | 30 min | Enquiries and replies are lost |
| 5 | Private upload bucket in London (AWS S3 `eu-west-2`, or Google Cloud Storage `europe-west2`) with the CORS rule and the 1-day `incoming/` lifecycle rule. Set `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` (and `S3_ENDPOINT` for Google). | AWS or Google Cloud | 30 min | CV, drawing and certificate uploads fail; forms without files still work |
| 6 | Secrets in Vercel (Production): `SITE_URL=https://www.nseyagroup.com`, `SITE_ENV=production`, `SESSION_SECRET`, `UPLOAD_SECRET`, `CRON_SECRET` (three different long random strings), plus the values from steps 2, 3 and 5. Redeploy. | Vercel → Settings → Environment Variables | 15 min | Without `SITE_ENV=production` the site tells search engines not to index it |

## Test on the Vercel address before the domain

7. On the `*.vercel.app` address:
   - send a project enquiry → reference on screen, acknowledgement in your inbox, alert in contact@;
   - apply for a vacancy with a PDF CV → acknowledgement, alert in careers@;
   - start a supplier application → resume link by email; finish it with a certificate upload;
   - check the acknowledgement email headers show `spf=pass`, `dkim=pass`, `dmarc=pass`.

## Domain

8. In Vercel → Domains add `www.nseyagroup.com` (primary) and `nseyagroup.com`, `nseyagroup.co.uk`, `nseya.uk`, `nseyagroupe.com` (redirect to www). DNS for nseyagroup.com is managed in Vercel; keep the Hostinger email records (MX, SPF, DKIM, DMARC). HTTPS is issued automatically within minutes of DNS updating.

## Strongly recommended on day one

- Cloudflare Turnstile keys (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`): without them only the honeypot stops spam.
- `COMPANIES_HOUSE_API_KEY`: without it suppliers type their company details by hand.
- Google Search Console and Bing Webmaster Tools: add the domain and submit `https://www.nseyagroup.com/sitemap.xml`.
- Make the GitHub repository private (the specification asks for a private repository).
- One test of the Environment Agency waste carrier lookup with a real CBDU number (not verifiable from the build environment).

## Known gaps at launch (not blockers)

- Nseya Consultancy and Nseya Construction logos: the group mark is used until the files are supplied.
- ETABLIX: only the Prime delivery model is shown until the other two names are supplied.
- Legal pages (privacy, cookies, terms, accessibility, modern slavery) are drafts: have them reviewed.
- Reading ease: most pages score below the specification's target of 50; decision pending.
- Graduate Academy intake dates are shown as planned.
- The site says trading starts in January 2027, which stays true if it goes live before then.

## After go-live

- Vercel Cron runs `/api/cron/daily` at 03:17 UTC (reminders, retention, CONSTRUX export). Check the first run in Vercel → Logs.
- etablix.com: add the footer line "ETABLIX is a Nseya Group Construction company" linking to https://www.nseyagroup.com.
- jnseya.co.uk stays live, unchanged, until its content moves (by October 2027).
