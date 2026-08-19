import { getCurrentCustomerProfile } from "@/lib/auth/customer-dal";
import ProfileContent from "./ProfileContent";

export default async function CustomerProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ required?: string }>;
}) {
  const profile = await getCurrentCustomerProfile();
  const params = await searchParams;
  const required = params.required === "true";

  if (!profile) return null;
  return <ProfileContent profile={profile as any} required={required} />;
}