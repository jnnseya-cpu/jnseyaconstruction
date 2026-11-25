# Nseya Groupe Construction — group website

Every page follows sections 5 to 9 of the *Nseya Groupe Construction — Website Requirements Specification* (24 Nov 2026). Phase 1 goes live on 4 January 2027.

## Stack
- Next.js 15 (App Router), React 19, TypeScript 5 (strict). Static generation for content pages; server actions for forms.
- Content: typed files in `src/content/*` read only through `src/lib/cms.ts`. These mirror the CMS content types (page, service, sector, vacancy, policy document, accreditation, article, case study, company settings). Moving to Payload CMS (WEB-03) means re-implementing `src/lib/cms.ts` only.
- Records: PostgreSQL via `DATABASE_URL` (`scripts/schema.sql`, `npm run db:migrate`). Without it, development uses `storage/dev-db.json`. Production refuses to start forms without a database.
- Uploads: private storage (`UPLOAD_DIR`), never under `/public`. Email: SMTP via `SMTP_URL`; dev writes to `storage/outbox`.
- Hosting target: Google Cloud Run (UK/EU region) with CDN; staging and production.
- Domain (D1, decided 25 Nov 2026): https://nseyagroup.com. nseyagroup.co.uk, nseya.uk and nseyagroupe.com 301 to it (`src/middleware.ts`, list in `src/content/settings.ts`). Group mailboxes: hello@, careers@, suppliers@, justin@.

## Brand tokens (section 3) — `src/app/globals.css`
Navy #0E2A3B base; Teal #1BA996 (group, Consultancy); Amber #F2A20C (ETABLIX); Cobalt #1E5AA8 (Construction); Slate #5B6770; Concrete #E6E8EA; White.
Text on white must use #138172 (teal) and #9A6200 (amber). Accent per company via `data-company="consultancy|etablix|construction|group"`.
IBM Plex Sans (headings 600, body 400), IBM Plex Mono for labels, figures and drawing annotations. Self-hosted via @fontsource.

## Rules that must never break
- **Legal-entity footer on every page**, read from `src/content/settings.ts` (`groupLegalEntity`, or a company's `legalEntity` once incorporated). Never hard-code it elsewhere.
- **Honesty rules**: no implied trading history, turnover, staff numbers or completed projects. Founder's experience is shown as Justin's, never the company's. Accreditations only with certificates and expiry dates; otherwise "in progress". Client logos only with written permission. Targets are labelled "Target". Illustrative drawings are labelled "Illustrative".
- ETABLIX is a separate website: every ETABLIX mention links to etablix.com labelled "Visit etablix.com". Prime is never offered as available.
- No AI-generated imagery; no stock presented as our work. No banned copy words: cutting-edge, seamless, unlock, empower, elevate, world-class, "solutions" as filler.
- Forms: server-side validation, honeypot + Turnstile, reference number on screen and in email, consent never pre-ticked, no bank details or right-to-work documents on open forms, equality data stored separately.
- A `"use server"` module may export only async functions. Put schemas and constants in a sibling module.
- No personal data in logs (`logEvent`).

## Definition of done
`npm run typecheck`, `npm run lint`, `npm test` and `npm run build` pass; Lighthouse mobile 90+ and axe with no serious issues on changed pages; preview link posted on the pull request.

## Process
- Never deploy to production, change DNS or edit secrets without Justin's written go-ahead in the ticket.
- Commit messages and branch names reference the ticket ID (for example WEB-07).
- Secrets live in the hosting provider's secret store only (see `.env.example` for names).
- Anything marked `TO CONFIRM` in the code needs Justin's answer before launch.
