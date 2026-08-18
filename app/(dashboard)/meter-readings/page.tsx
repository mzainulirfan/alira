import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import {
  currentPeriod,
  getCustomerReadingStatus,
} from "@/lib/data/meter-readings";
import { getActiveTariff } from "@/lib/data/bills";
import { MeterReadingsClient } from "@/components/meter-readings/meter-readings-client";

export const metadata: Metadata = {
  title: "Pencatatan Meter",
};

export default async function MeterReadingsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; q?: string; status?: string }>;
}) {
  await verifySession();
  const params = await searchParams;
  const period =
    typeof params.period === "string" && /^\d{4}-\d{2}$/.test(params.period)
      ? params.period
      : currentPeriod();
  const query = typeof params.q === "string" ? params.q : "";

  const [rows, tariff] = await Promise.all([
    getCustomerReadingStatus(period),
    getActiveTariff(),
  ]);
  const done = rows.filter((r) => r.reading).length;
  const pending = rows.length - done;

  const status =
    typeof params.status === "string" &&
    (params.status === "all" ||
      params.status === "done" ||
      params.status === "pending")
      ? params.status
      : pending > 0
        ? "pending"
        : "all";

  const sorted = [...rows].sort((a, b) => {
    const aDone = a.reading ? 1 : 0;
    const bDone = b.reading ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;
    return a.customer.customer_number.localeCompare(
      b.customer.customer_number
    );
  });

  const pendingCustomers = sorted.filter((r) => !r.reading);

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
    />
  );
}