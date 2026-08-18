import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/auth/dal";
import { getBillById, getBillReading } from "@/lib/data/bills";
import { BillDetailClient } from "./bill-detail-client";

export const metadata: Metadata = {
  title: "Detail Tagihan",
};

export default async function BillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifySession();
  const { id } = await params;

  const bill = await getBillById(id);
  if (!bill) notFound();

  const reading = await getBillReading(bill.meter_reading_id);

  return <BillDetailClient bill={bill} reading={reading} />;
}