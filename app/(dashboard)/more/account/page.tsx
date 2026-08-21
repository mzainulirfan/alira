import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/auth/dal";
import { AccountForm } from "./account-form";

export const metadata: Metadata = {
  title: "Akun",
};

export default async function AccountPage() {
  const profile = await getCurrentProfile();

  return <AccountForm profile={profile} />;
}
