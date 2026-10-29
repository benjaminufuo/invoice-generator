import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { getSessionUser } from "@/lib/auth/session";
import { invoiceUpdateSchema } from "@/lib/validations/invoice";
import { calculateLineTotal, calculateSubtotal } from "@/lib/calculations";
import { ObjectId } from "mongodb";

interface RouteParams {
  params: Promise<{ id: string }>;
}

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

    return NextResponse.json({
      data: {
        _id: invoice._id.toString(),
        ownerId: invoice.ownerId,
        invoiceNumber: invoice.invoiceNumber,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate || "",
        currency: invoice.currency,
        sender: invoice.sender,
        customer: invoice.customer,
        items: invoice.items,
        subtotal: invoice.subtotal,
        total: invoice.total,
        notes: invoice.notes || "",
        paymentInstructions: invoice.paymentInstructions || "",
        status: invoice.status || "draft",
        createdAt: invoice.createdAt?.toISOString?.() || new Date().toISOString(),
        updatedAt: invoice.updatedAt?.toISOString?.() || new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Failed to fetch invoice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const result = invoiceUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Check if updating invoiceNumber to one that conflicts with another invoice
    if (result.data.invoiceNumber) {
      const conflict = await db.collection("invoices").findOne({
        _id: { $ne: new ObjectId(id) },
        ownerId: user.id,
        invoiceNumber: result.data.invoiceNumber.trim(),
      });
      if (conflict) {
        return NextResponse.json(
          { error: "An invoice with this invoice number already exists." },
          { status: 409 }
        );
      }
    }

    const updateFields: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (result.data.invoiceNumber) updateFields.invoiceNumber = result.data.invoiceNumber.trim();
    if (result.data.issueDate) updateFields.issueDate = result.data.issueDate;
    if (result.data.dueDate !== undefined) updateFields.dueDate = result.data.dueDate || undefined;
    if (result.data.currency) updateFields.currency = result.data.currency;
    if (result.data.sender) updateFields.sender = result.data.sender;
    if (result.data.customer) updateFields.customer = result.data.customer;
    if (result.data.notes !== undefined) updateFields.notes = result.data.notes;
    if (result.data.paymentInstructions !== undefined)
      updateFields.paymentInstructions = result.data.paymentInstructions;
    if (result.data.status) updateFields.status = result.data.status;

    // Recalculate financial fields if items are updated
    if (result.data.items) {
      const calculatedItems = result.data.items.map((item) => ({
        description: item.description.trim(),
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        lineTotal: calculateLineTotal(Number(item.quantity), Number(item.unitPrice)),
      }));
      const subtotal = calculateSubtotal(calculatedItems);
      updateFields.items = calculatedItems;
      updateFields.subtotal = subtotal;
      updateFields.total = subtotal;
    }

    const updateResult = await db.collection("invoices").findOneAndUpdate(
      { _id: new ObjectId(id), ownerId: user.id },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (!updateResult) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        _id: updateResult._id.toString(),
        ownerId: updateResult.ownerId,
        invoiceNumber: updateResult.invoiceNumber,
        issueDate: updateResult.issueDate,
        dueDate: updateResult.dueDate || "",
        currency: updateResult.currency,
        sender: updateResult.sender,
        customer: updateResult.customer,
        items: updateResult.items,
        subtotal: updateResult.subtotal,
        total: updateResult.total,
        notes: updateResult.notes || "",
        paymentInstructions: updateResult.paymentInstructions || "",
        status: updateResult.status || "draft",
        createdAt: updateResult.createdAt?.toISOString?.() || new Date().toISOString(),
        updatedAt: updateResult.updatedAt?.toISOString?.() || new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Failed to update invoice:", error);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}

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
    const deleteResult = await db.collection("invoices").deleteOne({
      _id: new ObjectId(id),
      ownerId: user.id,
    });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Failed to delete invoice:", error);
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
  }
}
