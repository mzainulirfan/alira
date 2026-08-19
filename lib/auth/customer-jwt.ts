import "server-only";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const CUSTOMER_SESSION_COOKIE = "customer_session";
const CUSTOMER_SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 hari

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
    secure: process.env.NODE_ENV === "production",
    expires: new Date(expiresAt),
    sameSite: "lax",
    path: "/",
  });
}

export async function getCustomerSession(): Promise<CustomerSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;
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
  cookieStore.delete(CUSTOMER_SESSION_COOKIE);
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
    secure: process.env.NODE_ENV === "production",
    expires: new Date(expiresAt),
    sameSite: "lax",
    path: "/",
  });
}