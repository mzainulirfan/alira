import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/auth/dal";
import { SubPageHeader } from "@/components/layout/sub-page-header";
import { AccountForm } from "./account-form";

export const metadata: Metadata = {
  title: "Akun",
};

export default async function AccountPage() {
  const profile = await getCurrentProfile();

  return (
    <div className="flex flex-col gap-4">
      <SubPageHeader
        title="Akun"
        description="Informasi akun yang sedang digunakan."
      />
      <AccountForm profile={profile} />
    </div>
  );
}
