import { getDb } from "./db/client";

/**
 * Generates the next sequential invoice number for a user.
 * Format: INV-YYYY-NNNN (e.g. INV-2026-0001)
 */
export async function getNextInvoiceNumber(ownerId: string): Promise<string> {
  const db = await getDb();
  const currentYear = new Date().getFullYear();
  const prefix = `INV-${currentYear}-`;

  // Count existing invoices for this owner with the current year prefix
  const count = await db.collection("invoices").countDocuments({
    ownerId,
    invoiceNumber: { $regex: `^${prefix}` },
  });

  const nextSeq = (count + 1).toString().padStart(4, "0");
  const candidateNumber = `${prefix}${nextSeq}`;

  // Check if candidate exists (in case an invoice was deleted or manual numbering was used)
  const exists = await db.collection("invoices").findOne({
    ownerId,
    invoiceNumber: candidateNumber,
  });

  if (!exists) {
    return candidateNumber;
  }

  // Fallback to timestamp-based sequence if collision
  return `${prefix}${(count + 100).toString().padStart(4, "0")}`;
}
