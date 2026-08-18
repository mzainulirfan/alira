import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/auth/dal";
import { getBillWithCustomer } from "@/lib/data/payments";
import { PaymentForm } from "./payment-form";

export const metadata: Metadata = {
  title: "Catat Pembayaran",
};

export default async function NewPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ bill?: string }>;
}) {
  await verifySession();
  const params = await searchParams;
  const billId = params.bill;
  if (!billId) notFound();

  const bill = await getBillWithCustomer(billId);
  if (!bill) notFound();

  return <PaymentForm bill={bill} />;
}