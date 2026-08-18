import "server-only";

import { cache } from "react";
import { verifySession } from "@/lib/auth/dal";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import type { Customer, MeterReading } from "@/lib/types";

export type ReadingWithCustomer = {
  customer: Customer;
  reading: MeterReading | null;
  previousReading: number;
  previousPeriod: string | null;
};

export function periodToDate(period: string): string {
  return `${period}-01`;
}

export function dateToPeriod(date: string): string {
  return date.slice(0, 7);
}

export function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export const getActiveCustomers = cache(async (): Promise<Customer[]> => {
  await verifySession();
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("pam_customers")
    .select("*")
    .eq("status", "active")
    .order("customer_number", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Customer[];
});

export const getPeriodReadings = cache(
  async (period: string): Promise<MeterReading[]> => {
    await verifySession();
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("pam_meter_readings")
      .select("*")
      .eq("period", periodToDate(period));

    if (error) throw new Error(error.message);
    return (data ?? []) as MeterReading[];
  }
);

export const getLatestReadingByCustomer = cache(
  async (customerId: string): Promise<MeterReading | null> => {
    await verifySession();
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("pam_meter_readings")
      .select("*")
      .eq("customer_id", customerId)
      .order("period", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as MeterReading | null;
  }
);

export const getCustomerReadingStatus = cache(
  async (period: string): Promise<ReadingWithCustomer[]> => {
    const [customers, readings] = await Promise.all([
      getActiveCustomers(),
      getPeriodReadings(period),
    ]);

    const readingsByCustomer = new Map<string, MeterReading>();
    for (const r of readings) readingsByCustomer.set(r.customer_id, r);

    const result: ReadingWithCustomer[] = [];
    for (const customer of customers) {
      const reading = readingsByCustomer.get(customer.id) ?? null;
      let previousReading = 0;
      let previousPeriod: string | null = null;

      if (reading) {
        previousReading = reading.previous_reading;
        previousPeriod = reading.period.slice(0, 7);
      } else {
        const latest = await getLatestReadingByCustomer(customer.id);
        if (latest) {
          previousReading = latest.current_reading;
          previousPeriod = dateToPeriod(latest.period);
        }
      }

      result.push({ customer, reading, previousReading, previousPeriod });
    }

    return result;
  }
);