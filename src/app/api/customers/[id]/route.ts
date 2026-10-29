import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { getSessionUser } from "@/lib/auth/session";
import { customerSchema } from "@/lib/validations/invoice";
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
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  try {
    const db = await getDb();
    const customer = await db.collection("customers").findOne({
      _id: new ObjectId(id),
      ownerId: user.id,
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        _id: customer._id.toString(),
        ownerId: customer.ownerId,
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        createdAt: customer.createdAt?.toISOString?.() || new Date().toISOString(),
        updatedAt: customer.updatedAt?.toISOString?.() || new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Failed to fetch customer:", error);
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
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const result = customerSchema.partial().safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const db = await getDb();
    const updateData: Record<string, unknown> = {
      ...result.data,
      updatedAt: new Date(),
    };

    const updateResult = await db.collection("customers").findOneAndUpdate(
      { _id: new ObjectId(id), ownerId: user.id },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!updateResult) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        _id: updateResult._id.toString(),
        ownerId: updateResult.ownerId,
        name: updateResult.name,
        email: updateResult.email || "",
        phone: updateResult.phone || "",
        address: updateResult.address || "",
        createdAt: updateResult.createdAt?.toISOString?.() || new Date().toISOString(),
        updatedAt: updateResult.updatedAt?.toISOString?.() || new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Failed to update customer:", error);
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  try {
    const db = await getDb();
    const deleteResult = await db.collection("customers").deleteOne({
      _id: new ObjectId(id),
      ownerId: user.id,
    });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Failed to delete customer:", error);
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}
