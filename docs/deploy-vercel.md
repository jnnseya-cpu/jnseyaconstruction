# Deploying to Vercel (WEB-13)

The site runs on Vercel Pro. Vercel's Hobby plan is for non-commercial use only, so the group site needs a Pro team. Personal data stays in London: functions run in `lhr1` (see `vercel.json`), and the database and upload bucket are in London too.

Nothing here is done without Justin's written go-ahead in the ticket: production deploys, DNS changes and secrets are his to approve.

## 1. Services to create (all in London)

| Service | Suggested | Notes |
| --- | --- | --- |
| PostgreSQL | Neon (Vercel integration), region `aws-eu-west-2` | Use the **pooled** connection string for `DATABASE_URL`. Run `npm run db:migrate` once against it. Daily backups kept 30 days (section 8). |
| Upload bucket | AWS S3 `eu-west-2`, or Google Cloud Storage `europe-west2` | Private: block all public access. One bucket per environment (staging, production). |
| Email | Mailboxes on Microsoft 365; site emails through a transactional SMTP service | See `docs/email-setup.md`. SPF, DKIM and DMARC on nseyagroup.com before launch. |
| Spam protection | Cloudflare Turnstile | Site key and secret key. |

### Bucket settings

CORS, so browsers can PUT files straight to the bucket (replace the origin per environment):

```json
[{ "AllowedOrigins": ["https://www.nseyagroup.com"], "AllowedMethods": ["PUT"], "AllowedHeaders": ["content-type"], "MaxAgeSeconds": 3000 }]
```

Lifecycle rule: delete objects under `incoming/` after 1 day. Those are uploads whose form was never sent.

Access key: a user or service account that can only `PutObject`, `GetObject`, `DeleteObject` and `CopyObject`/`HeadObject` on this bucket. For Google Cloud Storage, create an HMAC key and set `S3_ENDPOINT=https://storage.googleapis.com`.

Layout:

- `incoming/<id>`: written by browsers with a signed URL (valid 15 minutes, exact size and type)
- `files/<id>`: claimed files attached to a record; deleted with the record under the retention rules
- `exports/construx-suppliers-YYYY-MM-DD.csv`: daily CONSTRUX supplier export

## 2. Vercel project

1. Import the GitHub repository into the Vercel team. Framework: Next.js (detected).
2. Every pull request gets a preview deployment; that is the preview link for Justin's review (section 11a).
3. Environment variables (Settings → Environment Variables), separately for Preview and Production. Names are in `.env.example`. Secrets are entered there by Justin, never in chat or the repository:
   - `DATABASE_URL`, `SESSION_SECRET`, `UPLOAD_SECRET`, `CRON_SECRET`
   - `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT` (GCS only), `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
   - `SMTP_URL`, `EMAIL_FROM`
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`
   - `COMPANIES_HOUSE_API_KEY`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, `NEXT_PUBLIC_CONTACT_PHONE`, `NEXT_PUBLIC_BOOKING_URL`
   - Production only: `SITE_URL=https://www.nseyagroup.com`, `SITE_ENV=production` (allows indexing)
4. Vercel Cron calls `/api/cron/daily` at 03:17 UTC each day and sends `Authorization: Bearer $CRON_SECRET` automatically once `CRON_SECRET` is set.

## 3. Domains

In the Vercel project add `www.nseyagroup.com` as the primary domain, and add `nseyagroup.com`, `nseyagroup.co.uk`, `nseya.uk` and `nseyagroupe.com` (and their `www` hosts) set to redirect (308) to `www.nseyagroup.com`. `src/middleware.ts` also redirects them with a 301 if they reach the app.

DNS at the registrar: the records Vercel shows for each domain (an `A` record for the apex and a `CNAME` for `www`). Keep the MX, SPF, DKIM and DMARC records for email.

## 4. Before go-live

Run the Phase 1 launch checklist in section 11 of the specification, then submit `https://www.nseyagroup.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
