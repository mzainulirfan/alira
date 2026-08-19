import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/dal";
import { getCustomers } from "@/lib/data/customers";
import { ADMIN_ROLES } from "@/lib/staff";
import { CustomerQrClient } from "./customer-qr-client";

export const metadata: Metadata = {
  title: "QR Pelanggan",
};

export default async function CustomerQrPage() {
  await requireRole(ADMIN_ROLES);
  const customers = await getCustomers();
  return (
    <CustomerQrClient
      customers={customers.filter((customer) => customer.status === "active")}
    />
  );
}
