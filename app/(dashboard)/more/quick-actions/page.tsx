import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/dal";
import { getAppSettings } from "@/lib/data/settings";
import { normalizeQuickActionKeys } from "@/lib/quick-actions";
import { QuickActionsForm } from "./quick-actions-form";
import { ADMIN_ROLES } from "@/lib/staff";

export const metadata: Metadata = {
  title: "Quick Action",
};

export default async function QuickActionsPage() {
  await requireRole(ADMIN_ROLES);
  const settings = await getAppSettings();

  return (
    <QuickActionsForm
      initialActions={normalizeQuickActionKeys(settings.quick_actions)}
    />
  );
}
