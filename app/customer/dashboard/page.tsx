import { requireCustomerAuth } from "@/lib/auth/customer-dal";
import { getCustomerDashboardData } from "@/app/actions/customer-data";
import DashboardContent from "./DashboardContent";

export default async function CustomerDashboardPage() {
  const { profile } = await requireCustomerAuth();
  const dashboardData = await getCustomerDashboardData(profile.id);

  return (
    <DashboardContent
      activeBill={dashboardData.activeBill}
      latestReading={dashboardData.latestReading}
      lastLogin={profile.last_login_at}
      profile={profile}
    />
  );
}
