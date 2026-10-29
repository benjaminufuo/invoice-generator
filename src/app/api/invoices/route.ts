import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { getSessionUser } from "@/lib/auth/session";
import { invoiceCreateSchema } from "@/lib/validations/invoice";
import { calculateLineTotal, calculateSubtotal } from "@/lib/calculations";
import { getNextInvoiceNumber } from "@/lib/invoice-number";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const query: Record<string, unknown> = { ownerId: user.id };

    if (status && ["draft", "sent", "paid"].includes(status)) {
      query.status = status;
    }

    if (search && search.trim()) {
      const regex = { $regex: search.trim(), $options: "i" };
      query.$or = [
        { invoiceNumber: regex },
        { "customer.name": regex },
        { "customer.email": regex },
      ];
    }

    const db = await getDb();
    const invoices = await db
      .collection("invoices")
      .find(query)
      .sort({ updatedAt: -1 })
      .toArray();

    const formatted = invoices.map((inv) => ({
      _id: inv._id.toString(),
      ownerId: inv.ownerId,
      invoiceNumber: inv.invoiceNumber,
      issueDate: inv.issueDate,
      dueDate: inv.dueDate || "",
      currency: inv.currency,
      sender: inv.sender,
      customer: inv.customer,
      items: inv.items,
      subtotal: inv.subtotal,
      total: inv.total,
      notes: inv.notes || "",
      paymentInstructions: inv.paymentInstructions || "",
      status: inv.status || "draft",
      createdAt: inv.createdAt?.toISOString?.() || new Date().toISOString(),
      updatedAt: inv.updatedAt?.toISOString?.() || new Date().toISOString(),
    }));

    return NextResponse.json({ data: formatted });
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = invoiceCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Check uniqueness of invoiceNumber within owner's account
    const existing = await db.collection("invoices").findOne({
      ownerId: user.id,
      invoiceNumber: result.data.invoiceNumber.trim(),
    });

    if (existing) {
      return NextResponse.json(
        { error: "An invoice with this invoice number already exists." },
        { status: 409 }
      );
    }

    // Authoritative server-side recalculation of line totals and subtotal
    const calculatedItems = result.data.items.map((item) => ({
      description: item.description.trim(),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      lineTotal: calculateLineTotal(Number(item.quantity), Number(item.unitPrice)),
    }));

    const subtotal = calculateSubtotal(calculatedItems);
    const total = subtotal; // For MVP, total equals subtotal

    const now = new Date();
    const invoiceDoc = {
      ownerId: user.id,
      invoiceNumber: result.data.invoiceNumber.trim(),
      issueDate: result.data.issueDate,
      dueDate: result.data.dueDate || undefined,
      currency: result.data.currency,
      sender: {
        name: result.data.sender.name.trim(),
        email: result.data.sender.email?.trim() || "",
        phone: result.data.sender.phone?.trim() || "",
        address: result.data.sender.address?.trim() || "",
      },
      customer: {
        customerId: result.data.customer.customerId || undefined,
        name: result.data.customer.name.trim(),
        email: result.data.customer.email?.trim() || "",
        phone: result.data.customer.phone?.trim() || "",
        address: result.data.customer.address?.trim() || "",
      },
      items: calculatedItems,
      subtotal,
      total,
      notes: result.data.notes?.trim() || "",
      paymentInstructions: result.data.paymentInstructions?.trim() || "",
      status: result.data.status || "draft",
      createdAt: now,
      updatedAt: now,
    };

    const insertResult = await db.collection("invoices").insertOne(invoiceDoc);

    return NextResponse.json(
      {
        data: {
          _id: insertResult.insertedId.toString(),
          ...invoiceDoc,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create invoice:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
