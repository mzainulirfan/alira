import "server-only";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { isStaffRole } from "@/lib/staff";
import type { StaffRole } from "@/lib/types";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const isProduction = process.env.NODE_ENV === "production";
const SESSION_COOKIE = isProduction ? "__Host-pam_session" : "pam_session";

export type SessionPayload = {
  userId: string;
  role: StaffRole;
  sessionEpoch: string;
  expiresAt: number;
};

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not set.");
  }
  if (secret.trim().length < 32) {
    throw new Error(
      "SESSION_SECRET must be at least 32 characters (generate with: openssl rand -base64 32)."
    );
  }
  const isPlaceholder =
    secret.includes("generate-dengan") || secret.includes("your-") || secret.includes("change-me");
  if (isPlaceholder) {
    if (isProduction) {
      throw new Error("SESSION_SECRET still contains placeholder value — rotate to a random secret (openssl rand -base64 32).");
    }
    // Dev: warn but allow to keep local development working
    console.warn("[warn] SESSION_SECRET is placeholder — using insecure dev secret. Set a real value for production.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(payload: Omit<SessionPayload, "expiresAt">) {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const token = await new SignJWT({ ...payload, expiresAt })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    expires: new Date(expiresAt),
    sameSite: "strict",
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token =
    cookieStore.get(SESSION_COOKIE)?.value ?? cookieStore.get("pam_session")?.value ?? null;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    if (!isStaffRole(payload.role) || typeof payload.sessionEpoch !== "string") {
      return null;
    }
    return {
      userId: String(payload.userId),
      role: payload.role,
      sessionEpoch: payload.sessionEpoch,
      expiresAt: Number(payload.expiresAt),
    };
  } catch {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const deleteNames = isProduction ? ["__Host-pam_session", "pam_session"] : ["pam_session", "__Host-pam_session"];
  for (const name of deleteNames) {
    try {
      cookieStore.delete(name);
    } catch {}
    try {
      cookieStore.set(name, "", {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        path: "/",
        expires: new Date(0),
        maxAge: 0,
      });
    } catch {}
  }
}

export async function updateSession() {
  const session = await getSession();
  if (!session) return null;

  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const token = await new SignJWT({
    userId: session.userId,
    role: session.role,
    sessionEpoch: session.sessionEpoch,
    expiresAt,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    expires: new Date(expiresAt),
    sameSite: "strict",
    path: "/",
  });
}
