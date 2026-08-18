"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePasscodeAction, type SettingsFormState } from "@/app/actions/settings";

const noState: SettingsFormState = {};

export function SecurityForm() {
  const [state, formAction, pending] = useActionState(updatePasscodeAction, noState);
  const [lastState, setLastState] = useState(state);

  if (state !== lastState) setLastState(state);

  useEffect(() => {
    if (state?.success) toast.success("Passcode diganti.");
    else if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Ganti Passcode</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="current_passcode">Passcode Saat Ini</Label>
            <Input
              id="current_passcode"
              name="current_passcode"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new_passcode">Passcode Baru</Label>
            <Input
              id="new_passcode"
              name="new_passcode"
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm_passcode">Konfirmasi Passcode Baru</Label>
            <Input
              id="confirm_passcode"
              name="confirm_passcode"
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              required
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Menyimpan..." : "Ganti Passcode"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}