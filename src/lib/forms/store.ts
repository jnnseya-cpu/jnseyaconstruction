import "server-only";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Pool } from "pg";

/**
 * Record store (section 6: "every form writes to one record store").
 *
 * Production: PostgreSQL (Cloud SQL) via DATABASE_URL, schema in
 * scripts/schema.sql. Development without a database: a JSON file under
 * ./storage. Both implement the same small interface.
 */

export type RecordKind =
  | "enquiry"
  | "diagnostic"
  | "contact"
  | "newsletter"
  | "supplier"
  | "supplier_draft"
  | "application"
  | "equality"
  | "referral"
  | "talent_pool"
  | "login_token"
  | "job_alert"
  | "event_log";

export interface StoredRecord<T = Record<string, unknown>> {
  id: string;
  kind: RecordKind;
  ref: string | null;
  data: T;
  createdAt: string;
  updatedAt: string;
  /** Retention: record is deleted by the daily job after this instant. */
  expiresAt: string | null;
}

interface Store {
  nextSequence(key: string): Promise<number>;
  insert<T>(kind: RecordKind, data: T, opts?: { ref?: string; expiresAt?: Date | null; id?: string }): Promise<StoredRecord<T>>;
  get<T>(kind: RecordKind, id: string): Promise<StoredRecord<T> | null>;
  findByRef<T>(kind: RecordKind, ref: string): Promise<StoredRecord<T> | null>;
  list<T>(kind: RecordKind): Promise<StoredRecord<T>[]>;
  update<T>(kind: RecordKind, id: string, data: T, opts?: { expiresAt?: Date | null }): Promise<void>;
  remove(kind: RecordKind, id: string): Promise<void>;
  purgeExpired(now?: Date): Promise<number>;
}

/* ---------------- PostgreSQL ---------------- */

let pool: Pool | null = null;
function getPool() {
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
  return pool;
}

type Row = { id: string; kind: RecordKind; ref: string | null; data: unknown; created_at: Date; updated_at: Date; expires_at: Date | null };
const fromRow = <T>(r: Row): StoredRecord<T> => ({
  id: r.id,
  kind: r.kind,
  ref: r.ref,
  data: r.data as T,
  createdAt: r.created_at.toISOString(),
  updatedAt: r.updated_at.toISOString(),
  expiresAt: r.expires_at ? r.expires_at.toISOString() : null,
});

