import { getCurrentCustomerProfile } from "@/lib/auth/customer-dal";
import {
  getCustomerBillDetail,
  getCustomerBillPayment,
  getCustomerMeterReadingDetail,
} from "@/app/actions/customer-data";
import { notFound } from "next/navigation";
import BillDetailClient from "./BillDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerBillDetailPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await getCurrentCustomerProfile();
  const bill = await getCustomerBillDetail(id);

  if (!bill || bill.customer_id !== profile.id) {
    notFound();
  }

  const [reading, payment] = await Promise.all([
    bill.meter_reading_id
      ? getCustomerMeterReadingDetail(profile.id, bill.meter_reading_id)
      : Promise.resolve(null),
    getCustomerBillPayment(profile.id, bill.id),
  ]);

  return <BillDetailClient bill={bill} reading={reading} payment={payment} />;
}
