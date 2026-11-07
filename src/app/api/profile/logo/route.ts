import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import {
  saveLogoAsset,
  deleteAssetIfUnused,
  ALLOWED_LOGO_MIME_TYPES,
  MAX_LOGO_FILE_SIZE,
} from "@/lib/storage";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getDb();
    const profile = await db
      .collection("business_profiles")
      .findOne({ ownerId: user.id });

    return NextResponse.json({
      data: {
        logoUrl: profile?.logoUrl || null,
      },
    });
  } catch (err) {
    console.error("Failed to load profile logo:", err);
    return NextResponse.json(
      { error: "Failed to load profile logo" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 }
      );
    }

    if (file.size > MAX_LOGO_FILE_SIZE) {
      return NextResponse.json(
        { error: "Logo file exceeds the 2 MB limit." },
        { status: 400 }
      );
    }

    if (!ALLOWED_LOGO_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        {
          error:
            "Invalid file format. Please upload a PNG, JPG, JPEG, or WebP image.",
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload & save asset
    const logoUrl = await saveLogoAsset({
      buffer,
      filename: file.name,
      mimeType: file.type,
      ownerId: user.id,
    });

    const db = await getDb();
    const existingProfile = await db
      .collection("business_profiles")
      .findOne({ ownerId: user.id });

    const previousLogoUrl = existingProfile?.logoUrl;

    // Update user profile with latest logo
    await db.collection("business_profiles").updateOne(
      { ownerId: user.id },
      {
        $set: {
          logoUrl,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    // If there was an old logo, check if we can safely delete it (only if not used by historical invoices)
    if (previousLogoUrl && previousLogoUrl !== logoUrl) {
      deleteAssetIfUnused(previousLogoUrl, user.id).catch((err) =>
        console.warn("Background asset cleanup warning:", err)
      );
    }

    return NextResponse.json(
      {
        data: {
          logoUrl,
          message: "Business logo uploaded successfully.",
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Failed to upload logo:", err);
    const message =
      err instanceof Error ? err.message : "Failed to upload business logo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getDb();
    const existingProfile = await db
      .collection("business_profiles")
      .findOne({ ownerId: user.id });

    if (!existingProfile?.logoUrl) {
      return NextResponse.json({ success: true, message: "No logo to remove." });
    }

    const previousLogoUrl = existingProfile.logoUrl;

    // Remove logo reference from profile
    await db.collection("business_profiles").updateOne(
      { ownerId: user.id },
      {
        $unset: { logoUrl: "" },
        $set: { updatedAt: new Date() },
      }
    );

    // Attempt cleanup: will only delete if unreferenced by historical invoices
    deleteAssetIfUnused(previousLogoUrl, user.id).catch((err) =>
      console.warn("Background asset cleanup warning:", err)
    );

    return NextResponse.json({
      success: true,
      message: "Business logo removed from profile.",
    });
  } catch (err) {
    console.error("Failed to remove profile logo:", err);
    return NextResponse.json(
      { error: "Failed to remove business logo." },
      { status: 500 }
    );
  }
}
