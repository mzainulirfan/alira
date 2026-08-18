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

export const getCustomerReadingStatus = cache(
  async (period: string): Promise<ReadingWithCustomer[]> => {
    const [customers, readings] = await Promise.all([
      getActiveCustomers(),
      getPeriodReadings(period),
    ]);

    const readingsByCustomer = new Map<string, MeterReading>();
    for (const r of readings) readingsByCustomer.set(r.customer_id, r);

    const missing = customers.filter((c) => !readingsByCustomer.has(c.id));

    const latestByCustomer = new Map<string, MeterReading>();
    if (missing.length > 0) {
      const supabase = createSupabaseAdmin();
      const chunk = 200;
      const chunks: string[][] = [];
      for (let i = 0; i < missing.length; i += chunk) {
        chunks.push(missing.slice(i, i + chunk).map((c) => c.id));
      }

      const results = await Promise.all(
        chunks.map((ids) =>
          supabase
            .from("pam_meter_readings")
            .select("*")
            .in("customer_id", ids)
            .order("period", { ascending: false })
        )
      );

      for (const { data, error } of results) {
        if (error) throw new Error(error.message);
        for (const r of (data ?? []) as MeterReading[]) {
          if (!latestByCustomer.has(r.customer_id)) {
            latestByCustomer.set(r.customer_id, r);
          }
        }
      }
    }

    return customers.map((customer) => {
      const reading = readingsByCustomer.get(customer.id) ?? null;
      if (reading) {
        return {
          customer,
          reading,
          previousReading: reading.previous_reading,
          previousPeriod: reading.period.slice(0, 7),
        };
      }

      const latest = latestByCustomer.get(customer.id) ?? null;
      return {
        customer,
        reading: null,
        previousReading: latest ? latest.current_reading : 0,
        previousPeriod: latest ? dateToPeriod(latest.period) : null,
      };
    });
  }
);