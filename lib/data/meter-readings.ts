import "server-only";

import { cache } from "react";
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
    const readings = (data ?? []) as MeterReading[];
    const invalidReading = readings.find(
      (reading) =>
        reading.previous_reading < 0 ||
        reading.current_reading < reading.previous_reading ||
        reading.usage !== reading.current_reading - reading.previous_reading
    );
    if (invalidReading) {
      throw new Error("Data pencatatan meter lama tidak konsisten dan perlu diperbaiki.");
    }
    const signedUrls = await createSignedUrlMap(
      supabase,
      "meter-photos",
      readings.map((reading) => reading.photo_path)
    );
    return readings.map((reading) => ({
      ...reading,
      photo_url: signedUrls.get(reading.photo_path ?? "") ?? null,
    }));
  }
);

export const getCustomerReadingStatus = cache(
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
            .select("*")
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
  }
);
