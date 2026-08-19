"use server";

import { unstable_cache } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { createSignedUrlMap } from "@/lib/storage";
import type { Bill, MeterReading, Payment } from "@/lib/types";

export type DashboardData = {
  activeBill: BillSummary | null;
  latestReading: MeterSummary | null;
};

export type BillSummary = {
  id: string;
  period: string;
  total_amount: number;
  status: "unpaid" | "overdue";
  due_date: string | null;
};

export type MeterSummary = {
  id: string;
  period: string;
  current_reading: number;
  previous_reading: number;
  usage: number;
};

async function getDashboardDataForCustomer(customerId: string): Promise<DashboardData> {
  const supabase = createSupabaseAdmin();

  const [billResult, readingResult] = await Promise.all([
    supabase
      .from("pam_bills")
      .select("id, period, total_amount, status, due_date")
      .eq("customer_id", customerId)
      .in("status", ["unpaid", "overdue"])
      .order("due_date", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("pam_meter_readings")
      .select("id, period, current_reading, previous_reading, usage")
      .eq("customer_id", customerId)
      .order("period", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const error = billResult.error ?? readingResult.error;
  if (error) throw new Error(`Gagal memuat dashboard pelanggan: ${error.message}`);

  return {
    activeBill: billResult.data ? { ...billResult.data } : null,
    latestReading: readingResult.data ? { ...readingResult.data } : null,
  };
}

export const getCustomerDashboardData = unstable_cache(
  getDashboardDataForCustomer,
  ["customer-dashboard"],
  { revalidate: 60, tags: ["customer-dashboard"] }
);

export async function getCustomerBills(
  customerId: string,
  page = 1,
  limit = 20,
  statusFilter?: "all" | "unpaid" | "paid" | "overdue"
) {
  const supabase = createSupabaseAdmin();

  let query = supabase
    .from("pam_bills")
    .select("id, period, total_amount, status, due_date, created_at", { count: "exact" })
    .eq("customer_id", customerId)
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
  const supabase = createSupabaseAdmin();

  const { data: bill, error } = await supabase
    .from("pam_bills")
    .select(
      "id, customer_id, meter_reading_id, period, usage, price_per_m3, water_amount, monthly_fee, total_amount, due_date, status, created_at, updated_at"
    )
    .eq("id", billId)
    .maybeSingle();

  if (error || !bill) return null;
  return bill as unknown as Bill;
}

export async function getCustomerBillPayment(
  customerId: string,
  billId: string
): Promise<Pick<Payment, "id" | "payment_date"> | null> {
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("pam_payments")
    .select("id, payment_date")
    .eq("customer_id", customerId)
    .eq("bill_id", billId)
    .maybeSingle();

  if (error || !data) return null;
  return data as Pick<Payment, "id" | "payment_date">;
}

export type CustomerMeterReadingsFilter = {
  period?: string;
  range?: "current-month" | "last-3-months" | "all";
};

function formatPeriodKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

function subtractMonths(date: Date, count: number): Date {
  return new Date(date.getFullYear(), date.getMonth() - count, 1);
}

function normalizePeriodFilter(period: string): string {
  return /^\d{4}-\d{2}$/.test(period) ? `${period}-01` : period;
}

export async function getCustomerMeterReadings(
  customerId: string,
  page = 1,
  limit = 20,
  filter: CustomerMeterReadingsFilter = {}
) {
  const supabase = createSupabaseAdmin();

  let query = supabase
    .from("pam_meter_readings")
    .select(
      "id, period, previous_reading, current_reading, usage, photo_path, recorded_at, recorded_by",
      { count: "exact" }
    )
    .eq("customer_id", customerId)
    .order("period", { ascending: false });

  if (filter.period) {
    query = query.eq("period", normalizePeriodFilter(filter.period));
  } else if (filter.range === "current-month") {
    query = query.eq("period", formatPeriodKey(new Date()));
  } else if (filter.range === "last-3-months") {
    const end = new Date();
    const start = subtractMonths(end, 2);
    query = query.gte("period", formatPeriodKey(start)).lte("period", formatPeriodKey(end));
  }

  query = query.range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return { data: data as MeterReading[], total: count ?? 0, page, limit };
}

export async function getCustomerMeterReadingDetail(
  customerId: string,
  readingId: string
) {
  const supabase = createSupabaseAdmin();

  const { data: reading, error } = await supabase
    .from("pam_meter_readings")
    .select(
      "id, customer_id, period, previous_reading, current_reading, usage, photo_path, recorded_at, recorded_by, created_at"
    )
    .eq("id", readingId)
    .eq("customer_id", customerId)
    .maybeSingle();

  if (error || !reading) return null;

  const signedUrls = await createSignedUrlMap(
    supabase,
    "meter-photos",
    [reading.photo_path]
  );

  return {
    ...(reading as MeterReading),
    photo_url: signedUrls.get(reading.photo_path ?? "") ?? null,
  } as MeterReading;
}
