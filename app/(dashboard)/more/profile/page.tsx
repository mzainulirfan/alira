import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/dal";
import { getAppSettings } from "@/lib/data/settings";
import { ProfileForm } from "./profile-form";
import { ADMIN_ROLES } from "@/lib/staff";

export const metadata: Metadata = {
  title: "Profil Alira",
};

export default async function ProfilePage() {
  await requireRole(ADMIN_ROLES);
  const settings = await getAppSettings();

  return <ProfileForm settings={settings} />;
}
