import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import { getReport } from "@/lib/data/reports";
import { currentPeriod } from "@/lib/data/bills";
import { ReportsClient } from "@/components/reports/reports-client";

export const metadata: Metadata = {
  title: "Laporan",
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  await verifySession();
  const params = await searchParams;
  const period =
    typeof params.period === "string" && /^\d{4}-\d{2}$/.test(params.period)
      ? params.period
      : currentPeriod();

  const { summary, rows } = await getReport(period);

  return <ReportsClient period={period} summary={summary} rows={rows} />;
}
