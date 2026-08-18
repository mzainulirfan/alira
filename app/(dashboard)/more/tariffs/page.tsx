import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/dal";
import { getTariffs } from "@/lib/data/settings";
import { SubPageHeader } from "@/components/layout/sub-page-header";
import { TariffList, TariffForm } from "./tariff-list";
import { ADMIN_ROLES } from "@/lib/staff";

export const metadata: Metadata = {
  title: "Tarif",
};

export default async function TariffsPage() {
  await requireRole(ADMIN_ROLES);
  const tariffs = await getTariffs();
  const activeTotal = tariffs.filter((t) => t.is_active).length;

  return (
    <div className="flex flex-col gap-4">
      <SubPageHeader
        title="Tarif"
        description={`${activeTotal} aktif dari ${tariffs.length} tarif`}
        action={<TariffForm />}
      />
      <TariffList tariffs={tariffs} />
    </div>
  );
}
