import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import { getTariffs } from "@/lib/data/settings";
import { SubPageHeader } from "@/components/layout/sub-page-header";
import { TariffList } from "./tariff-list";

export const metadata: Metadata = {
  title: "Tarif",
};

export default async function TariffsPage() {
  await verifySession();
  const tariffs = await getTariffs();

  return (
    <div className="flex flex-col gap-4">
      <SubPageHeader
        title="Tarif"
        description="Kelola tarif air dan abonemen."
      />
      <TariffList tariffs={tariffs} />
    </div>
  );
}