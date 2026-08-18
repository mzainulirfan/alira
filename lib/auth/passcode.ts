import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const ITERATIONS = 100_000;
const KEY_LENGTH = 64;

export function hashPasscode(passcode: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = derive(passcode, salt, ITERATIONS);
  return `scrypt$${ITERATIONS}$${salt}$${derived}`;
}

export function verifyPasscode(passcode: string, stored: string): boolean {
  const [scheme, iterations, salt, expected] = stored.split("$");
  if (scheme !== "scrypt" || !iterations || !salt || !expected) {
    return false;
  }
  const derived = derive(passcode, salt, Number(iterations));
  const a = Buffer.from(derived, "hex");
  const b = Buffer.from(expected, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

function derive(passcode: string, salt: string, iterations: number): string {
  let value = createHash("sha256").update(salt + passcode).digest();
  for (let i = 1; i < iterations; i++) {
    value = createHash("sha256").update(value).digest();
  }
  return value.subarray(0, KEY_LENGTH).toString("hex");
}

export function generatePasscode(): string {
  const buffer = randomBytes(4);
  const num = buffer.readUInt32BE(0) % 1_000_000;
  return num.toString().padStart(6, "0");
}