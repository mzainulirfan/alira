import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import { SubPageHeader } from "@/components/layout/sub-page-header";
import { SecurityForm } from "./security-form";

export const metadata: Metadata = {
  title: "Keamanan",
};

export default async function SecurityPage() {
  await verifySession();

  return (
    <div className="flex flex-col gap-4">
      <SubPageHeader
        title="Keamanan"
        description="Ganti passcode untuk masuk aplikasi."
      />
      <SecurityForm />
    </div>
  );
}