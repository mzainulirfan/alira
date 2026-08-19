import { getCurrentCustomerProfile } from "@/lib/auth/customer-dal";
import { getCustomerDashboardData } from "@/app/actions/customer-data";
import DashboardContent from "./DashboardContent";

export default async function CustomerDashboardPage() {
  const [profile, dashboardData] = await Promise.all([
    getCurrentCustomerProfile(),
    getCustomerDashboardData(),
  ]);

  return (
    <DashboardContent
      activeBill={dashboardData.activeBill}
      latestReading={dashboardData.latestReading}
      lastLogin={dashboardData.lastLogin}
      profile={profile}
    />
  );
}