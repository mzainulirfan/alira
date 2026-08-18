"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Building06Icon,
  Calendar03Icon,
  CallIcon,
  MapPinIcon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubPageHeader } from "@/components/layout/sub-page-header";
import { updateProfileAction, type SettingsFormState } from "@/app/actions/settings";
import type { AppSettings } from "@/lib/types";

const noState: SettingsFormState = {};

export function ProfileForm({ settings }: { settings: AppSettings }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, noState);

  useEffect(() => {
    if (state?.success) toast.success("Profil tersimpan.");
    else if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <SubPageHeader
        title="Profil Alira"
        description="Kelola identitas dan jatuh tempo tagihan."
        action={
          <Button type="submit" disabled={pending}>
            {pending ? "Menyimpan..." : "Simpan"}
          </Button>
        }
      />

      <Card>
        <CardContent className="grid gap-4 py-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pam_name" className="flex items-center gap-1.5">
              <HugeiconsIcon icon={Building06Icon} className="size-4 text-muted-foreground" />
              Nama PAM
            </Label>
            <Input
              id="pam_name"
              name="pam_name"
              defaultValue={settings.pam_name}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone" className="flex items-center gap-1.5">
              <HugeiconsIcon icon={CallIcon} className="size-4 text-muted-foreground" />
              Telepon
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={settings.phone ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="address" className="flex items-center gap-1.5">
              <HugeiconsIcon icon={MapPinIcon} className="size-4 text-muted-foreground" />
              Alamat
            </Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={settings.address ?? ""}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Label htmlFor="billing_due_day" className="flex items-center gap-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <HugeiconsIcon icon={Calendar03Icon} className="size-4" />
            </span>
            Hari Jatuh Tempo Tagihan
          </Label>
          <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-start">
            <Input
              id="billing_due_day"
              name="billing_due_day"
              type="number"
              min={1}
              max={28}
              defaultValue={settings.billing_due_day}
              className="w-16 text-center"
              required
            />
            <span className="text-sm text-muted-foreground">setiap bulan</span>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
