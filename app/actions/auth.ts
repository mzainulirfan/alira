"use server";

import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { verifyPasscode } from "@/lib/auth/passcode";
import { createSession, deleteSession } from "@/lib/auth/session";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState | undefined,
  formData: FormData
): Promise<LoginState> {
  const passcode = formData.get("passcode");

  if (typeof passcode !== "string" || !passcode.trim()) {
    return { error: "Masukkan passcode." };
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("pam_app_settings")
    .select("passcode_hash, pam_name")
    .limit(1)
    .maybeSingle();

  if (error || !data?.passcode_hash) {
    return { error: "Passcode belum diatur. Hubungi administrator." };
  }

  const valid = verifyPasscode(passcode.trim(), data.passcode_hash);
  if (!valid) {
    return { error: "Passcode salah." };
  }

  await createSession({ userId: "admin", role: "admin" });
  redirect("/dashboard");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}