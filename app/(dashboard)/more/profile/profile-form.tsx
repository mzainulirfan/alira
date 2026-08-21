"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Building06Icon,
  Calendar03Icon,
  CallIcon,
  MapPinIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfileAction, type SettingsFormState } from "@/app/actions/settings";
import type { AppSettings } from "@/lib/types";
import { SectionHeading } from "@/components/dashboard/section-heading";

const noState: SettingsFormState = {};

export function ProfileForm({ settings }: { settings: AppSettings }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, noState);

  useEffect(() => {
    if (state?.success) toast.success("Profil tersimpan.");
    else if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-3">
        <Link href="/more" className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-aqua-light text-aqua transition-colors hover:bg-aqua/80">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} />
        </Link>
        <div>
          <h1 className="font-display text-[26px] font-bold leading-[32px] text-petrol sm:text-[30px] sm:leading-[38px]">
            Profil Alira
          </h1>
          <p className="mt-0.5 text-[12.5px] font-medium text-muted-text">
            Kelola identitas dan jatuh tempo tagihan
          </p>
        </div>
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        <section className="flex flex-col">
          <SectionHeading title="Identitas PAM" />
          <div className="rounded-[14px] border border-line bg-card p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pam_name" className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted-text flex items-center gap-1.5">
                  <HugeiconsIcon icon={Building06Icon} className="size-4 text-muted-2" />
                  Nama PAM
                </Label>
                <Input id="pam_name" name="pam_name" defaultValue={settings.pam_name} required className="h-11 rounded-[10px] border-line" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone" className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted-text flex items-center gap-1.5">
                  <HugeiconsIcon icon={CallIcon} className="size-4 text-muted-2" />
                  Telepon
                </Label>
                <Input id="phone" name="phone" type="tel" defaultValue={settings.phone ?? ""} className="h-11 rounded-[10px] border-line" />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="address" className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted-text flex items-center gap-1.5">
                  <HugeiconsIcon icon={MapPinIcon} className="size-4 text-muted-2" />
                  Alamat
                </Label>
                <Textarea id="address" name="address" defaultValue={settings.address ?? ""} rows={3} className="h-24 rounded-[10px] border-line" />
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col">
          <SectionHeading title="Jatuh Tempo" />
          <div className="rounded-[14px] border border-line bg-card p-4">
            <Label htmlFor="billing_due_day" className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted-text flex items-center gap-2">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-[9px] bg-aqua-light text-aqua">
                <HugeiconsIcon icon={Calendar03Icon} className="size-4" />
              </span>
              Hari Jatuh Tempo Tagihan
            </Label>
            <div className="mt-2 flex shrink-0 items-center justify-between gap-2 sm:justify-start">
              <Input id="billing_due_day" name="billing_due_day" type="number" min={1} max={28} defaultValue={settings.billing_due_day} className="w-20 text-center rounded-[10px] border-line" required />
              <span className="font-mono text-[12px] text-muted-2">setiap bulan</span>
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-2 border-t border-line">
          <Button type="submit" disabled={pending} className="rounded-[10px] bg-petrol font-display text-[14px] font-semibold text-white hover:bg-petrol-2 w-full sm:w-auto">
            {pending ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </div>
  );
}