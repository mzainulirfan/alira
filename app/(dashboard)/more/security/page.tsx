import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import { SecurityForm } from "./security-form";

export const metadata: Metadata = {
  title: "Keamanan",
};

export default async function SecurityPage() {
  await verifySession();

  return <SecurityForm />;
}
