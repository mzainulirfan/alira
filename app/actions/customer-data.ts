"use server";

import { unstable_cache } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { getCurrentCustomerProfile } from "@/lib/auth/customer-dal";
import type { Bill, MeterReading } from "@/lib/types";

export type DashboardData = {
  activeBill: BillSummary | null;
  latestReading: MeterSummary | null;
  lastLogin: string | null;
};

export type BillSummary = {
  id: string;
  period: string;
  total_amount: number;
  status: "pending" | "paid" | "overdue" | "cancelled";
  due_date: string;
};

export type MeterSummary = {
  id: string;
  period: string;
  current_reading: number;
  previous_reading: number;
  usage: number;
};

async function getDashboardDataUncached(): Promise<DashboardData> {
  const profile = await getCurrentCustomerProfile();
  if (!profile) return { activeBill: null, latestReading: null, lastLogin: null };

  const supabase = createSupabaseAdmin();

  const [billResult, readingResult] = await Promise.all([
    supabase
      .from("pam_bills")
      .select("id, period, total_amount, status, due_date")
      .eq("customer_id", profile.id)
      .in("status", ["pending", "overdue"])
      .order("due_date", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("pam_meter_readings")
      .select("id, period, current_reading, previous_reading, usage")
      .eq("customer_id", profile.id)
      .order("period", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    activeBill: billResult.data ? { ...billResult.data } : null,
    latestReading: readingResult.data ? { ...readingResult.data } : null,
    lastLogin: null,
  };
}

export const getCustomerDashboardData = unstable_cache(
  getDashboardDataUncached,
  ["customer-dashboard"],
  { revalidate: 60, tags: ["customer-dashboard"] }
);

export async function getCustomerBills(
  page = 1,
  limit = 20,
  statusFilter?: "all" | "pending" | "paid" | "overdue"
) {
  const profile = await getCurrentCustomerProfile();
  if (!profile) return { data: [], total: 0, page, limit };

  const supabase = createSupabaseAdmin();

  let query = supabase
    .from("pam_bills")
    .select("id, period, total_amount, status, due_date, created_at", { count: "exact" })
    .eq("customer_id", profile.id)
    .order("period", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return { data: data as Bill[], total: count ?? 0, page, limit };
}

export async function getCustomerBillDetail(billId: string) {
  const profile = await getCurrentCustomerProfile();
  if (!profile) return null;

  const supabase = createSupabaseAdmin();

  const { data: bill, error } = await supabase
    .from("pam_bills")
    .select(
      "id, period, total_amount, status, due_date, monthly_fee, usage, price_per_m3, penalty, photo_path, created_at, paid_at, payment_method, payment_gateway_ref"
    )
    .eq("id", billId)
    .eq("customer_id", profile.id)
    .maybeSingle();

  if (error || !bill) return null;
  return bill as unknown as Bill;
}

export async function getCustomerMeterReadings(page = 1, limit = 20) {
  const profile = await getCurrentCustomerProfile();
  if (!profile) return { data: [], total: 0, page, limit };

  const supabase = createSupabaseAdmin();

  const query = supabase
    .from("pam_meter_readings")
    .select(
      "id, period, previous_reading, current_reading, usage, photo_path, recorded_at, recorded_by",
      { count: "exact" }
    )
    .eq("customer_id", profile.id)
    .order("period", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return { data: data as MeterReading[], total: count ?? 0, page, limit };
}