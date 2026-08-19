import { notFound } from "next/navigation";
import { getCurrentCustomerProfile } from "@/lib/auth/customer-dal";
import { getCustomerMeterReadingDetail } from "@/app/actions/customer-data";
import MeterReadingDetailClient from "./MeterReadingDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerMeterReadingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await getCurrentCustomerProfile();
  const reading = await getCustomerMeterReadingDetail(profile.id, id);

  if (!reading || reading.customer_id !== profile.id) {
    notFound();
  }

  return <MeterReadingDetailClient reading={reading} />;
}
