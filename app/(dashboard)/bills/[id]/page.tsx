import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/auth/dal";
import {
  getAdjacentCustomerBills,
  getBillById,
  getBillReading,
} from "@/lib/data/bills";
import { getPaymentByBill } from "@/lib/data/payments";
import { getAppSettings } from "@/lib/data/settings";
import { BillDetailClient } from "./bill-detail-client";
import { canManageFinance } from "@/lib/staff";

export const metadata: Metadata = {
  title: "Detail Tagihan",
};

export default async function BillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await verifySession();
  const { id } = await params;

  const bill = await getBillById(id);
  if (!bill) notFound();

  const canManagePayment = canManageFinance(session.role);
  const [reading, adjacentBills, payment, settings] = await Promise.all([
    getBillReading(bill.meter_reading_id),
    getAdjacentCustomerBills(bill.customer.id, bill.period),
    canManagePayment ? getPaymentByBill(bill.id) : Promise.resolve(null),
    getAppSettings(),
  ]);

  return (
    <BillDetailClient
      bill={bill}
      reading={reading}
      canManagePayment={canManagePayment}
      payment={payment}
      previousBill={adjacentBills.previous}
      nextBill={adjacentBills.next}
      settings={settings}
    />
  );
}
