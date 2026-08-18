import "server-only";

import { cache } from "react";
import { verifySession } from "@/lib/auth/dal";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export type ReportSummary = {
  totalCustomers: number;
  activeCustomers: number;
  totalUsage: number;
  totalBilled: number;
  totalPaid: number;
  totalUnpaid: number;
  overdue: number;
  paymentsCount: number;
};

export type ReportRow = {
  customer_number: string;
  name: string;
  status: string;
  usage: number;
  total_amount: number;
  paid_amount: number;
  bill_status: string;
};

export function periodToDate(period: string): string {
  return `${period}-01`;
}

export const getReport = cache(
  async (period: string): Promise<{ summary: ReportSummary; rows: ReportRow[] }> => {
    await verifySession();
    const supabase = createSupabaseAdmin();

    const [{ data: customers }, { data: readings }, { data: bills }, { data: payments }] =
      await Promise.all([
        supabase
          .from("pam_customers")
          .select("id, customer_number, name, status"),
        supabase
          .from("pam_meter_readings")
          .select("usage")
          .eq("period", periodToDate(period)),
        supabase
          .from("pam_bills")
          .select("id, customer_id, usage, total_amount, status")
          .eq("period", periodToDate(period)),
        supabase
          .from("pam_payments")
          .select("bill_id, amount, bill:pam_bills(period)")
          .eq("bill.period", periodToDate(period)),
      ]);

    const paidByBill = new Map<string, number>();
    for (const p of (payments ?? []) as Array<{ bill_id: string; amount: number }>) {
      paidByBill.set(p.bill_id, (paidByBill.get(p.bill_id) ?? 0) + p.amount);
    }

    const billByCustomer = new Map<string, {
      id: string;
      usage: number;
      total_amount: number;
      status: string;
    }>();
    for (const b of (bills ?? []) as Array<{
      customer_id: string;
      id: string;
      usage: number;
      total_amount: number;
      status: string;
    }>) {
      billByCustomer.set(b.customer_id, b);
    }

    const rows: ReportRow[] = [];
    for (const c of (customers ?? []) as Array<{
      id: string;
      customer_number: string;
      name: string;
      status: string;
    }>) {
      const bill = billByCustomer.get(c.id) ?? undefined;
      rows.push({
        customer_number: c.customer_number,
        name: c.name,
        status: c.status,
        usage: bill?.usage ?? 0,
        total_amount: bill?.total_amount ?? 0,
        paid_amount: bill ? paidByBill.get(bill.id) ?? 0 : 0,
        bill_status: bill?.status ?? "no_bill",
      });
    }

    const paidAmount = (payments ?? []).reduce(
      (s, p) => s + (p as { amount: number }).amount,
      0
    );
    const totalBilled = (bills ?? []).reduce(
      (s, b) => s + (b as { total_amount: number }).total_amount,
      0
    );
    const totalUsage = (readings ?? []).reduce(
      (s, r) => s + (r as { usage: number }).usage,
      0
    );

    return {
      summary: {
        totalCustomers: customers?.length ?? 0,
        activeCustomers:
          (customers ?? []).filter((c) => (c as { status: string }).status === "active")
            .length ?? 0,
        totalUsage,
        totalBilled,
        totalPaid: paidAmount,
        totalUnpaid: totalBilled - paidAmount,
        overdue:
          (bills ?? []).filter((b) => (b as { status: string }).status === "overdue")
            .length ?? 0,
        paymentsCount: payments?.length ?? 0,
      },
      rows,
    };
  }
);