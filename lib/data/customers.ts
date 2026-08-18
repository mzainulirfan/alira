import "server-only";

import { cache } from "react";
import { verifySession } from "@/lib/auth/dal";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import type { Customer, CustomerInput } from "@/lib/types";

export const CUSTOMER_PREFIX = "PAM";

function formatCustomerNumber(seq: number): string {
  return `${CUSTOMER_PREFIX}-${String(seq).padStart(6, "0")}`;
}

export async function getNextCustomerNumber(supabase: ReturnType<typeof createSupabaseAdmin>): Promise<string> {
  const { data } = await supabase
    .from("pam_customers")
    .select("customer_number")
    .order("customer_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const last = data?.customer_number;
  const seq = last ? Number(last.split("-")[1]) + 1 : 1;
  return formatCustomerNumber(seq);
}

export const getCustomers = cache(async () => {
  await verifySession();
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("pam_customers")
    .select("*")
    .order("customer_number", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Customer[];
});

export const getCustomerById = cache(async (id: string) => {
  await verifySession();
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("pam_customers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Customer | null;
});

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  await verifySession();
  const supabase = createSupabaseAdmin();
  const customerNumber = await getNextCustomerNumber(supabase);

  const { data, error } = await supabase
    .from("pam_customers")
    .insert({
      customer_number: customerNumber,
      name: input.name,
      phone: input.phone ?? null,
      address: input.address ?? null,
      meter_number: input.meter_number ?? null,
      join_date: input.join_date ?? null,
      status: input.status ?? "active",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Customer;
}

export async function updateCustomer(
  id: string,
  input: CustomerInput
): Promise<Customer> {
  await verifySession();
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("pam_customers")
    .update({
      name: input.name,
      phone: input.phone ?? null,
      address: input.address ?? null,
      meter_number: input.meter_number ?? null,
      join_date: input.join_date ?? null,
      status: input.status ?? "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Customer;
}

export async function setCustomerStatus(
  id: string,
  status: "active" | "inactive"
): Promise<void> {
  await verifySession();
  const supabase = createSupabaseAdmin();

  const { error } = await supabase
    .from("pam_customers")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}