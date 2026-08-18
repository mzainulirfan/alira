import "server-only";

import { cache } from "react";
import { requireRole } from "@/lib/auth/dal";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import type { Bill, Customer, Payment } from "@/lib/types";
import { FINANCE_ROLES } from "@/lib/staff";

export type PaymentWithBill = Payment & {
  bill: Pick<Bill, "id" | "period" | "total_amount" | "status"> & {
    customer: Pick<Customer, "id" | "name" | "customer_number">;
  };
};

export type PaymentDetail = Payment & {
  receiver_name: string | null;
};

export const getRecentPayments = cache(
  async (limit = 20): Promise<PaymentWithBill[]> => {
    await requireRole(FINANCE_ROLES);
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("pam_payments")
      .select(
        "*, bill:pam_bills(id, period, total_amount, status, customer:pam_customers(id, name, customer_number))"
      )
      .order("payment_date", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data ?? []) as PaymentWithBill[];
  }
);

export const getBillWithCustomer = cache(
  async (billId: string): Promise<(Bill & { customer: Pick<Customer, "id" | "name" | "customer_number"> }) | null> => {
    await requireRole(FINANCE_ROLES);
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("pam_bills")
      .select("*, customer:pam_customers(id, name, customer_number)")
      .eq("id", billId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as typeof data;
  }
);

export const getPaymentByBill = cache(
  async (billId: string): Promise<PaymentDetail | null> => {
    await requireRole(FINANCE_ROLES);
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("pam_payments")
      .select("*")
      .eq("bill_id", billId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    let receiverName: string | null = null;
    if (data.received_by) {
      const { data: receiver, error: receiverError } = await supabase
        .from("pam_profiles")
        .select("name")
        .eq("id", data.received_by)
        .maybeSingle();
      if (receiverError) throw new Error(receiverError.message);
      receiverName = receiver?.name ?? null;
    }

    return { ...(data as Payment), receiver_name: receiverName };
  }
);
