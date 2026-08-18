import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import { getRecentPayments } from "@/lib/data/payments";
import { PaymentsClient } from "@/components/payments/payments-client";

export const metadata: Metadata = {
  title: "Pembayaran",
};

export default async function PaymentsPage() {
  await verifySession();
  const payments = await getRecentPayments(50);

  return <PaymentsClient payments={payments} />;
}