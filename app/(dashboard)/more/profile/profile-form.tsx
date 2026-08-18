"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfileAction, type SettingsFormState } from "@/app/actions/settings";
import type { AppSettings } from "@/lib/types";

const noState: SettingsFormState = {};

export function ProfileForm({ settings }: { settings: AppSettings }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, noState);
  const [lastState, setLastState] = useState(state);

  if (state !== lastState) setLastState(state);

  useEffect(() => {
    if (state?.success) toast.success("Profil tersimpan.");
    else if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Profil Alira</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pam_name">Nama PAM</Label>
            <Input
              id="pam_name"
              name="pam_name"
              defaultValue={settings.pam_name}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">Alamat</Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={settings.address ?? ""}
              rows={2}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Telepon</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={settings.phone ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="billing_due_day">Hari Jatuh Tempo Tagihan</Label>
            <Input
              id="billing_due_day"
              name="billing_due_day"
              type="number"
              min={1}
              max={28}
              defaultValue={settings.billing_due_day}
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Menyimpan..." : "Simpan Profil"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}