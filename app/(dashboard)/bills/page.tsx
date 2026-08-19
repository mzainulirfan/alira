import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import { getActiveTariff, getPeriodBills } from "@/lib/data/bills";
import { currentPeriod, isValidPeriod } from "@/lib/period";
import { getPeriodReadings } from "@/lib/data/meter-readings";
import { BillsClient } from "@/components/bills/bills-client";
import { canManageFinance } from "@/lib/staff";

export const metadata: Metadata = {
  title: "Tagihan",
};

export default async function BillsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; status?: string; customer?: string }>;
}) {
  const session = await verifySession();
  const params = await searchParams;
  const period = isValidPeriod(params.period) ? params.period : currentPeriod();
  const status = typeof params.status === "string" ? params.status : "all";
  const customerId =
    typeof params.customer === "string" && params.customer ? params.customer : null;

  const [bills, tariff, readings] = await Promise.all([
    getPeriodBills(period),
    getActiveTariff(),
    getPeriodReadings(period),
  ]);

  const customerBills = customerId
    ? bills.filter((b) => b.customer.id === customerId)
    : bills;

  const filtered =
    status === "all" ? customerBills : customerBills.filter((b) => b.status === status);

  return (
    <BillsClient
      bills={filtered}
      allBills={customerBills}
      period={period}
      status={status}
      customerId={customerId}
      tariff={tariff}
      readingCount={readings.length}
      canManage={canManageFinance(session.role)}
      hasActiveFilters={
        period !== currentPeriod() || status !== "all" || customerId !== null
      }
    />
  );
}
