import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import {
  getCustomerReadingStatus,
} from "@/lib/data/meter-readings";
import { currentPeriod, isValidPeriod } from "@/lib/period";
import { getActiveTariff } from "@/lib/data/bills";
import { MeterReadingsClient } from "@/components/meter-readings/meter-readings-client";
import { METER_ROLES } from "@/lib/staff";

export const metadata: Metadata = {
  title: "Pencatatan Meter",
};

export default async function MeterReadingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    period?: string;
    q?: string;
    status?: string;
    open?: string;
  }>;
}) {
  const session = await verifySession();
  const params = await searchParams;
  const period = isValidPeriod(params.period) ? params.period : currentPeriod();
  const query = typeof params.q === "string" ? params.q : "";

  const [rows, tariff] = await Promise.all([
    getCustomerReadingStatus(period),
    getActiveTariff(),
  ]);
  const done = rows.filter((r) => r.reading).length;

  const status =
    typeof params.status === "string" &&
    (params.status === "all" ||
      params.status === "done" ||
      params.status === "pending")
      ? params.status
      : "pending";

  const sorted = [...rows].sort((a, b) => {
    const aDone = a.reading ? 1 : 0;
    const bDone = b.reading ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;
    return a.customer.customer_number.localeCompare(
      b.customer.customer_number
    );
  });

  const filtered = sorted.filter((r) => {
    const matchesStatus =
      status === "all" ||
      (status === "done" && r.reading) ||
      (status === "pending" && !r.reading);
    if (!matchesStatus) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      r.customer.name.toLowerCase().includes(q) ||
      r.customer.customer_number.toLowerCase().includes(q) ||
      (r.customer.meter_number ?? "").toLowerCase().includes(q)
    );
  });
  const pendingCustomers = filtered.filter((row) => !row.reading);

  return (
    <MeterReadingsClient
      rows={filtered}
      period={period}
      done={done}
      total={rows.length}
      tariff={tariff}
      query={query}
      status={status}
      pendingCustomers={pendingCustomers}
      canEdit={METER_ROLES.includes(session.role)}
      hasActiveFilters={
        period !== currentPeriod() ||
        Boolean(params.q) ||
        typeof params.status === "string"
      }
      openCustomerId={typeof params.open === "string" ? params.open : null}
    />
  );
}
