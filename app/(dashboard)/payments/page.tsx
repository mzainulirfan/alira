import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/dal";
import { getRecentPayments } from "@/lib/data/payments";
import { PaymentsClient } from "@/components/payments/payments-client";
import { FINANCE_ROLES } from "@/lib/staff";

export const metadata: Metadata = {
  title: "Pembayaran",
};

export default async function PaymentsPage() {
  await requireRole(FINANCE_ROLES);
  const payments = await getRecentPayments(50);

  return <PaymentsClient payments={payments} />;
}
