"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  Key01Icon,
  LockPasswordIcon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubPageHeader } from "@/components/layout/sub-page-header";
import { updatePasscodeAction, type SettingsFormState } from "@/app/actions/settings";

const noState: SettingsFormState = {};

export function SecurityForm({ required = false }: { required?: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(updatePasscodeAction, noState);

  useEffect(() => {
    if (state?.success) {
      toast.success("Passcode diganti.");
      formRef.current?.reset();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <SubPageHeader
        title="Keamanan"
         description={
           required
             ? "Ganti passcode sementara sebelum melanjutkan ke aplikasi."
             : "Ganti passcode 6 digit untuk masuk aplikasi."
         }
        action={
          <Button type="submit" disabled={pending}>
            {pending ? "Menyimpan..." : "Simpan"}
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="current_passcode" className="flex items-center gap-1.5">
              <HugeiconsIcon icon={LockPasswordIcon} className="size-4 text-muted-foreground" />
              Passcode Saat Ini
            </Label>
            <Input
              id="current_passcode"
              name="current_passcode"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              minLength={6}
              maxLength={6}
              pattern="[0-9]{6}"
              placeholder="6 digit"
              className="h-10"
              required
            />
          </div>

          <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new_passcode" className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Key01Icon} className="size-4 text-muted-foreground" />
                Passcode Baru
              </Label>
              <Input
                id="new_passcode"
                name="new_passcode"
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                minLength={6}
                maxLength={6}
                pattern="[0-9]{6}"
                placeholder="6 digit"
                className="h-10"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm_passcode" className="flex items-center gap-1.5">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 text-muted-foreground" />
                Konfirmasi Passcode
              </Label>
              <Input
                id="confirm_passcode"
                name="confirm_passcode"
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                minLength={6}
                maxLength={6}
                pattern="[0-9]{6}"
                placeholder="Ulangi 6 digit"
                className="h-10"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
