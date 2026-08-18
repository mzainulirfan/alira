"use server";

import { revalidatePath } from "next/cache";
import {
  createCustomer,
  updateCustomer,
  setCustomerStatus,
} from "@/lib/data/customers";
import { assertRole } from "@/lib/auth/dal";
import { ADMIN_ROLES, METER_ROLES } from "@/lib/staff";
import type { CustomerInput } from "@/lib/types";

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
  return {
    name: name.trim(),
    phone,
    address: stringOrNull(formData.get("address")),
    meter_number: stringOrNull(formData.get("meter_number")),
    join_date: stringOrNull(formData.get("join_date")),
    status: formData.get("status") === "inactive" ? "inactive" : "active",
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
    const customer = await createCustomer(input);
    revalidatePath("/customers");
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
}
