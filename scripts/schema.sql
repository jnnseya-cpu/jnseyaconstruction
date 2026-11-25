-- Form record store (spec section 6 and 8). Run with: npm run db:migrate
CREATE TABLE IF NOT EXISTS counters (
  key   text PRIMARY KEY,
  value integer NOT NULL
);

CREATE TABLE IF NOT EXISTS records (
  id          text PRIMARY KEY,
  kind        text NOT NULL,
  ref         text,
  data        jsonb NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz
);

CREATE INDEX IF NOT EXISTS records_kind_idx ON records (kind, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS records_kind_ref_idx ON records (kind, ref) WHERE ref IS NOT NULL;
CREATE INDEX IF NOT EXISTS records_expires_idx ON records (expires_at) WHERE expires_at IS NOT NULL;
-- Supplier and login lookups by e-mail
CREATE INDEX IF NOT EXISTS records_email_idx ON records ((data->>'email')) ;
