import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { getBillWithCustomer } from "@/lib/data/payments";
import { PaymentForm } from "./payment-form";
import { FINANCE_ROLES } from "@/lib/staff";

export const metadata: Metadata = {
  title: "Catat Pembayaran",
};

export default async function NewPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ bill?: string }>;
}) {
  await requireRole(FINANCE_ROLES);
  const params = await searchParams;
  const billId = params.bill;
  if (!billId) notFound();

  const bill = await getBillWithCustomer(billId);
  if (!bill) notFound();
  if (bill.status !== "unpaid" && bill.status !== "overdue") {
    redirect(`/bills/${bill.id}`);
  }

  return <PaymentForm bill={bill} />;
}
