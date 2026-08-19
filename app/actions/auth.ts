"use server";

import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { verifyPasscode } from "@/lib/auth/passcode";
import { createSession, deleteSession } from "@/lib/auth/session";
import { isStaffRole, isValidUsername, normalizeUsername } from "@/lib/staff";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState | undefined,
  formData: FormData
): Promise<LoginState> {
  const usernameValue = formData.get("username");
  const passcode = formData.get("passcode");

  if (typeof usernameValue !== "string" || typeof passcode !== "string") {
    return { error: "Username atau passcode salah." };
  }

  const username = normalizeUsername(usernameValue);
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

  const valid = verifyPasscode(passcode, data.passcode_hash);
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

  await createSession({
    userId: data.id,
    role: result.role,
    sessionEpoch: result.session_epoch,
  });
  if (result.must_change_passcode) redirect("/more/security?required=true");
  redirect("/dashboard");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
