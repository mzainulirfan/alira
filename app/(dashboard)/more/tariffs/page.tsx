import type { Metadata } from "next";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { requireRole } from "@/lib/auth/dal";
import { getTariffs } from "@/lib/data/settings";
import { TariffList, TariffForm } from "./tariff-list";
import { ADMIN_ROLES } from "@/lib/staff";
import { SectionHeading } from "@/components/dashboard/section-heading";

export const metadata: Metadata = {
  title: "Tarif",
};

export default async function TariffsPage() {
  await requireRole(ADMIN_ROLES);
  const tariffs = await getTariffs();
  const activeTotal = tariffs.filter((t) => t.is_active).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-3">
        <Link
          href="/more"
          className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-aqua-light text-aqua transition-colors hover:bg-aqua/80"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} />
        </Link>
        <div>
          <h1 className="font-display text-[26px] font-bold leading-[32px] text-petrol sm:text-[30px] sm:leading-[38px]">
            Tarif
          </h1>
          <p className="mt-0.5 text-[12.5px] font-medium text-muted-text">
            {activeTotal} aktif dari {tariffs.length} tarif
          </p>
        </div>
        <TariffForm />
      </div>

      <section className="flex flex-col">
        <SectionHeading title="Daftar Tarif" />
        <TariffList tariffs={tariffs} />
      </section>
    </div>
  );
}
