const { createClient } = require("@supabase/supabase-js");
const { createHash, randomBytes } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ITERATIONS = 100_000;
const KEY_LENGTH = 64;

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("File .env.local tidak ditemukan. Salin dari .env.example.");
    process.exit(1);
  }
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

function derive(passcode, salt, iterations) {
  let value = createHash("sha256").update(salt + passcode).digest();
  for (let i = 1; i < iterations; i++) {
    value = createHash("sha256").update(value).digest();
  }
  return value.subarray(0, KEY_LENGTH).toString("hex");
}

function hashPasscode(passcode) {
  const salt = randomBytes(16).toString("hex");
  return `scrypt$${ITERATIONS}$${salt}$${derive(passcode, salt, ITERATIONS)}`;
}

async function main() {
  const passcode = process.argv[2];
  if (!passcode) {
    console.error("Gunakan: node scripts/set-passcode.cjs <passcode>");
    process.exit(1);
  }
  if (!/^\d{6}$/.test(passcode)) {
    console.error("Passcode harus 6 digit angka.");
    process.exit(1);
  }

  loadEnv();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const hash = hashPasscode(passcode);
  const { error } = await supabase
    .from("pam_app_settings")
    .update({ passcode_hash: hash, updated_at: new Date().toISOString() })
    .eq("pam_name", "Alira");

  if (error) {
    console.error("Gagal update passcode:", error.message);
    process.exit(1);
  }

  console.log("Passcode berhasil disimpan.");
}

main();