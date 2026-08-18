import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import { getAppSettings } from "@/lib/data/settings";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = {
  title: "Profil Alira",
};

export default async function ProfilePage() {
  await verifySession();
  const settings = await getAppSettings();

  return <ProfileForm settings={settings} />;
}
