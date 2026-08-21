"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, CheckmarkCircle01Icon, Key01Icon, LockPasswordIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePasscodeAction, type SettingsFormState } from "@/app/actions/settings";
import { SectionHeading } from "@/components/dashboard/section-heading";

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
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-3">
        <Link href="/more" className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-aqua-light text-aqua transition-colors hover:bg-aqua/80">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} />
        </Link>
        <div>
          <h1 className="font-display text-[26px] font-bold leading-[32px] text-petrol sm:text-[30px] sm:leading-[38px]">
            Keamanan
          </h1>
          <p className="mt-0.5 text-[12.5px] font-medium text-muted-text">
            {required ? "Ganti passcode sementara sebelum melanjutkan" : "Ganti passcode 6 digit untuk masuk aplikasi"}
          </p>
        </div>
      </div>

      <form ref={formRef} action={formAction} className="flex flex-col gap-5">
        <section className="flex flex-col">
          <SectionHeading title="Ganti Passcode" />
          <div className="rounded-[14px] border border-line bg-card p-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="current_passcode" className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted-text flex items-center gap-1.5">
                  <HugeiconsIcon icon={LockPasswordIcon} className="size-4 text-muted-2" />
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
                  className="h-11 rounded-[10px] border-line"
                  required
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 border-t border-dashed border-line pt-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="new_passcode" className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted-text flex items-center gap-1.5">
                    <HugeiconsIcon icon={Key01Icon} className="size-4 text-muted-2" />
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
                    className="h-11 rounded-[10px] border-line"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="confirm_passcode" className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted-text flex items-center gap-1.5">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 text-muted-2" />
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
                    className="h-11 rounded-[10px] border-line"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-2 border-t border-line">
          <Button type="submit" disabled={pending} className="rounded-[10px] bg-petrol font-display text-[14px] font-semibold text-white hover:bg-petrol-2 w-full sm:w-auto">
            {pending ? "Menyimpan..." : "Simpan Passcode"}
          </Button>
        </div>
      </form>
    </div>
  );
}