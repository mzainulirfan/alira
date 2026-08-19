import { getCurrentCustomerProfile } from "@/lib/auth/customer-dal";
import { getCustomerMeterReadings } from "@/app/actions/customer-data";
import MeterReadingsTableClient from "./MeterReadingsTableClient";

export default async function CustomerMeterReadingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; period?: string }>;
}) {
  const profile = await getCurrentCustomerProfile();
  const resolvedParams = await searchParams;
  const initialPage = parseInt(resolvedParams.page || "1", 10);
  const initialPeriodFilter = resolvedParams.period || "";

  const readingsData = await getCustomerMeterReadings(profile?.id || "", initialPage, 20);

  return (
    <MeterReadingsTableClient
      initialReadings={readingsData.data}
      total={readingsData.total}
      initialPage={initialPage}
      initialPeriodFilter={initialPeriodFilter}
    />
  );
}
