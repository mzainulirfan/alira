import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "@/lib/auth/session";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import type { StaffProfile, StaffRole } from "@/lib/types";
import { isStaffRole } from "@/lib/staff";

export type VerifiedSession = SessionPayload & {
  mustChangePasscode: boolean;
  profile: StaffProfile;
};

export const verifySession = cache(async (): Promise<VerifiedSession> => {
  const session = await getSession();
  if (!session) {
    redirect("/login?reset=true");
  }

  const supabase = createSupabaseAdmin();
  const { data: profile, error } = await supabase
    .from("pam_profiles")
    .select(
      "id, username, name, role, status, must_change_passcode, failed_attempts, locked_until, last_login_at, created_at, updated_at"
    )
    .eq("id", session.userId)
    .maybeSingle();

  if (
    error ||
    !profile ||
    profile.status !== "active" ||
    !isStaffRole(profile.role)
  ) {
    redirect("/login?reset=true");
  }

  const staffProfile = profile as StaffProfile;
  return {
    ...session,
    role: staffProfile.role,
    mustChangePasscode: staffProfile.must_change_passcode,
    profile: staffProfile,
  };
});

export const getCurrentProfile = cache(async (): Promise<StaffProfile> => {
  const session = await verifySession();
  return session.profile;
});

export async function requireRole(allowed: StaffRole[]): Promise<VerifiedSession> {
  const session = await verifySession();
  if (session.mustChangePasscode) redirect("/more/security?required=true");
  if (!allowed.includes(session.role)) redirect("/dashboard");
  return session;
}

export async function assertRole(allowed: StaffRole[]): Promise<VerifiedSession> {
  const session = await verifySession();
  if (session.mustChangePasscode) {
    throw new Error("Ganti passcode sementara sebelum melanjutkan.");
  }
  if (!allowed.includes(session.role)) throw new Error("Tidak memiliki akses.");
  return session;
}
