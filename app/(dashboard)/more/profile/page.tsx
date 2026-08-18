import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import { getAppSettings } from "@/lib/data/settings";
import { SubPageHeader } from "@/components/layout/sub-page-header";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = {
  title: "Profil Alira",
};

export default async function ProfilePage() {
  await verifySession();
  const settings = await getAppSettings();

  return (
    <div className="flex flex-col gap-4">
      <SubPageHeader
        title="Profil Alira"
        description="Kelola identitas dan jatuh tempo tagihan."
      />
      <ProfileForm settings={settings} />
    </div>
  );
}