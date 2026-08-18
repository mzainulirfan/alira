import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/dal";
import { getAppSettings } from "@/lib/data/settings";
import { normalizeQuickActionKeys } from "@/lib/quick-actions";
import { SubPageHeader } from "@/components/layout/sub-page-header";
import { QuickActionsForm } from "./quick-actions-form";
import { ADMIN_ROLES } from "@/lib/staff";

export const metadata: Metadata = {
  title: "Quick Action",
};

export default async function QuickActionsPage() {
  await requireRole(ADMIN_ROLES);
  const settings = await getAppSettings();

  return (
    <div className="flex flex-col gap-4">
      <SubPageHeader
        title="Quick Action"
        description="Pilih dan urutkan maksimal 3 pintasan di Dashboard."
      />
      <QuickActionsForm
        initialActions={normalizeQuickActionKeys(settings.quick_actions)}
      />
    </div>
  );
}
