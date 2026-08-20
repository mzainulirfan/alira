"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { assertRole } from "@/lib/auth/dal";
import { hashPasscode } from "@/lib/auth/passcode";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import {
  ADMIN_ROLES,
  isStaffRole,
  isValidUsername,
  normalizeUsername,
} from "@/lib/staff";

export type StaffFormState = {
  error?: string;
  success?: boolean;
};

function revalidateStaff() {
  revalidatePath("/more/staff");
  revalidatePath("/more");
}

async function isLastActiveAdmin(id: string): Promise<boolean> {
  const supabase = createSupabaseAdmin();
  const [{ data: profile }, { count }] = await Promise.all([
    supabase.from("pam_profiles").select("role, status").eq("id", id).maybeSingle(),
    supabase
      .from("pam_profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin")
      .eq("status", "active"),
  ]);
  return profile?.role === "admin" && profile?.status === "active" && (count ?? 0) <= 1;
}

export async function saveStaffAction(
  _prev: StaffFormState | undefined,
  formData: FormData
): Promise<StaffFormState> {
  const session = await assertRole(ADMIN_ROLES);

  const idValue = formData.get("id");
  const id = typeof idValue === "string" && idValue ? idValue : null;
  const name = formData.get("name");
  const usernameValue = formData.get("username");
  const role = formData.get("role");
  const passcode = formData.get("passcode");
  const confirmation = formData.get("confirm_passcode");

  if (typeof name !== "string" || !name.trim()) {
    return { error: "Nama wajib diisi." };
  }
  if (typeof usernameValue !== "string") {
    return { error: "Username wajib diisi." };
  }
  const username = normalizeUsername(usernameValue);
  if (!isValidUsername(username)) {
    return {
      error: "Username harus 3-32 karakter: huruf kecil, angka, titik, garis bawah, atau minus.",
    };
  }
  if (!isStaffRole(role)) return { error: "Role tidak valid." };

  if (!id) {
    if (typeof passcode !== "string" || !/^\d{6}$/.test(passcode)) {
      return { error: "Passcode sementara harus tepat 6 digit." };
    }
    if (passcode !== confirmation) {
      return { error: "Konfirmasi passcode tidak cocok." };
    }
  }

  const supabase = createSupabaseAdmin();
  let duplicateQuery = supabase
    .from("pam_profiles")
    .select("id")
    .eq("username", username);
  if (id) duplicateQuery = duplicateQuery.neq("id", id);
  const { data: duplicate } = await duplicateQuery.maybeSingle();
  if (duplicate) return { error: "Username sudah digunakan." };

  if (id) {
    const { data: current, error: readError } = await supabase
      .from("pam_profiles")
      .select("role")
      .eq("id", id)
      .maybeSingle();
    if (readError || !current) return { error: "Pegawai tidak ditemukan." };
    if (id === session.userId && role !== "admin") {
      return { error: "Admin tidak dapat menurunkan role akun sendiri." };
    }
    if (current.role === "admin" && role !== "admin" && (await isLastActiveAdmin(id))) {
      return { error: "Admin aktif terakhir tidak dapat diubah rolenya." };
    }

    const { error } = await supabase
      .from("pam_profiles")
      .update({
        name: name.trim(),
        username,
        role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) return { error: `Gagal memperbarui pegawai: ${error.message}` };
  } else {
    const { error } = await supabase.from("pam_profiles").insert({
      name: name.trim(),
      username,
      role,
      status: "active",
      passcode_hash: await hashPasscode(passcode as string),
      must_change_passcode: true,
    });
    if (error) return { error: `Gagal menambah pegawai: ${error.message}` };
  }

  revalidateStaff();
  return { success: true };
}

export async function setStaffStatusAction(formData: FormData): Promise<void> {
  const session = await assertRole(ADMIN_ROLES);
  const id = formData.get("id");
  const status = formData.get("status");
  if (typeof id !== "string" || (status !== "active" && status !== "inactive")) {
    throw new Error("Data pegawai tidak valid.");
  }
  if (id === session.userId && status === "inactive") {
    throw new Error("Admin tidak dapat menonaktifkan akun sendiri.");
  }
  if (status === "inactive" && (await isLastActiveAdmin(id))) {
    throw new Error("Admin aktif terakhir tidak dapat dinonaktifkan.");
  }

  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from("pam_profiles")
    .update({
      status,
      session_epoch: randomUUID(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(`Gagal mengubah status pegawai: ${error.message}`);
  revalidateStaff();
}

export async function resetStaffPasscodeAction(
  _prev: StaffFormState | undefined,
  formData: FormData
): Promise<StaffFormState> {
  await assertRole(ADMIN_ROLES);
  const id = formData.get("id");
  const passcode = formData.get("passcode");
  const confirmation = formData.get("confirm_passcode");
  if (typeof id !== "string" || !id) return { error: "Pegawai tidak valid." };
  if (typeof passcode !== "string" || !/^\d{6}$/.test(passcode)) {
    return { error: "Passcode sementara harus tepat 6 digit." };
  }
  if (passcode !== confirmation) return { error: "Konfirmasi passcode tidak cocok." };

  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from("pam_profiles")
    .update({
      passcode_hash: await hashPasscode(passcode),
      session_epoch: randomUUID(),
      must_change_passcode: true,
      failed_attempts: 0,
      locked_until: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: `Gagal mereset passcode: ${error.message}` };
  revalidateStaff();
  return { success: true };
}

export async function unlockStaffAction(formData: FormData): Promise<void> {
  await assertRole(ADMIN_ROLES);
  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Pegawai tidak valid.");

  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from("pam_profiles")
    .update({
      failed_attempts: 0,
      locked_until: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(`Gagal membuka akun: ${error.message}`);
  revalidateStaff();
}
