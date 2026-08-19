import { getCurrentCustomerProfile } from "@/lib/auth/customer-dal";
import { getCustomerDashboardData } from "@/app/actions/customer-data";
import DashboardContent from "./DashboardContent";

export default async function CustomerDashboardPage() {
  const profile = await getCurrentCustomerProfile();
  const dashboardData = await getCustomerDashboardData(profile?.id || "");

  return (
    <DashboardContent
      activeBill={dashboardData.activeBill}
      latestReading={dashboardData.latestReading}
      lastLogin={dashboardData.lastLogin}
      profile={profile}
    />
  );
}