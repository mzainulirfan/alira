import { getCurrentCustomerProfile } from "@/lib/auth/customer-dal";
import { getCustomerBills } from "@/app/actions/customer-data";
import BillsTableClient from "./BillsTableClient";

export default async function CustomerBillsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const profile = await getCurrentCustomerProfile();
  const resolvedParams = await searchParams;
  const initialPage = parseInt(resolvedParams.page || "1", 10);
  const initialStatusFilter = (resolvedParams.status as "all" | "unpaid" | "paid" | "overdue") || "all";

  const billsData = await getCustomerBills(profile?.id || "", initialPage, 20, initialStatusFilter);

  return (
    <BillsTableClient
      initialBills={billsData.data}
      total={billsData.total}
      initialPage={initialPage}
      initialStatusFilter={initialStatusFilter}
    />
  );
}