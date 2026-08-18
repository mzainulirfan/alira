import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import { getCustomers } from "@/lib/data/customers";
import { CustomersClient } from "@/components/customers/customers-client";

export const metadata: Metadata = {
  title: "Pelanggan",
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await verifySession();
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const status = typeof params.status === "string" ? params.status : "all";

  const customers = await getCustomers();

  const filtered = customers.filter((c) => {
    const matchesStatus =
      status === "all" || (status === "active" && c.status === "active") || (status === "inactive" && c.status === "inactive");
    if (!matchesStatus) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.customer_number.toLowerCase().includes(q) ||
      (c.meter_number ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <CustomersClient
      customers={filtered}
      total={customers.length}
      activeTotal={customers.filter((c) => c.status === "active").length}
      query={query}
      status={status}
    />
  );
}