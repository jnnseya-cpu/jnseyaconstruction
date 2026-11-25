import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Private object storage for uploads. Two areas:
 *   incoming/<id>  written by the browser with a signed PUT; deleted after 1 day if never claimed
 *   files/<id>     claimed files attached to a record; never public
 *
 * Production (Vercel): any S3-compatible private bucket in London, set with
 * S3_BUCKET, S3_REGION (eu-west-2), S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY,
 * and S3_ENDPOINT for a non-AWS service (Google Cloud Storage interoperability:
 * https://storage.googleapis.com). Development without S3_BUCKET: UPLOAD_DIR
 * on disk, with uploads PUT to /api/uploads/local.
 */

export const usesS3 = () => !!process.env.S3_BUCKET;

let client: S3Client | null = null;
function s3() {
  client ??= new S3Client({
    region: process.env.S3_REGION || "eu-west-2",
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: !!process.env.S3_ENDPOINT,
    credentials:
      process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
        ? { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY }
        : undefined,
  });
  return client;
}
const bucket = () => process.env.S3_BUCKET!;

function assertStorage() {
  if (!usesS3() && process.env.VERCEL) throw new Error("S3_BUCKET is not set. Vercel has no persistent disk for uploads.");
}

const localRoot = () => path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? "./storage/uploads");
/** Claimed files stay at UPLOAD_DIR/<id> so earlier records keep working. */
const localPath = (area: "incoming" | "files", id: string) => (area === "files" ? path.join(localRoot(), id) : path.join(localRoot(), "incoming", id));
const safeId = (id: string) => {
  if (!/^[0-9a-f-]{36}\.[a-z0-9]{2,5}$/.test(id)) throw new Error("Bad upload id");
  return id;
};

/** URL the browser PUTs the file to. Expires after 15 minutes. */
export async function signedPutUrl(id: string, contentType: string, size: number, localToken: string): Promise<string> {
  assertStorage();
  safeId(id);
  if (!usesS3()) return `/api/uploads/local?t=${encodeURIComponent(localToken)}`;
  return getSignedUrl(
    s3(),
    new PutObjectCommand({ Bucket: bucket(), Key: `incoming/${id}`, ContentType: contentType, ContentLength: size }),
    { expiresIn: 900, signableHeaders: new Set(["content-type", "content-length"]) },
  );
}

/** Size of an object, or null when it does not exist. */
export async function sizeOf(area: "incoming" | "files", id: string): Promise<number | null> {
  safeId(id);
  if (!usesS3()) {
    try {
      return (await fs.stat(localPath(area, id))).size;
    } catch {
      return null;
    }
  }
  try {
    const h = await s3().send(new HeadObjectCommand({ Bucket: bucket(), Key: `${area}/${id}` }));
    return h.ContentLength ?? null;
  } catch {
    return null;
  }
}

/** Whole object as bytes (files are at most 20MB). */
export async function readObject(area: "incoming" | "files", id: string): Promise<Buffer> {
  safeId(id);
  if (!usesS3()) return fs.readFile(localPath(area, id));
  const r = await s3().send(new GetObjectCommand({ Bucket: bucket(), Key: `${area}/${id}` }));
  return Buffer.from(await r.Body!.transformToByteArray());
}

export async function writeObject(area: "incoming" | "files", id: string, body: Buffer, contentType: string) {
  assertStorage();
  safeId(id);
  if (!usesS3()) {
    await fs.mkdir(path.dirname(localPath(area, id)), { recursive: true });
    await fs.writeFile(localPath(area, id), body, { mode: 0o600 });
    return;
  }
  await s3().send(new PutObjectCommand({ Bucket: bucket(), Key: `${area}/${id}`, Body: body, ContentType: contentType }));
}

/** Move a claimed upload from incoming/ to files/. */
export async function promote(id: string) {
  safeId(id);
  if (!usesS3()) {
    await fs.mkdir(localRoot(), { recursive: true });
    await fs.rename(localPath("incoming", id), localPath("files", id));
    return;
  }
  await s3().send(new CopyObjectCommand({ Bucket: bucket(), Key: `files/${id}`, CopySource: `${bucket()}/incoming/${id}` }));
  await s3().send(new DeleteObjectCommand({ Bucket: bucket(), Key: `incoming/${id}` }));
}

export async function removeObject(area: "incoming" | "files", id: string) {
  safeId(id);
  if (!usesS3()) {
    await fs.rm(localPath(area, id), { force: true });
    return;
  }
  await s3().send(new DeleteObjectCommand({ Bucket: bucket(), Key: `${area}/${id}` }));
}

/**
 * Delete unclaimed local uploads older than a day. On S3 a bucket lifecycle
 * rule on the incoming/ prefix does this (see docs/deploy-vercel.md).
 */
export async function purgeIncoming(maxAgeMs = 86400_000): Promise<number> {
  if (usesS3()) return 0;
  const dir = path.join(localRoot(), "incoming");
  let n = 0;
  try {
    for (const f of await fs.readdir(dir)) {
      const st = await fs.stat(path.join(dir, f));
      if (Date.now() - st.mtimeMs > maxAgeMs) {
        await fs.rm(path.join(dir, f), { force: true });
        n++;
      }
    }
  } catch {
    /* no incoming dir yet */
  }
  return n;
}

/** Daily CONSTRUX export: bucket exports/ on S3, EXPORT_DIR on disk. */
export async function writeExport(name: string, body: string) {
  if (!/^[\w.-]+\.csv$/.test(name)) throw new Error("Bad export name");
  if (usesS3()) {
    await s3().send(new PutObjectCommand({ Bucket: bucket(), Key: `exports/${name}`, Body: body, ContentType: "text/csv" }));
    return `exports/${name}`;
  }
  assertStorage();
  const dir = path.resolve(process.cwd(), process.env.EXPORT_DIR ?? "./storage/exports");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), body, { mode: 0o600 });
  return path.join(dir, name);
}

/** Every stored-file id inside a record (CVs, attachments, supplier documents). */
export function collectFileIds(data: unknown, out: string[] = []): string[] {
  if (Array.isArray(data)) data.forEach((d) => collectFileIds(d, out));
  else if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (typeof o.id === "string" && /^[0-9a-f-]{36}\.[a-z0-9]{2,5}$/.test(o.id) && typeof o.scan === "string") out.push(o.id);
    else Object.values(o).forEach((v) => collectFileIds(v, out));
  }
  return out;
}
