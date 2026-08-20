"use server";

import { randomUUID } from "node:crypto";
import { hash } from "bcryptjs";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  createCustomer,
  updateCustomer,
  setCustomerStatus,
  resetCustomerPasscode,
  getCustomersPage,
} from "@/lib/data/customers";
import { assertRole, verifySession } from "@/lib/auth/dal";
import { ADMIN_ROLES, METER_ROLES } from "@/lib/staff";
import type { Customer, CustomerInput } from "@/lib/types";

export type CustomerFormState = {
  error?: string;
  success?: boolean;
  customerId?: string;
};

function parseInput(formData: FormData): CustomerInput {
  const name = formData.get("name");
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Nama pelanggan wajib diisi.");
  }
  const phone = stringOrNull(formData.get("phone"));
  if (phone && !/^[0-9+\-\s()]{8,16}$/.test(phone)) {
    throw new Error("Nomor HP tidak valid.");
  }
  const passcode = stringOrNull(formData.get("passcode"));
  if (passcode && !/^\d{6}$/.test(passcode)) {
    throw new Error("Passcode sementara harus tepat 6 digit angka.");
  }
  if (passcode) {
    const confirmation = stringOrNull(formData.get("confirm_passcode"));
    if (passcode !== confirmation) {
      throw new Error("Konfirmasi passcode tidak cocok.");
    }
  }
  return {
    name: name.trim(),
    phone,
    address: stringOrNull(formData.get("address")),
    meter_number: stringOrNull(formData.get("meter_number")),
    join_date: stringOrNull(formData.get("join_date")),
    status: formData.get("status") === "inactive" ? "inactive" : "active",
    passcode,
  };
}

function stringOrNull(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function createCustomerAction(
  _prev: CustomerFormState | undefined,
  formData: FormData
): Promise<CustomerFormState> {
  try {
    await assertRole(METER_ROLES);
    const input = parseInput(formData);
    const passcodeHash = input.passcode ? await hash(input.passcode, 12) : null;
    const customer = await createCustomer(input, passcodeHash);
    revalidatePath("/customers");
    revalidateTag("customers", "max");
    return { success: true, customerId: customer.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal menambahkan pelanggan." };
  }
}

export async function updateCustomerAction(
  prev: CustomerFormState | undefined,
  formData: FormData
): Promise<CustomerFormState> {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "ID pelanggan tidak valid." };
  }
  try {
    await assertRole(METER_ROLES);
    const input = parseInput(formData);
    const customer = await updateCustomer(id, input);
    revalidatePath("/customers");
    revalidatePath(`/customers/${customer.id}`);
    revalidateTag("customers", "max");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal menyimpan perubahan." };
  }
}

export async function setCustomerStatusAction(
  formData: FormData
): Promise<void> {
  await assertRole(ADMIN_ROLES);
  const id = formData.get("id");
  const status = formData.get("status");
  if (typeof id !== "string" || !id) return;
  if (status !== "active" && status !== "inactive") return;

  await setCustomerStatus(id, status);
  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  revalidateTag("customers", "max");
}

export async function resetCustomerPasscodeAction(
  _prev: CustomerFormState | undefined,
  formData: FormData
): Promise<CustomerFormState> {
  const id = formData.get("id");
  const passcode = formData.get("passcode");
  const confirmation = formData.get("confirm_passcode");
  if (typeof id !== "string" || !id) {
    return { error: "Pelanggan tidak valid." };
  }
  if (typeof passcode !== "string" || !/^\d{6}$/.test(passcode)) {
    return { error: "Passcode sementara harus tepat 6 digit angka." };
  }
  if (passcode !== confirmation) {
    return { error: "Konfirmasi passcode tidak cocok." };
  }

  try {
    const newHash = await hash(passcode, 12);
    await resetCustomerPasscode(id, newHash, randomUUID());
    revalidatePath("/customers");
    revalidatePath(`/customers/${id}`);
    revalidateTag("customers", "max");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal mereset passcode." };
  }
}

export async function loadMoreCustomersAction(input: {
  query: string;
  status: string;
  cursor: string | null;
}): Promise<{ customers: Customer[]; nextCursor: string | null }> {
  await verifySession();
  return getCustomersPage({
    query: input.query,
    status: input.status,
    cursor: input.cursor,
  });
}
