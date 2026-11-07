import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { PublicInvoice } from "@/types";

interface RouteParams {
  params: Promise<{ token: string }>;
}

/**
 * GET /api/invoices/share/[token]
 * Public unauthenticated endpoint to view an invoice shared via link
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { token } = await params;

  if (!token || typeof token !== "string" || token.length < 16) {
    return NextResponse.json(
      { error: "Invalid or expired share link." },
      { status: 404 }
    );
  }

  try {
    const db = await getDb();
    const invoice = await db.collection("invoices").findOne({
      shareToken: token,
      isPublicShareEnabled: true,
    });

    if (!invoice) {
      return NextResponse.json(
        {
          error:
            "This invoice link is either invalid, disabled by the issuer, or no longer available.",
        },
        { status: 404 }
      );
    }

    // Sanitize data: Do not expose ownerId, internal _id, or private system metadata
    const publicInvoice: PublicInvoice = {
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate || "",
      currency: invoice.currency,
      logoUrl: invoice.logoUrl || "",
      sender: {
        name: invoice.sender?.name || "",
        email: invoice.sender?.email || "",
        phone: invoice.sender?.phone || "",
        address: invoice.sender?.address || "",
      },
      customer: {
        name: invoice.customer?.name || "",
        email: invoice.customer?.email || "",
        phone: invoice.customer?.phone || "",
        address: invoice.customer?.address || "",
      },
      items: invoice.items || [],
      subtotal: invoice.subtotal || 0,
      total: invoice.total || 0,
      notes: invoice.notes || "",
      paymentInstructions: invoice.paymentInstructions || "",
      status: invoice.status || "sent",
      updatedAt:
        invoice.updatedAt?.toISOString?.() || new Date().toISOString(),
    };

    return NextResponse.json({ data: publicInvoice });
  } catch (error) {
    console.error("Failed to fetch public shared invoice:", error);
    return NextResponse.json(
      { error: "Failed to retrieve invoice." },
      { status: 500 }
    );
  }
}
