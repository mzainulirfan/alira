import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/auth/dal";
import { SecurityForm } from "./security-form";

export const metadata: Metadata = {
  title: "Keamanan",
};

export default async function SecurityPage() {
  const profile = await getCurrentProfile();

  return <SecurityForm required={profile.must_change_passcode} />;
}
