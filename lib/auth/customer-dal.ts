import "server-only";

import { redirect } from "next/navigation";
import { getCustomerSession, type CustomerSessionPayload } from "@/lib/auth/customer-jwt";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import type { Customer } from "@/lib/types";

export type VerifiedCustomerSession = CustomerSessionPayload & {
  mustChangePasscode: boolean;
  profile: Customer;
};

export const getCurrentCustomerProfile = async (): Promise<Customer> => {
  const session = await verifyCustomerSession();
  return session.profile;
};

export const verifyCustomerSession = async (): Promise<VerifiedCustomerSession> => {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/customer/login?reset=true");
  }

  const supabase = createSupabaseAdmin();
  const { data: profile, error } = await supabase
    .from("pam_customers")
    .select(
      "id, customer_number, name, phone, address, meter_number, join_date, status, must_change_passcode, session_epoch, created_at, updated_at"
    )
    .eq("id", session.customerId)
    .eq("session_epoch", session.sessionEpoch)
    .maybeSingle();

  if (error || !profile || profile.status !== "active") {
    redirect("/customer/login?reset=true");
  }

  const customerProfile = profile as Customer;
  return {
    ...session,
    mustChangePasscode: profile.must_change_passcode,
    profile: customerProfile,
  };
};

export async function requireCustomerAuth(): Promise<VerifiedCustomerSession> {
  const session = await verifyCustomerSession();
  if (session.mustChangePasscode) {
    redirect("/customer/profile?required=true");
  }
  return session;
}