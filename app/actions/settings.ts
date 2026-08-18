"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/auth/dal";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { hashPasscode } from "@/lib/auth/passcode";
import type { AppSettings } from "@/lib/types";

export type SettingsFormState = {
  error?: string;
  success?: boolean;
};

export async function updateProfileAction(
  _prev: SettingsFormState | undefined,
  formData: FormData
): Promise<SettingsFormState> {
  await verifySession();

  const pamName = formData.get("pam_name");
  const address = formData.get("address");
  const phone = formData.get("phone");
  const dueDay = Number(formData.get("billing_due_day"));

  if (typeof pamName !== "string" || !pamName.trim()) {
    return { error: "Nama PAM wajib diisi." };
  }
  if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 28) {
    return { error: "Hari jatuh tempo harus antara 1–28." };
  }

  const supabase = createSupabaseAdmin();
  const { data: settings } = await supabase
    .from("pam_app_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  const id = (settings as AppSettings | null)?.id;
  const payload = {
    pam_name: pamName.trim(),
    address: typeof address === "string" && address.trim() ? address.trim() : null,
    phone: typeof phone === "string" && phone.trim() ? phone.trim() : null,
    billing_due_day: dueDay,
    updated_at: new Date().toISOString(),
  };

  const { error } = id
    ? await supabase.from("pam_app_settings").update(payload).eq("id", id)
    : await supabase.from("pam_app_settings").insert(payload);

  if (error) return { error: `Gagal menyimpan profil: ${error.message}` };

  revalidatePath("/more/profile");
  return { success: true };
}

export async function updatePasscodeAction(
  _prev: SettingsFormState | undefined,
  formData: FormData
): Promise<SettingsFormState> {
  await verifySession();

  const current = formData.get("current_passcode");
  const next = formData.get("new_passcode");
  const confirm = formData.get("confirm_passcode");

  if (
    typeof current !== "string" ||
    typeof next !== "string" ||
    typeof confirm !== "string"
  ) {
    return { error: "Input tidak valid." };
  }

  if (next.length < 4 || next.length > 12) {
    return { error: "Passcode baru harus 4–12 digit." };
  }
  if (!/^\d+$/.test(next)) {
    return { error: "Passcode harus berupa angka." };
  }
  if (next !== confirm) {
    return { error: "Konfirmasi passcode tidak cocok." };
  }

  const supabase = createSupabaseAdmin();
  const { data: settings } = await supabase
    .from("pam_app_settings")
    .select("id, passcode_hash")
    .limit(1)
    .maybeSingle();

  const row = settings as (AppSettings & { passcode_hash: string | null }) | null;
  if (!row?.id) {
    return { error: "Pengaturan belum tersedia." };
  }
  if (!row.passcode_hash) {
    return { error: "Passcode belum diatur." };
  }

  const { verifyPasscode } = await import("@/lib/auth/passcode");
  const ok = await verifyPasscode(current, row.passcode_hash);
  if (!ok) {
    return { error: "Passcode saat ini salah." };
  }

  const hash = await hashPasscode(next);
  const { error } = await supabase
    .from("pam_app_settings")
    .update({ passcode_hash: hash, updated_at: new Date().toISOString() })
    .eq("id", row.id);

  if (error) return { error: `Gagal mengganti passcode: ${error.message}` };

  return { success: true };
}

export type TariffFormState = SettingsFormState;

export async function saveTariffAction(
  _prev: TariffFormState | undefined,
  formData: FormData
): Promise<TariffFormState> {
  await verifySession();

  const id = formData.get("id");
  const name = formData.get("name");
  const price = Number(formData.get("price_per_m3"));
  const fee = Number(formData.get("monthly_fee"));
  const effectiveDate = formData.get("effective_date");
  const isActive = formData.get("is_active") === "true";

  if (typeof name !== "string" || !name.trim()) {
    return { error: "Nama tarif wajib diisi." };
  }
  if (!Number.isFinite(price) || price < 0) {
    return { error: "Tarif per m³ tidak valid." };
  }
  if (!Number.isFinite(fee) || fee < 0) {
    return { error: "Abonemen tidak valid." };
  }

  const supabase = createSupabaseAdmin();

  if (isActive) {
    let query = supabase
      .from("pam_tariffs")
      .update({ is_active: false })
      .eq("is_active", true);
    if (typeof id === "string" && id) query = query.neq("id", id);
    const { error: deactErr } = await query;
    if (deactErr) return { error: `Gagal memperbarui tarif: ${deactErr.message}` };
  }

  const payload = {
    name: name.trim(),
    price_per_m3: price,
    monthly_fee: fee,
    effective_date:
      typeof effectiveDate === "string" && effectiveDate ? effectiveDate : null,
    is_active: isActive,
  };

  const { error } =
    typeof id === "string" && id
      ? await supabase.from("pam_tariffs").update(payload).eq("id", id)
      : await supabase.from("pam_tariffs").insert(payload);

  if (error) return { error: `Gagal menyimpan tarif: ${error.message}` };

  revalidatePath("/more/tariffs");
  return { success: true };
}

export async function setTariffActiveAction(
  formData: FormData
): Promise<void> {
  await verifySession();

  const id = formData.get("id");
  const active = formData.get("is_active") === "true";
  if (typeof id !== "string" || !id) return;

  const supabase = createSupabaseAdmin();
  if (active) {
    await supabase.from("pam_tariffs").update({ is_active: false }).neq("id", id);
  }
  await supabase.from("pam_tariffs").update({ is_active: active }).eq("id", id);

  revalidatePath("/more/tariffs");
}

export async function deleteTariffAction(formData: FormData): Promise<void> {
  await verifySession();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  const supabase = createSupabaseAdmin();
  await supabase.from("pam_tariffs").delete().eq("id", id);

  revalidatePath("/more/tariffs");
}
