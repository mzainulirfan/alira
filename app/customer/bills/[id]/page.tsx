import { getCurrentCustomerProfile } from "@/lib/auth/customer-dal";
import { getCustomerBillDetail } from "@/app/actions/customer-data";
import { notFound } from "next/navigation";
import BillDetailClient from "./BillDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerBillDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [profile, bill] = await Promise.all([
    getCurrentCustomerProfile(),
    getCustomerBillDetail(id),
  ]);

  if (!bill) {
    notFound();
  }

  // Verify bill belongs to this customer
  if (bill.customer_id !== profile?.id) {
    notFound();
  }

  return <BillDetailClient bill={bill} />;
}