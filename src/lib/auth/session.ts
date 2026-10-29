import { headers } from "next/headers";
import { auth } from "./server";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

/**
 * Retrieves the currently authenticated user from the request session.
 * Returns null if unauthenticated or error.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (!session || !session.user) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name || session.user.email.split("@")[0],
    };
  } catch (error) {
    console.error("Error fetching session user:", error);
    return null;
  }
}
