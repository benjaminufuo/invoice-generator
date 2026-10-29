import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { getSessionUser } from "@/lib/auth/session";
import { customerSchema } from "@/lib/validations/invoice";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getDb();
    const customers = await db
      .collection("customers")
      .find({ ownerId: user.id })
      .sort({ name: 1 })
      .toArray();

    const formatted = customers.map((c) => ({
      _id: c._id.toString(),
      ownerId: c.ownerId,
      name: c.name,
      email: c.email || "",
      phone: c.phone || "",
      address: c.address || "",
      createdAt: c.createdAt?.toISOString?.() || new Date().toISOString(),
      updatedAt: c.updatedAt?.toISOString?.() || new Date().toISOString(),
    }));

    return NextResponse.json({ data: formatted });
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = customerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const db = await getDb();
    const now = new Date();
    const newCustomer = {
      ownerId: user.id,
      name: result.data.name.trim(),
      email: result.data.email?.trim() || "",
      phone: result.data.phone?.trim() || "",
      address: result.data.address?.trim() || "",
      createdAt: now,
      updatedAt: now,
    };

    const insertResult = await db.collection("customers").insertOne(newCustomer);

    return NextResponse.json(
      {
        data: {
          _id: insertResult.insertedId.toString(),
          ...newCustomer,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create customer:", error);
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
