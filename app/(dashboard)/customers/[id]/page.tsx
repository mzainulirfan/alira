import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/auth/dal";
import { getCustomerById } from "@/lib/data/customers";
import { getCustomerDetail } from "@/lib/data/customer-detail";
import { getActiveTariff, currentPeriod } from "@/lib/data/bills";
import { CustomerDetailClient } from "./customer-detail-client";
import { canManageCustomers, canManageFinance } from "@/lib/staff";

export const metadata: Metadata = {
  title: "Detail Pelanggan",
};

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await verifySession();
  const { id } = await params;

  const [customer, detail, tariff, period] = await Promise.all([
    getCustomerById(id),
    getCustomerDetail(id),
    getActiveTariff(),
    currentPeriod(),
  ]);

  if (!customer) notFound();

  return (
    <CustomerDetailClient
      customer={customer}
      readings={detail.readings}
      bills={detail.bills}
      tariff={tariff}
      period={period}
      canEdit={canManageCustomers(session.role)}
      canChangeStatus={session.role === "admin"}
      canRecordMeter={session.role !== "treasurer"}
      canRecordPayment={canManageFinance(session.role)}
    />
  );
}
