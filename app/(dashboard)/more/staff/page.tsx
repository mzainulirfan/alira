import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/dal";
import { getStaffProfiles } from "@/lib/data/staff";
import { ADMIN_ROLES } from "@/lib/staff";
import { StaffClient } from "./staff-client";

export const metadata: Metadata = {
  title: "Admin & Pegawai",
};

export default async function StaffPage() {
  const session = await requireRole(ADMIN_ROLES);
  const staff = await getStaffProfiles();

  return <StaffClient staff={staff} currentUserId={session.userId} />;
}
