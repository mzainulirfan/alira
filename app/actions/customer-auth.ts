"use server";

import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { compare, hash } from "bcryptjs";
import {
  createCustomerSession,
  deleteCustomerSession,
  getCustomerSession,
} from "@/lib/auth/customer-jwt";
import type { Customer } from "@/lib/types";

const CUSTOMER_NUMBER_REGEX = /^PAM-\d{6}$/;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

type LoginResult =
  | { error: string; success?: false; redirect?: never; mustChangePasscode?: never }
  | { success: true; redirect: string; mustChangePasscode: boolean; error?: never };

export async function loginCustomerAction(
  _prev: LoginResult,
  formData: FormData
): Promise<LoginResult> {
  const customerNumber = formData.get("customer_number")?.toString().trim().toUpperCase();
  const passcode = formData.get("passcode")?.toString().trim();

  if (!customerNumber || !passcode) {
    return { error: "Nomor pelanggan dan passcode wajib diisi." };
  }
  if (!CUSTOMER_NUMBER_REGEX.test(customerNumber)) {
    return { error: "Format nomor pelanggan tidak valid (contoh: PAM-123456)." };
  }
  if (passcode.length !== 6 || !/^\d{6}$/.test(passcode)) {
    return { error: "Passcode harus 6 digit angka." };
  }

  const supabase = createSupabaseAdmin();

  const { data: customer, error: customerError } = await supabase
    .from("pam_customers")
    .select(
      "id, customer_number, name, passcode_hash, must_change_passcode, failed_attempts, locked_until, session_epoch, status"
    )
    .eq("customer_number", customerNumber)
    .eq("status", "active")
    .maybeSingle();

  if (customerError) {
    await logLoginAttempt(null, false);
    return { error: "Terjadi kesalahan server. Coba lagi nanti." };
  }
  if (!customer) {
    await logLoginAttempt(null, false);
    return { error: "Nomor pelanggan tidak ditemukan atau tidak aktif." };
  }

  // Cek lockout
  if (customer.locked_until && new Date(customer.locked_until) > new Date()) {
    const minutesLeft = Math.ceil(
      (new Date(customer.locked_until).getTime() - Date.now()) / 60000
    );
    return { error: `Terlalu banyak percobaan gagal. Coba lagi ${minutesLeft} menit.` };
  }

  // Verifikasi passcode
  if (!customer.passcode_hash || !(await compare(passcode, customer.passcode_hash))) {
    const newFailedAttempts = (customer.failed_attempts ?? 0) + 1;
    const updates: Record<string, unknown> = { failed_attempts: newFailedAttempts };
    if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
      updates.locked_until = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000).toISOString();
    }
    await supabase
      .from("pam_customers")
      .update(updates)
      .eq("id", customer.id);

    await logLoginAttempt(customer.id, false);

    if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
      return { error: `Passcode salah. Akun terkunci ${LOCKOUT_DURATION_MINUTES} menit.` };
    }
    return { error: `Passcode salah. Sisa percobaan: ${MAX_FAILED_ATTEMPTS - newFailedAttempts}.` };
  }

  // Login sukses
  const newSessionEpoch = crypto.randomUUID();
  await supabase
    .from("pam_customers")
    .update({
      failed_attempts: 0,
      locked_until: null,
      last_login_at: new Date().toISOString(),
      session_epoch: newSessionEpoch,
    })
    .eq("id", customer.id);

  await logLoginAttempt(customer.id, true);

  await createCustomerSession({
    customerId: customer.id,
    sessionEpoch: newSessionEpoch,
  });

  const redirectUrl = customer.must_change_passcode
    ? "/customer/profile?required=true"
    : "/customer/dashboard";

  return { success: true, redirect: redirectUrl, mustChangePasscode: customer.must_change_passcode };
}

async function logLoginAttempt(customerId: string | null, success: boolean) {
  const supabase = createSupabaseAdmin();
  // IP & user-agent tidak tersedia di Server Action tanpa headers()
  // Bisa ditambah nanti kalau perlu
  await supabase.from("pam_customer_login_logs").insert({
    customer_id: customerId,
    success,
    // ip dan user_agent bisa ditambah nanti via headers()
  });
}

export async function logoutCustomerAction() {
  await deleteCustomerSession();
  redirect("/customer/login");
}

export async function changePasscodeAction(
  _prev: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/customer/login?reset=true");
  }

  const oldPasscode = formData.get("old_passcode")?.toString().trim();
  const newPasscode = formData.get("new_passcode")?.toString().trim();
  const confirmPasscode = formData.get("confirm_passcode")?.toString().trim();

  if (!oldPasscode || !newPasscode || !confirmPasscode) {
    return { error: "Semua field wajib diisi." };
  }
  if (newPasscode.length !== 6 || !/^\d{6}$/.test(newPasscode)) {
    return { error: "Passcode baru harus 6 digit angka." };
  }
  if (newPasscode !== confirmPasscode) {
    return { error: "Konfirmasi passcode tidak cocok." };
  }
  if (oldPasscode === newPasscode) {
    return { error: "Passcode baru harus berbeda dari passcode lama." };
  }

  const supabase = createSupabaseAdmin();

  const { data: customer, error } = await supabase
    .from("pam_customers")
    .select("passcode_hash")
    .eq("id", session.customerId)
    .eq("session_epoch", session.sessionEpoch)
    .maybeSingle();

  if (error || !customer) {
    return { error: "Sesi tidak valid. Silakan login ulang." };
  }

  if (!(await compare(oldPasscode, customer.passcode_hash!))) {
    return { error: "Passcode lama salah." };
  }

  const newHash = await hash(newPasscode, 12);
  const newSessionEpoch = crypto.randomUUID();

  const { error: updateError } = await supabase
    .from("pam_customers")
    .update({
      passcode_hash: newHash,
      must_change_passcode: false,
      session_epoch: newSessionEpoch,
    })
    .eq("id", session.customerId);

  if (updateError) {
    return { error: "Gagal mengubah passcode. Coba lagi." };
  }

  // Update session dengan epoch baru
  await createCustomerSession({
    customerId: session.customerId,
    sessionEpoch: newSessionEpoch,
  });

  return { success: true };
}

export async function getCustomerProfile(): Promise<Customer | null> {
  const session = await getCustomerSession();
  if (!session) return null;

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("pam_customers")
    .select(
      "id, customer_number, name, phone, address, meter_number, join_date, status, must_change_passcode, created_at, updated_at"
    )
    .eq("id", session.customerId)
    .eq("session_epoch", session.sessionEpoch)
    .maybeSingle();

  if (error || !data) return null;
  return data as Customer;
}