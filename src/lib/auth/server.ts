import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import dns from "dns";

if (process.env.NODE_ENV === "development") {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch {
    // Ignore if not supported in environment
  }
}

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB_NAME || "invoice_generator";

// Dedicated client for better-auth
const client = new MongoClient(uri);
const db = client.db(dbName);

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const isGoogleAuthEnabled = Boolean(googleClientId && googleClientSecret);

const cleanUrl = (url?: string) => (url ? url.trim().replace(/\/+$/, "") : undefined);

const rawBetterAuthUrl = cleanUrl(process.env.BETTER_AUTH_URL);
const rawAppUrl = cleanUrl(process.env.NEXT_PUBLIC_APP_URL);
const vercelUrl = process.env.VERCEL_URL ? `https://${cleanUrl(process.env.VERCEL_URL)}` : undefined;
const vercelProdUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${cleanUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL)}`
  : undefined;

const resolvedBaseURL =
  rawBetterAuthUrl || vercelProdUrl || vercelUrl || rawAppUrl || "http://localhost:3000";

export const auth = betterAuth({
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: googleClientId || "google_client_id_placeholder",
      clientSecret: googleClientSecret || "google_client_secret_placeholder",
      enabled: isGoogleAuthEnabled,
    },
  },
  secret: process.env.BETTER_AUTH_SECRET || "secret_fallback_key_for_development_mode_min_32_chars",
  baseURL: resolvedBaseURL,
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://*.vercel.app",
    ...(rawBetterAuthUrl ? [rawBetterAuthUrl] : []),
    ...(rawAppUrl ? [rawAppUrl] : []),
    ...(vercelUrl ? [vercelUrl] : []),
    ...(vercelProdUrl ? [vercelProdUrl] : []),
  ],
});
