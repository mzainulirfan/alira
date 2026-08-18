import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/dal";
import { getAppSettings } from "@/lib/data/settings";
import { Sidebar } from "@/components/layout/sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, settings, requestHeaders] = await Promise.all([
    getCurrentProfile(),
    getAppSettings(),
    headers(),
  ]);
  const pathname = requestHeaders.get("x-pathname");
  if (profile.must_change_passcode && pathname !== "/more/security") {
    redirect("/more/security?required=true");
  }

  return (
    <div className="flex min-h-full flex-1">
      <Sidebar role={profile.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          pamName={settings.pam_name}
          userName={profile.name}
          role={profile.role}
        />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>
      <BottomNav role={profile.role} />
    </div>
  );
}