const pgStore: Store = {
  async nextSequence(key) {
    const { rows } = await getPool().query<{ value: number }>(
      `INSERT INTO counters (key, value) VALUES ($1, 1)
       ON CONFLICT (key) DO UPDATE SET value = counters.value + 1
       RETURNING value`,
      [key],
    );
    return rows[0].value;
  },
  async insert(kind, data, opts = {}) {
    const { rows } = await getPool().query<Row>(
      `INSERT INTO records (id, kind, ref, data, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [opts.id ?? randomUUID(), kind, opts.ref ?? null, JSON.stringify(data), opts.expiresAt ?? null],
    );
    return fromRow(rows[0]);
  },
  async get(kind, id) {
    const { rows } = await getPool().query<Row>(`SELECT * FROM records WHERE kind = $1 AND id = $2`, [kind, id]);
    return rows[0] ? fromRow(rows[0]) : null;
  },
  async findByRef(kind, ref) {
    const { rows } = await getPool().query<Row>(`SELECT * FROM records WHERE kind = $1 AND ref = $2`, [kind, ref]);
    return rows[0] ? fromRow(rows[0]) : null;
  },
  async list(kind) {
    const { rows } = await getPool().query<Row>(`SELECT * FROM records WHERE kind = $1 ORDER BY created_at`, [kind]);
    return rows.map((r) => fromRow(r));
  },
  async update(kind, id, data, opts = {}) {
    if (opts.expiresAt !== undefined) {
      await getPool().query(`UPDATE records SET data = $3, updated_at = now(), expires_at = $4 WHERE kind = $1 AND id = $2`, [
        kind,
        id,
        JSON.stringify(data),
        opts.expiresAt,
      ]);
    } else {
      await getPool().query(`UPDATE records SET data = $3, updated_at = now() WHERE kind = $1 AND id = $2`, [kind, id, JSON.stringify(data)]);
    }
  },
  async remove(kind, id) {
    await getPool().query(`DELETE FROM records WHERE kind = $1 AND id = $2`, [kind, id]);
  },
  async purgeExpired(now = new Date()) {
    const res = await getPool().query(`DELETE FROM records WHERE expires_at IS NOT NULL AND expires_at < $1`, [now]);
    return res.rowCount ?? 0;
  },
};

/* ---------------- JSON file (development only) ---------------- */

type FileDb = { counters: Record<string, number>; records: StoredRecord[] };
const dbFile = () => path.resolve(process.cwd(), "storage", "dev-db.json");
let chain: Promise<unknown> = Promise.resolve();

async function withDb<R>(fn: (db: FileDb) => R | Promise<R>, write = false): Promise<R> {
  const run = async () => {
    let db: FileDb = { counters: {}, records: [] };
    try {
      db = JSON.parse(await fs.readFile(dbFile(), "utf8"));
    } catch {
      /* first run */
    }
    const out = await fn(db);
    if (write) {
      await fs.mkdir(path.dirname(dbFile()), { recursive: true });
      await fs.writeFile(dbFile(), JSON.stringify(db, null, 2));
    }
    return out;
  };
  const p = chain.then(run, run);
  chain = p.catch(() => undefined);
  return p;
}

const fileStore: Store = {
  nextSequence: (key) => withDb((db) => (db.counters[key] = (db.counters[key] ?? 0) + 1), true),
  insert: (kind, data, opts = {}) =>
    withDb((db) => {
      const now = new Date().toISOString();
      const rec = {
        id: opts.id ?? randomUUID(),
        kind,
        ref: opts.ref ?? null,
        data,
        createdAt: now,
        updatedAt: now,
        expiresAt: opts.expiresAt ? opts.expiresAt.toISOString() : null,
      };
      db.records.push(rec as StoredRecord);
      return rec;
    }, true),
  get: (kind, id) => withDb((db) => (db.records.find((r) => r.kind === kind && r.id === id) as never) ?? null),
  findByRef: (kind, ref) => withDb((db) => (db.records.find((r) => r.kind === kind && r.ref === ref) as never) ?? null),
  list: (kind) => withDb((db) => db.records.filter((r) => r.kind === kind) as never),
  update: (kind, id, data, opts = {}) =>
    withDb((db) => {
      const r = db.records.find((x) => x.kind === kind && x.id === id);
      if (r) {
        r.data = data as Record<string, unknown>;
        r.updatedAt = new Date().toISOString();
        if (opts.expiresAt !== undefined) r.expiresAt = opts.expiresAt ? opts.expiresAt.toISOString() : null;
      }
    }, true),
  remove: (kind, id) =>
    withDb((db) => {
      db.records = db.records.filter((r) => !(r.kind === kind && r.id === id));
    }, true),
  purgeExpired: (now = new Date()) =>
    withDb((db) => {
      const before = db.records.length;
      db.records = db.records.filter((r) => !r.expiresAt || new Date(r.expiresAt) >= now);
      return before - db.records.length;
    }, true),
};

export function store(): Store {
  if (process.env.DATABASE_URL) return pgStore;
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_FILE_STORE !== "1") {
    throw new Error("DATABASE_URL is not set. The file store is for development only.");
  }
  return fileStore;
}

/** Reference numbers such as ENQ-2027-0001 (section 6, rule 5). */
export async function nextReference(prefix: "ENQ" | "DIA" | "GEN" | "SUP" | "APP" | "TAL", now = new Date()): Promise<string> {
  const year = new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: "Europe/London" }).format(now);
  const n = await store().nextSequence(`${prefix}-${year}`);
  return formatReference(prefix, year, n);
}

export function formatReference(prefix: string, year: string, n: number) {
  return `${prefix}-${year}-${String(n).padStart(4, "0")}`;
}

export const addMonths = (d: Date, months: number) => {
  const x = new Date(d);
  x.setMonth(x.getMonth() + months);
  return x;
};
export const addYears = (d: Date, years: number) => addMonths(d, years * 12);
