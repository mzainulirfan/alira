"use server";

import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import {
  hashPasscode,
  isLegacyPasscodeHash,
  verifyPasscode,
} from "@/lib/auth/passcode";
import { createSession, deleteSession, getSession } from "@/lib/auth/session";
import { isStaffRole, isValidUsername, normalizeUsername } from "@/lib/staff";
import { authenticateCustomer } from "./customer-auth";

export type LoginState = {
  error?: string;
  success?: boolean;
  redirect?: string;
};

const CUSTOMER_NUMBER_REGEX = /^PAM-\d{6}$/;

export async function loginAction(
  _prevState: LoginState | undefined,
  formData: FormData
): Promise<LoginState> {
  const identifierValue = formData.get("identifier");
  const passcode = formData.get("passcode");

  if (typeof identifierValue !== "string" || typeof passcode !== "string") {
    return { error: "Username atau passcode salah." };
  }

  const identifier = identifierValue.trim();

  // Auto-detect: PAM-XXXXXX = customer, selain itu = username staff
  if (CUSTOMER_NUMBER_REGEX.test(identifier.toUpperCase())) {
    const result = await authenticateCustomer(identifier.toUpperCase(), passcode);
    if (!result.success) return { error: result.error };
    return { success: true, redirect: result.redirect };
  }

  const username = normalizeUsername(identifier);
  if (!isValidUsername(username) || !/^\d{6}$/.test(passcode)) {
    return { error: "Username atau passcode salah." };
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("pam_profiles")
    .select(
      "id, role, status, passcode_hash, must_change_passcode, failed_attempts, locked_until"
    )
    .eq("username", username)
    .maybeSingle();

  if (error || !data?.passcode_hash || data.status !== "active" || !isStaffRole(data.role)) {
    return { error: "Username atau passcode salah." };
  }

  const now = new Date();
  const lockedUntil = data.locked_until ? new Date(data.locked_until) : null;
  if (lockedUntil && lockedUntil > now) {
    return { error: "Akun sementara dikunci. Coba kembali beberapa menit lagi." };
  }

  const valid = await verifyPasscode(passcode, data.passcode_hash);
  if (!valid) {
    const { data: failedLogin, error: failedLoginError } = await supabase.rpc(
      "pam_register_failed_login",
      {
        p_profile_id: data.id,
        p_expected_passcode_hash: data.passcode_hash,
      }
    );
    if (failedLoginError) {
      return { error: "Gagal memverifikasi login. Coba kembali." };
    }
    const result = failedLogin as { accepted?: boolean; locked?: boolean } | null;
    return {
      error: result?.locked
        ? "Akun dikunci selama 15 menit karena terlalu banyak percobaan."
        : "Username atau passcode salah.",
    };
  }

  const { data: completedLogin, error: completedLoginError } = await supabase.rpc(
    "pam_complete_login",
    {
      p_profile_id: data.id,
      p_expected_passcode_hash: data.passcode_hash,
    }
  );
  if (completedLoginError) {
    return { error: "Gagal memverifikasi login. Coba kembali." };
  }
  const result = completedLogin as {
    success?: boolean;
    locked?: boolean;
    role?: unknown;
    must_change_passcode?: boolean;
    session_epoch?: string;
  } | null;
  if (!result?.success || !isStaffRole(result.role) || !result.session_epoch) {
    return {
      error: result?.locked
        ? "Akun sementara dikunci. Coba kembali beberapa menit lagi."
        : "Username atau passcode salah.",
    };
  }

  // Rotasi session_epoch di setiap login → sesi lama (token curian) ikut dicabut
  const sessionEpoch = crypto.randomUUID();
  const { error: epochError } = await supabase
    .from("pam_profiles")
    .update({ session_epoch: sessionEpoch })
    .eq("id", data.id);
  if (epochError) {
    console.error("[staff-login] gagal rotasi session_epoch:", epochError.message);
    return { error: "Gagal memverifikasi login. Coba kembali." };
  }

  // Upgrade hash format lama (SHA-256 berulang) ke scrypt asli
  if (isLegacyPasscodeHash(data.passcode_hash)) {
    const newHash = await hashPasscode(passcode);
    const { error: rehashError } = await supabase
      .from("pam_profiles")
      .update({ passcode_hash: newHash })
      .eq("id", data.id);
    if (rehashError) {
      console.error("[staff-login] gagal upgrade passcode hash:", rehashError.message);
    }
  }

  await createSession({
    userId: data.id,
    role: result.role,
    sessionEpoch,
  });

  return {
    success: true,
    redirect: result.must_change_passcode ? "/more/security?required=true" : "/dashboard",
  };
}

export async function logoutAction() {
  const session = await getSession();
  if (session) {
    const supabase = createSupabaseAdmin();
    await supabase
      .from("pam_profiles")
      .update({ session_epoch: crypto.randomUUID() })
      .eq("id", session.userId);
  }
  await deleteSession();
  redirect("/login");
}
