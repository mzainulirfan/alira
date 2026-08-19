import { getCurrentCustomerProfile } from "@/lib/auth/customer-dal";
import { getCustomerBills } from "@/app/actions/customer-data";
import BillsTableClient from "./BillsTableClient";

export default async function CustomerBillsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const [profile, billsData] = await Promise.all([
    getCurrentCustomerProfile(),
    getCustomerBills(1, 20, "all"),
  ]);

  const resolvedParams = await searchParams;
  const initialPage = parseInt(resolvedParams.page || "1", 10);
  const initialStatusFilter = (resolvedParams.status as "all" | "unpaid" | "pending" | "paid" | "overdue") || "all";

  return (
    <BillsTableClient
      initialBills={billsData.data}
      total={billsData.total}
      initialPage={initialPage}
      initialStatusFilter={initialStatusFilter as "all" | "pending" | "paid" | "overdue"}
    />
  );
}