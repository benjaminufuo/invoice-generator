import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { getSessionUser } from "@/lib/auth/session";
import { ObjectId } from "mongodb";
import { randomBytes } from "crypto";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/invoices/[id]/share
 * Get sharing status and public URL for an invoice
 */
export async function GET(request: Request, { params }: RouteParams) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  try {
    const db = await getDb();
    const invoice = await db.collection("invoices").findOne({
      _id: new ObjectId(id),
      ownerId: user.id,
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const host =
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host") ||
      "";
    const proto = request.headers.get("x-forwarded-proto") || "https";
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (host ? `${proto}://${host}` : "http://localhost:3000");

    const shareToken = invoice.shareToken || "";
    const isPublicShareEnabled = Boolean(invoice.isPublicShareEnabled);
    const shareUrl = shareToken ? `${appUrl}/share/${shareToken}` : "";

    return NextResponse.json({
      data: {
        isPublicShareEnabled,
        shareToken,
        shareUrl,
      },
    });
  } catch (error) {
    console.error("Failed to get invoice share status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/invoices/[id]/share
 * Enable or re-enable public sharing for an invoice
 */
export async function POST(request: Request, { params }: RouteParams) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  try {
    const db = await getDb();
    const invoice = await db.collection("invoices").findOne({
      _id: new ObjectId(id),
      ownerId: user.id,
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Generate token if not already assigned
    const shareToken = invoice.shareToken || randomBytes(16).toString("hex");

    await db.collection("invoices").updateOne(
      { _id: new ObjectId(id), ownerId: user.id },
      {
        $set: {
          shareToken,
          isPublicShareEnabled: true,
          shareTokenCreatedAt: invoice.shareTokenCreatedAt || new Date().toISOString(),
          updatedAt: new Date(),
        },
      }
    );

    const host =
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host") ||
      "";
    const proto = request.headers.get("x-forwarded-proto") || "https";
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (host ? `${proto}://${host}` : "http://localhost:3000");

    const shareUrl = `${appUrl}/share/${shareToken}`;

    return NextResponse.json({
      data: {
        isPublicShareEnabled: true,
        shareToken,
        shareUrl,
        message: "Public link enabled.",
      },
    });
  } catch (error) {
    console.error("Failed to enable invoice share:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/invoices/[id]/share
 * Revoke/disable public access to an invoice
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  try {
    const db = await getDb();
    const invoice = await db.collection("invoices").findOne({
      _id: new ObjectId(id),
      ownerId: user.id,
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    await db.collection("invoices").updateOne(
      { _id: new ObjectId(id), ownerId: user.id },
      {
        $set: {
          isPublicShareEnabled: false,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      data: {
        isPublicShareEnabled: false,
        message: "Public share link revoked.",
      },
    });
  } catch (error) {
    console.error("Failed to disable invoice share:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
