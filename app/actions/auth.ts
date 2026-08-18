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
    const previousAttempts = lockedUntil && lockedUntil <= now ? 0 : data.failed_attempts;
    const failedAttempts = previousAttempts + 1;
    const shouldLock = failedAttempts >= 5;
    await supabase
      .from("pam_profiles")
      .update({
        failed_attempts: failedAttempts,
        locked_until: shouldLock
          ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    return {
      error: shouldLock
        ? "Akun dikunci selama 15 menit karena terlalu banyak percobaan."
        : "Username atau passcode salah.",
    };
  }

  await supabase
    .from("pam_profiles")
    .update({
      failed_attempts: 0,
      locked_until: null,
      last_login_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.id);

  await createSession({ userId: data.id, role: data.role });
  if (data.must_change_passcode) redirect("/more/security?required=true");
  redirect("/dashboard");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
