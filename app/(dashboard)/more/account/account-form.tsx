"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Key01Icon,
  UserIcon,
  ShieldIcon,
  ClockIcon,
} from "@hugeicons/core-free-icons";
import { STAFF_ROLE_LABEL } from "@/lib/staff";
import type { StaffRole } from "@/lib/types";
import type { StaffProfile } from "@/lib/types";
import { LogoutButton } from "../logout-button";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { cn } from "@/lib/utils";

const ROLE_COLORS: Record<StaffRole, string> = {
  admin: "bg-aqua-light text-aqua",
  treasurer: "bg-brass-light text-brass",
  meter_reader: "bg-info/15 text-info",
};

export function AccountForm({ profile }: { profile: StaffProfile }) {
  const isActive = profile.status === "active";

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
            Akun
          </h1>
          <p className="mt-0.5 text-[12.5px] font-medium text-muted-text">
            Informasi akun yang sedang digunakan
          </p>
        </div>
      </div>

      <section className="flex flex-col">
        <SectionHeading title="Profil Saya" />
        <div className="group relative overflow-hidden rounded-[14px] border border-line bg-card py-4 pr-3 pl-4 transition-all hover:-translate-y-0.5 hover:border-petrol/30 hover:shadow-md">
          <span className="absolute top-0 bottom-0 left-0 w-1 bg-aqua" />
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 border-t border-dashed border-line"
          />
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 border-t border-dashed border-line"
          />

          <div className="relative flex items-start gap-3">
            <div
              className={cn(
                "flex size-12 shrink-0 items-center justify-center rounded-[12px]",
                ROLE_COLORS[profile.role]
              )}
            >
              <HugeiconsIcon icon={UserIcon} size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[17px] font-bold text-petrol">
                {profile.name}
              </p>
              <p className="mt-0.5 flex items-center gap-1 font-mono text-[12px] text-muted-2">
                @{profile.username}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-mono text-[10px] font-bold",
                    ROLE_COLORS[profile.role]
                  )}
                >
                  {STAFF_ROLE_LABEL[profile.role].toUpperCase()}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-mono text-[10px] font-bold",
                    isActive ? "bg-aqua-light text-aqua" : "bg-muted text-muted-2"
                  )}
                >
                  {isActive ? "AKTIF" : "NONAKTIF"}
                </span>
              </div>
            </div>
          </div>

          <div className="relative mt-4 border-t border-dashed border-line pt-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-[8px] bg-muted text-muted-2">
                  <HugeiconsIcon icon={ShieldIcon} className="size-4" />
                </div>
                <div>
                  <p className="font-mono text-[10px] text-muted-2">Role</p>
                  <p className="font-mono text-[12px] font-medium text-petrol">
                    {STAFF_ROLE_LABEL[profile.role]}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-[8px] bg-muted text-muted-2">
                  <HugeiconsIcon icon={ClockIcon} className="size-4" />
                </div>
                <div>
                  <p className="font-mono text-[10px] text-muted-2">Login Terakhir</p>
                  <p className="font-mono text-[12px] font-medium text-petrol">
                    {profile.last_login_at
                      ? formatDateTime(profile.last_login_at)
                      : "Belum pernah"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col">
        <SectionHeading title="Pengaturan" />
        <div className="rounded-[14px] border border-line bg-card p-2">
          <Link
            href="/more/security"
            className="group relative flex items-center gap-3 overflow-hidden rounded-[12px] border border-transparent bg-transparent py-2.5 pr-2 pl-3 transition-all hover:border-petrol/30 hover:bg-petrol/3"
          >
            <span className="absolute top-0 bottom-0 left-0 w-1 bg-aqua/60 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex size-9 shrink-0 items-center justify-center rounded-[9px] bg-brass-light text-brass transition-colors group-hover:bg-petrol group-hover:text-white">
              <HugeiconsIcon icon={Key01Icon} size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[13px] font-semibold text-petrol">
                Ganti Passcode
              </p>
              <p className="truncate font-mono text-[10.5px] text-muted-2">
                Ganti passcode 6 digit untuk masuk aplikasi
              </p>
            </div>
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-paper text-muted-2 transition-all group-hover:bg-petrol group-hover:text-white">
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
            </span>
          </Link>
        </div>
      </section>

      <LogoutButton />
    </div>
  );
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
