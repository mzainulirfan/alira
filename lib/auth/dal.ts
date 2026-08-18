import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "@/lib/auth/session";

export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
});