const QR_PREFIX = "ALIRA";
const QR_VERSION = "v1";
const CUSTOMER_NUMBER_PATTERN = /^PAM-\d{6}$/;

function getQrHmacKey(): string | null {
  // Use CUSTOMER_JWT_SECRET or dedicated QR secret; fallback to SESSION_SECRET for HMAC
  return process.env.CUSTOMER_JWT_SECRET ?? process.env.SESSION_SECRET ?? null;
}

import { createHmac, timingSafeEqual } from "node:crypto";

function hmacForCustomer(customerNumber: string): string | null {
  const key = getQrHmacKey();
  if (!key) return null;
  try {
    return createHmac("sha256", key).update(customerNumber).digest("hex").slice(0, 12);
  } catch {
    return null;
  }
}

export function createCustomerQrPayload(customerNumber: string): string {
  if (!CUSTOMER_NUMBER_PATTERN.test(customerNumber)) {
    throw new Error("Nomor pelanggan tidak valid untuk QR.");
  }
  const hmac = hmacForCustomer(customerNumber);
  if (hmac) {
    return `${QR_PREFIX}|${QR_VERSION}|${customerNumber}|${hmac}`;
  }
  return `${QR_PREFIX}|${QR_VERSION}|${customerNumber}`;
}

export function parseCustomerQrPayload(value: string): string | null {
  const trimmed = value.trim();
  const uppercased = trimmed.toUpperCase();

  // Raw PAM-XXXXXX without prefix: accept but log warning (legacy). New QRs should be validated via HMAC.
  if (CUSTOMER_NUMBER_PATTERN.test(uppercased)) return uppercased;

  const parts = trimmed.split("|");
  const [prefix, version, customerNumber, hmac, ...rest] = parts;
  const normalizedCustomerNumber = customerNumber?.trim().toUpperCase() ?? "";
  if (
    rest.length > 0 ||
    prefix?.trim().toUpperCase() !== QR_PREFIX ||
    version?.trim().toLowerCase() !== QR_VERSION ||
    !CUSTOMER_NUMBER_PATTERN.test(normalizedCustomerNumber)
  ) {
    return null;
  }
  // If HMAC present, verify it
  if (hmac !== undefined) {
    const expected = hmacForCustomer(normalizedCustomerNumber);
    if (!expected) return normalizedCustomerNumber; // no key -> accept legacy
    const normalizedHmac = hmac.trim().toLowerCase();
    if (normalizedHmac.length !== 12) return null;
    const a = Buffer.from(normalizedHmac, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  }
  return normalizedCustomerNumber;
}
