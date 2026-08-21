import "server-only";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const CUSTOMER_SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 hari
const isCustomerProduction = process.env.NODE_ENV === "production";
const CUSTOMER_SESSION_COOKIE = isCustomerProduction ? "__Host-customer_session" : "customer_session";

export type CustomerSessionPayload = {
  customerId: string;
  sessionEpoch: string;
  expiresAt: number;
};

function getCustomerSecretKey(): Uint8Array {
  const secret = process.env.CUSTOMER_JWT_SECRET;
  if (!secret) {
    throw new Error("CUSTOMER_JWT_SECRET environment variable is not set.");
  }
  if (secret.trim().length < 32) {
    throw new Error(
      "CUSTOMER_JWT_SECRET must be at least 32 characters (generate with: openssl rand -base64 32)."
    );
  }
  const isPlaceholder =
    secret.includes("generate-dengan") || secret.includes("your-") || secret.includes("change-me");
  if (isPlaceholder) {
    if (isCustomerProduction) {
      throw new Error("CUSTOMER_JWT_SECRET still contains placeholder — rotate to a random secret (openssl rand -base64 32).");
    }
    console.warn("[warn] CUSTOMER_JWT_SECRET is placeholder — using insecure dev secret.");
  }
  return new TextEncoder().encode(secret);
}

export async function createCustomerSession(
  payload: Omit<CustomerSessionPayload, "expiresAt">
) {
  const expiresAt = Date.now() + CUSTOMER_SESSION_MAX_AGE * 1000;
  const token = await new SignJWT({ ...payload, expiresAt })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getCustomerSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isCustomerProduction,
    expires: new Date(expiresAt),
    sameSite: "strict",
    path: "/",
  });
}

export async function getCustomerSession(): Promise<CustomerSessionPayload | null> {
  const cookieStore = await cookies();
  // Support legacy name during migration
  const token =
    cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value ??
    cookieStore.get("customer_session")?.value ??
    null;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getCustomerSecretKey(), {
      algorithms: ["HS256"],
    });
    return {
      customerId: String(payload.customerId),
      sessionEpoch: String(payload.sessionEpoch),
      expiresAt: Number(payload.expiresAt),
    };
  } catch {
    return null;
  }
}

export async function deleteCustomerSession() {
  const cookieStore = await cookies();
  const names = isCustomerProduction ? ["__Host-customer_session", "customer_session"] : ["customer_session", "__Host-customer_session"];
  for (const name of names) {
    try { cookieStore.delete(name); } catch {}
    try {
      cookieStore.set(name, "", {
        httpOnly: true,
        secure: isCustomerProduction,
        sameSite: "strict",
        path: "/",
        expires: new Date(0),
        maxAge: 0,
      });
    } catch {}
  }
}

export async function updateCustomerSession() {
  const session = await getCustomerSession();
  if (!session) return null;

  const expiresAt = Date.now() + CUSTOMER_SESSION_MAX_AGE * 1000;
  const token = await new SignJWT({
    customerId: session.customerId,
    sessionEpoch: session.sessionEpoch,
    expiresAt,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getCustomerSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isCustomerProduction,
    expires: new Date(expiresAt),
    sameSite: "strict",
    path: "/",
  });
}