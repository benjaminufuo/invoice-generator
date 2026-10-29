import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getNextInvoiceNumber } from "@/lib/invoice-number";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const nextNumber = await getNextInvoiceNumber(user.id);
    return NextResponse.json({ data: { nextInvoiceNumber: nextNumber } });
  } catch (error) {
    console.error("Failed to generate next invoice number:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice number" },
      { status: 500 }
    );
  }
}
