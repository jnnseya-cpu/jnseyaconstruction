import "server-only";
import { store, type StoredRecord } from "@/lib/forms/store";
import { getSupplierSession, hashToken } from "./auth";
import type { SupplierDraftData, SupplierRecord } from "./model";

/** Server-side reads for the supplier pages (kept out of "use server" files so they are not callable actions). */
export async function loadDraft(token: string): Promise<StoredRecord<SupplierDraftData> | null> {
  if (!token || token.length > 100) return null;
  const rec = await store().findByRef<SupplierDraftData>("supplier_draft", hashToken(token));
  if (!rec || (rec.expiresAt && new Date(rec.expiresAt) < new Date())) return null;
  return rec;
}

export async function getSignedInSupplier(): Promise<StoredRecord<SupplierRecord> | null> {
  const id = await getSupplierSession();
  return id ? store().get<SupplierRecord>("supplier", id) : null;
}
