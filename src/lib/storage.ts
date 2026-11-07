import { getDb } from "@/lib/db/client";
import { ObjectId } from "mongodb";

export const MAX_LOGO_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
export const ALLOWED_LOGO_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

export interface SaveLogoOptions {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  ownerId: string;
}

/**
 * Uploads an image asset to persistent storage (Vercel Blob if configured,
 * otherwise MongoDB assets collection fallback).
 */
export async function saveLogoAsset({
  buffer,
  filename,
  mimeType,
  ownerId,
}: SaveLogoOptions): Promise<string> {
  // Validate file size
  if (buffer.length > MAX_LOGO_FILE_SIZE) {
    throw new Error("Logo file size exceeds the 2 MB limit.");
  }

  // Validate MIME type
  const normalizedMime = mimeType.toLowerCase();
  if (!ALLOWED_LOGO_MIME_TYPES.includes(normalizedMime)) {
    throw new Error(
      "Invalid file type. Only PNG, JPG, JPEG, and WebP images are supported."
    );
  }

  const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");

  // Strategy A: Vercel Blob (if token configured)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      const blob = await put(
        `logos/${ownerId}-${Date.now()}-${cleanFilename}`,
        buffer,
        {
          access: "public",
          contentType: normalizedMime,
        }
      );
      return blob.url;
    } catch (blobError) {
      console.warn("Vercel Blob upload failed, falling back to DB asset storage:", blobError);
    }
  }

  // Strategy B: MongoDB assets collection (local dev & zero-config fallback)
  const db = await getDb();
  const assetDoc = {
    ownerId,
    filename: cleanFilename,
    mimeType: normalizedMime,
    size: buffer.length,
    data: buffer,
    createdAt: new Date(),
  };

  const result = await db.collection("assets").insertOne(assetDoc);
  return `/api/assets/${result.insertedId.toString()}`;
}

/**
 * Checks whether an asset is still referenced by any existing invoice.
 * If referenced, historical integrity requires that it MUST NOT be deleted.
 */
export async function isAssetReferencedByAnyInvoice(
  logoUrl: string
): Promise<boolean> {
  if (!logoUrl) return false;
  const db = await getDb();
  const count = await db.collection("invoices").countDocuments({ logoUrl });
  return count > 0;
}

/**
 * Deletes an asset only if it is no longer referenced by any invoice.
 */
export async function deleteAssetIfUnused(
  logoUrl: string,
  ownerId: string
): Promise<boolean> {
  if (!logoUrl) return false;

  // Historical preservation: Never delete assets referenced by invoices
  const isReferenced = await isAssetReferencedByAnyInvoice(logoUrl);
  if (isReferenced) {
    return false; // Preserved for historical invoices
  }

  const db = await getDb();

  // If stored in MongoDB
  if (logoUrl.startsWith("/api/assets/")) {
    const id = logoUrl.replace("/api/assets/", "");
    if (ObjectId.isValid(id)) {
      await db.collection("assets").deleteOne({
        _id: new ObjectId(id),
        ownerId,
      });
      return true;
    }
  }

  // If stored in Vercel Blob
  if (process.env.BLOB_READ_WRITE_TOKEN && logoUrl.includes("vercel-storage.com")) {
    try {
      const { del } = await import("@vercel/blob");
      await del(logoUrl);
      return true;
    } catch (err) {
      console.warn("Failed to delete Vercel Blob asset:", err);
    }
  }

  return false;
}
