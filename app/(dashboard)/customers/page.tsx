import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import { getCustomerCounts, getCustomersPage } from "@/lib/data/customers";
import { CustomersClient } from "@/components/customers/customers-client";
import { canManageCustomers } from "@/lib/staff";

export const metadata: Metadata = {
  title: "Pelanggan",
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; cursor?: string }>;
}) {
  const session = await verifySession();
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const status =
    typeof params.status === "string" &&
    (params.status === "active" || params.status === "inactive")
      ? params.status
      : "all";
  const cursor = typeof params.cursor === "string" && params.cursor ? params.cursor : null;

  const [page, counts] = await Promise.all([
    getCustomersPage({ query, status, cursor }),
    getCustomerCounts(),
  ]);

  return (
    <CustomersClient
      customers={page.customers}
      nextCursor={page.nextCursor}
      total={counts.total}
      activeTotal={counts.activeTotal}
      query={query}
      status={status}
      canEdit={canManageCustomers(session.role)}
    />
  );
}
