# Nseya Groupe Construction — group website

Phase 1 ("Minimum Credible Site") of the group website, built to the *Website Requirements Specification* of 24 November 2026. See `CLAUDE.md` for the rules every change must follow.

## Run it locally

```bash
npm install
cp .env.example .env.local   # optional: everything works without it in development
npm run dev                  # http://localhost:3000
```

Without `DATABASE_URL`, form records go to `storage/dev-db.json` and emails to `storage/outbox/`. Set `SHOW_DRAFTS=1` to see draft vacancies and other draft content.

With PostgreSQL:

```bash
export DATABASE_URL=postgresql://user@localhost:5432/nseya
npm run db:migrate
```

## Checks

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

## Where things live

| What | Where |
| --- | --- |
| Legal-entity footer, contact details, leadership | `src/content/settings.ts` |
| Companies, services, sectors | `src/content/companies.ts`, `services.ts`, `sectors.ts` |
| Vacancies | `src/content/vacancies.ts` |
| Policies and accreditations | `src/content/policies.ts` |
| Design tokens and components CSS | `src/app/globals.css` |
| Form engine (store, email, uploads, spam) | `src/lib/forms/` |
| Daily job (reminders, retention, CONSTRUX export) | `src/app/api/cron/daily` |

Search the code for `TO CONFIRM` for everything that needs an answer from Justin before launch.
