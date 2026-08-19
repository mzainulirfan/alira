import { getCurrentCustomerProfile } from "@/lib/auth/customer-dal";
import { getCustomerMeterReadings } from "@/app/actions/customer-data";
import MeterReadingsTableClient from "./MeterReadingsTableClient";

export default async function CustomerMeterReadingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; period?: string; range?: string }>;
}) {
  const profile = await getCurrentCustomerProfile();
  const resolvedParams = await searchParams;
  const initialPage = parseInt(resolvedParams.page || "1", 10);
  const initialPeriodFilter = resolvedParams.period || "";
  const initialRangeFilter =
    resolvedParams.range === "current-month" || resolvedParams.range === "last-3-months"
      ? resolvedParams.range
      : "all";

  const readingsData = await getCustomerMeterReadings(profile?.id || "", initialPage, 20, {
    period: initialPeriodFilter,
    range: initialPeriodFilter ? "all" : initialRangeFilter,
  });

  return (
    <MeterReadingsTableClient
      initialReadings={readingsData.data}
      total={readingsData.total}
      initialPage={initialPage}
      initialPeriodFilter={initialPeriodFilter}
      initialRangeFilter={initialRangeFilter}
    />
  );
}
