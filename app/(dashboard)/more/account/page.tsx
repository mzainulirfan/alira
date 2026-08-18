import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import { SubPageHeader } from "@/components/layout/sub-page-header";
import { AccountForm } from "./account-form";

export const metadata: Metadata = {
  title: "Akun",
};

export default async function AccountPage() {
  await verifySession();

  return (
    <div className="flex flex-col gap-4">
      <SubPageHeader
        title="Akun"
        description="Keluar dari aplikasi ini."
      />
      <AccountForm />
    </div>
  );
}