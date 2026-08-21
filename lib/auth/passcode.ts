import "server-only";

import { createHash, randomBytes, randomInt, scrypt, timingSafeEqual } from "node:crypto";

const SCRYPT_N = 32768;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_MAXMEM = 64 * 1024 * 1024;
const KEY_LENGTH = 64;

function scryptAsync(
  password: string,
  salt: string,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number }
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, options, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

export async function hashPasscode(passcode: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = await scryptAsync(passcode, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: SCRYPT_MAXMEM,
  });
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt}$${derived.toString("hex")}`;
}

export async function verifyPasscode(
  passcode: string,
  stored: string
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length < 4 || parts[0] !== "scrypt") return false;

  // Format lama (pra-fix): scrypt$iterations$salt$expected (SHA-256 berulang)
  if (parts.length === 4) {
    return verifyLegacy(passcode, parts[1], parts[2], parts[3]);
  }

  // Format baru: scrypt$N$r$p$salt$expected
  if (parts.length !== 6) return false;
  const [, nRaw, rRaw, pRaw, salt, expected] = parts;
  const n = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);
  if (
    !Number.isSafeInteger(n) ||
    n < 1 ||
    !Number.isSafeInteger(r) ||
    r < 1 ||
    !Number.isSafeInteger(p) ||
    p < 1
  ) {
    return false;
  }

  try {
    const derived = await scryptAsync(passcode, salt, KEY_LENGTH, {
      N: n,
      r,
      p,
      maxmem: SCRYPT_MAXMEM,
    });
    const expectedBuffer = Buffer.from(expected, "hex");
    if (derived.length !== expectedBuffer.length) {
      // Constant-time mitigation: still do a dummy compare to avoid timing oracle on length
      timingSafeEqual(derived, derived);
      return false;
    }
    return timingSafeEqual(derived, expectedBuffer);
  } catch {
    return false;
  }
}

export function isLegacyPasscodeHash(stored: string): boolean {
  const parts = stored.split("$");
  return parts.length === 4 && parts[0] === "scrypt";
}

function verifyLegacy(
  passcode: string,
  iterations: string,
  salt: string,
  expected: string
): boolean {
  const count = Number(iterations);
  if (!Number.isSafeInteger(count) || count < 1) return false;
  let value = createHash("sha256").update(salt + passcode).digest();
  for (let i = 1; i < count; i++) {
    value = createHash("sha256").update(value).digest();
  }
  const expectedBuffer = Buffer.from(expected, "hex");
  if (value.length !== expectedBuffer.length) {
    timingSafeEqual(value, value);
    return false;
  }
  return timingSafeEqual(value, expectedBuffer);
}

export function generatePasscode(): string {
  const num = randomInt(0, 1_000_000);
  return num.toString().padStart(6, "0");
}