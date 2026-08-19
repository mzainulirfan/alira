import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/dal";
import { getReport } from "@/lib/data/reports";
import { currentPeriod, isValidPeriod } from "@/lib/period";
import { ReportsClient } from "@/components/reports/reports-client";
import { FINANCE_ROLES } from "@/lib/staff";

export const metadata: Metadata = {
  title: "Laporan",
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  await requireRole(FINANCE_ROLES);
  const params = await searchParams;
  const period = isValidPeriod(params.period) ? params.period : currentPeriod();

  const { summary, rows } = await getReport(period);

  return (
    <ReportsClient
      period={period}
      summary={summary}
      rows={rows}
      hasActiveFilters={period !== currentPeriod()}
    />
  );
}
