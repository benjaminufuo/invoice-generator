import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { ObjectId, Binary } from "mongodb";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return new NextResponse("Asset not found", { status: 404 });
  }

  try {
    const db = await getDb();
    const asset = await db.collection("assets").findOne({
      _id: new ObjectId(id),
    });

    if (!asset || !asset.data) {
      return new NextResponse("Asset not found", { status: 404 });
    }

    // Convert MongoDB Binary/Buffer to Uint8Array for standard Web Response
    let rawBytes: Uint8Array;
    if (asset.data instanceof Binary) {
      rawBytes = asset.data.read(0, asset.data.length());
    } else if (Buffer.isBuffer(asset.data)) {
      rawBytes = new Uint8Array(asset.data);
    } else if (asset.data.buffer) {
      rawBytes = new Uint8Array(asset.data.buffer);
    } else {
      rawBytes = new Uint8Array(Buffer.from(asset.data));
    }

    return new Response(rawBytes as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": asset.mimeType || "image/png",
        "Content-Length": rawBytes.byteLength.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("Failed to serve asset:", err);
    return new NextResponse("Failed to load asset", { status: 500 });
  }
}
