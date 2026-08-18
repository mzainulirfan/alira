import { verifySession } from "@/lib/auth/dal";
import { getAppSettings } from "@/lib/data/settings";
import { Sidebar } from "@/components/layout/sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifySession();
  const settings = await getAppSettings();

  return (
    <div className="flex min-h-full flex-1">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader pamName={settings.pam_name} />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}