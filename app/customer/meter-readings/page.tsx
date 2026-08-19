import { getCurrentCustomerProfile } from "@/lib/auth/customer-dal";
import { getCustomerMeterReadings } from "@/app/actions/customer-data";
import MeterReadingsTableClient from "./MeterReadingsTableClient";

interface PageProps {
  searchParams: Promise<{ page?: string; period?: string }>;
}

export default async function CustomerMeterReadingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; period?: string }>;
}) {
  const [profile, readingsData] = await Promise.all([
    getCurrentCustomerProfile(),
    getCustomerMeterReadings(1, 20),
  ]);

  const resolvedParams = await searchParams;
  const initialPage = parseInt(resolvedParams.page || "1", 10);
  const initialPeriodFilter = resolvedParams.period || "";

  return (
    <MeterReadingsTableClient
      initialReadings={readingsData.data}
      total={readingsData.total}
      initialPage={initialPage}
      initialPeriodFilter={initialPeriodFilter}
    />
  );
}