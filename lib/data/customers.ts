import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { assertRole, verifySession } from "@/lib/auth/dal";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import type { Customer, CustomerInput } from "@/lib/types";
import { ADMIN_ROLES, METER_ROLES } from "@/lib/staff";

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

export const getCustomers = cache(async (): Promise<Customer[]> => {
  await verifySession();
  return getCachedCustomers();
});

const getCachedCustomers = unstable_cache(
  async (): Promise<Customer[]> => {
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("pam_customers")
      .select(
        "id, customer_number, name, phone, address, meter_number, join_date, status, created_at, updated_at"
      )
      .order("customer_number", { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []) as Customer[];
  },
  ["customers-list"],
  { tags: ["customers"], revalidate: 60 }
);

export const getCustomerById = cache(async (id: string) => {
  await verifySession();
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("pam_customers")
    .select(
      "id, customer_number, name, phone, address, meter_number, join_date, status, created_at, updated_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Customer | null;
});

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

const CUSTOMER_COLUMNS =
  "id, customer_number, name, phone, address, meter_number, join_date, status, created_at, updated_at";

export async function getCustomerCounts(): Promise<{
  total: number;
  activeTotal: number;
}> {
  const supabase = createSupabaseAdmin();
  const [totalResult, activeResult] = await Promise.all([
    supabase.from("pam_customers").select("id", { count: "exact", head: true }),
    supabase
      .from("pam_customers")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
  ]);
  if (totalResult.error) throw new Error(totalResult.error.message);
  if (activeResult.error) throw new Error(activeResult.error.message);
  return {
    total: totalResult.count ?? 0,
    activeTotal: activeResult.count ?? 0,
  };
}

export async function getCustomersPage({
  query,
  status,
  cursor,
  limit = 100,
}: {
  query: string;
  status: string;
  cursor: string | null;
  limit?: number;
}): Promise<{ customers: Customer[]; nextCursor: string | null }> {
  const supabase = createSupabaseAdmin();
  let queryBuilder = supabase
    .from("pam_customers")
    .select(CUSTOMER_COLUMNS)
    .order("customer_number", { ascending: true })
    .limit(limit + 1);

  if (status === "active" || status === "inactive") {
    queryBuilder = queryBuilder.eq("status", status);
  }
  if (cursor) {
    queryBuilder = queryBuilder.gt("customer_number", cursor);
  }
  if (query.trim()) {
    const q = escapeLike(query.trim());
    queryBuilder = queryBuilder.or(
      `name.ilike.%${q}%,customer_number.ilike.%${q}%,meter_number.ilike.%${q}%`
    );
  }

  const { data, error } = await queryBuilder;
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Customer[];
  const hasMore = rows.length > limit;
  return {
    customers: rows.slice(0, limit),
    nextCursor: hasMore ? rows[limit - 1].customer_number : null,
  };
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  await assertRole(METER_ROLES);
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
      status: "active",
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
  await assertRole(METER_ROLES);
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("pam_customers")
    .update({
      name: input.name,
      phone: input.phone ?? null,
      address: input.address ?? null,
      meter_number: input.meter_number ?? null,
      join_date: input.join_date ?? null,
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
  await assertRole(ADMIN_ROLES);
  const supabase = createSupabaseAdmin();

  const { error } = await supabase
    .from("pam_customers")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
