import { MongoClient, Db } from "mongodb";
import dns from "dns";

if (process.env.NODE_ENV === "development") {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch {
    // Ignore if not supported in environment
  }
}

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB_NAME || "invoice_generator";

if (!uri) {
  throw new Error("Please define MONGODB_URI in your environment variables.");
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

let client: MongoClient;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri);
  }
  client = global._mongoClient;
} else {
  client = new MongoClient(uri);
}

export async function getDb(): Promise<Db> {
  await client.connect();
  return client.db(dbName);
}

export async function ensureIndexes(): Promise<void> {
  const db = await getDb();

  // Invoices indexes
  await db.collection("invoices").createIndex({ ownerId: 1, updatedAt: -1 });
  await db
    .collection("invoices")
    .createIndex({ ownerId: 1, invoiceNumber: 1 }, { unique: true });

  // Customers indexes
  await db.collection("customers").createIndex({ ownerId: 1, name: 1 });
}
