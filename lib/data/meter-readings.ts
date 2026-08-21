import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { verifySession } from "@/lib/auth/dal";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { dateToPeriod, periodToDate } from "@/lib/period";
import { createSignedUrlMap } from "@/lib/storage";
import type { Bill, Customer, MeterReading } from "@/lib/types";

export type ReadingWithCustomer = {
  customer: Customer;
  reading: MeterReading | null;
  previousReading: number;
  previousPeriod: string | null;
  billStatus: Bill["status"] | null;
};

export const getActiveCustomers = cache(async (): Promise<Customer[]> => {
  await verifySession();
  return getCachedActiveCustomers();
});

const getCachedActiveCustomers = unstable_cache(
  async (): Promise<Customer[]> => {
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("pam_customers")
      .select(
        "id, customer_number, name, phone, address, meter_number, join_date, status, created_at, updated_at"
      )
      .eq("status", "active")
      .order("customer_number", { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []) as Customer[];
  },
  ["customers-active"],
  { tags: ["customers"], revalidate: 60 }
);

export const getPeriodReadings = cache(
  async (period: string): Promise<MeterReading[]> => {
    await verifySession();
    return getCachedPeriodReadings(period);
  }
);

const getCachedPeriodReadings = unstable_cache(
  async (period: string): Promise<MeterReading[]> => {
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("pam_meter_readings")
      .select(
        "id, customer_id, period, previous_reading, current_reading, usage, photo_path, photo_url, recorded_by, recorded_at, created_at"
      )
      .eq("period", periodToDate(period));

    if (error) throw new Error(error.message);
    const readings = (data ?? []) as MeterReading[];
    const invalidCount = readings.filter(
      (reading) =>
        reading.previous_reading < 0 ||
        reading.current_reading < reading.previous_reading ||
        reading.usage !== reading.current_reading - reading.previous_reading
    ).length;
    if (invalidCount > 0) {
      console.warn(`[meter-readings] ${invalidCount} reading(s) inkonsisten pada periode ${period} — difilter, tidak crash`);
    }
    const validReadings = readings.filter(
      (reading) =>
        reading.previous_reading >= 0 &&
        reading.current_reading >= reading.previous_reading &&
        reading.usage === reading.current_reading - reading.previous_reading
    );
    const signedUrls = await createSignedUrlMap(
      supabase,
      "meter-photos",
      validReadings.map((reading) => reading.photo_path)
    );
    return validReadings.map((reading) => ({
      ...reading,
      photo_url: signedUrls.get(reading.photo_path ?? "") ?? null,
    }));
  },
  ["period-readings"],
  { tags: ["meter-readings"], revalidate: 60 }
);

export const getCustomerReadingStatus = cache(
  async (period: string): Promise<ReadingWithCustomer[]> => {
    await verifySession();
    return getCachedReadingStatus(period);
  }
);

const getCachedReadingStatus = unstable_cache(
  async (period: string): Promise<ReadingWithCustomer[]> => {
    const supabase = createSupabaseAdmin();
    const [customers, readings, { data: bills, error: billsError }] = await Promise.all([
      getActiveCustomers(),
      getPeriodReadings(period),
      supabase
        .from("pam_bills")
        .select("customer_id, status")
        .eq("period", periodToDate(period)),
    ]);
    if (billsError) throw new Error(billsError.message);

    const readingsByCustomer = new Map<string, MeterReading>();
    for (const r of readings) readingsByCustomer.set(r.customer_id, r);
    const billStatusByCustomer = new Map<string, Bill["status"]>();
    for (const bill of (bills ?? []) as Array<{
      customer_id: string;
      status: Bill["status"];
    }>) {
      billStatusByCustomer.set(bill.customer_id, bill.status);
    }

    const missing = customers.filter((c) => !readingsByCustomer.has(c.id));

    const latestByCustomer = new Map<string, MeterReading>();
    if (missing.length > 0) {
      const chunk = 200;
      const chunks: string[][] = [];
      for (let i = 0; i < missing.length; i += chunk) {
        chunks.push(missing.slice(i, i + chunk).map((c) => c.id));
      }

      const results = await Promise.all(
        chunks.map((ids) =>
          supabase
            .from("pam_meter_readings")
            .select(
              "id, customer_id, period, previous_reading, current_reading, usage, photo_path, photo_url, recorded_by, recorded_at, created_at"
            )
            .in("customer_id", ids)
            .lt("period", periodToDate(period))
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
          billStatus: billStatusByCustomer.get(customer.id) ?? null,
        };
      }

      const latest = latestByCustomer.get(customer.id) ?? null;
      return {
        customer,
        reading: null,
        previousReading: latest ? latest.current_reading : 0,
        previousPeriod: latest ? dateToPeriod(latest.period) : null,
        billStatus: null,
      };
    });
  },
  ["reading-status"],
  { tags: ["customers", "meter-readings", "bills"], revalidate: 60 }
);
