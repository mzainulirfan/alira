const { createClient } = require("@supabase/supabase-js");
const { createHash, randomBytes, randomUUID } = require("node:crypto");
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
  const { data: profile, error: readError } = await supabase
    .from("pam_profiles")
    .select("id")
    .eq("username", "admin")
    .maybeSingle();

  if (readError) {
    console.error("Gagal mencari akun admin:", readError.message);
    process.exit(1);
  }

  const payload = {
    passcode_hash: hash,
    session_epoch: randomUUID(),
    status: "active",
    must_change_passcode: false,
    failed_attempts: 0,
    locked_until: null,
    updated_at: new Date().toISOString(),
  };
  const { error } = profile
    ? await supabase.from("pam_profiles").update(payload).eq("id", profile.id)
    : await supabase.from("pam_profiles").insert({
        ...payload,
        name: "Administrator",
        username: "admin",
        role: "admin",
      });

  if (error) {
    console.error("Gagal update passcode:", error.message);
    process.exit(1);
  }

  console.log("Passcode berhasil disimpan.");
}

main();
