"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  MapPinIcon,
  AiPhoneIcon,
  CalendarIcon,
  CircleCheckIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { changePasscodeAction } from "@/app/actions/customer-auth";
import { toast } from "sonner";

export interface ProfileContentProps {
  profile: {
    id: string;
    customer_number: string;
    name: string;
    phone: string | null;
    address: string | null;
    meter_number: string | null;
    join_date: string | null;
    status: "active" | "inactive";
    created_at: string;
    updated_at: string;
    must_change_passcode: boolean;
  } | null;
  required: boolean;
}

const DIGIT_COUNT = 6;

function PasscodeInput({
  digits,
  setDigits,
  refs,
  prefix,
  label,
  disabled,
}: {
  digits: string[];
  setDigits: (digits: string[]) => void;
  refs: React.RefObject<(HTMLInputElement | null)[]>;
  prefix: string;
  label: string;
  disabled?: boolean;
}) {
  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < DIGIT_COUNT - 1) {
      refs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index] === "" && index > 0) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
        document.getElementById(`${prefix}-${index - 1}`)?.focus();
      } else {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      document.getElementById(`${prefix}-${index - 1}`)?.focus();
    } else if (e.key === "ArrowRight" && index < DIGIT_COUNT - 1) {
      document.getElementById(`${prefix}-${index + 1}`)?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, DIGIT_COUNT);
    const next = Array(DIGIT_COUNT).fill("");
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setDigits(next);
  }

  return (
    <div className="space-y-2">
      <Label className="block text-sm font-medium">{label}</Label>
      <div className="flex gap-2" role="group" aria-label={label}>
        {Array.from({ length: DIGIT_COUNT }).map((_, i) => (
          <input
            key={i}
            id={`${prefix}-${i}`}
            ref={(el) => { refs.current[i] = el; }}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            autoComplete="one-time-code"
            value={digits[i]}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            aria-label={`Digit ${i + 1}`}
            disabled={disabled}
            className="h-12 w-10 min-w-0 rounded-lg border-2 bg-card text-center text-lg font-semibold text-foreground outline-none transition-all focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 hover:border-primary/50 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed border-border"
          />
        ))}
      </div>
    </div>
  );
}

export default function ProfileContent({ profile, required }: {
  profile: ProfileContentProps["profile"];
  required: ProfileContentProps["required"];
}) {
  const [state, action, pending] = useActionState(changePasscodeAction, { error: undefined, success: undefined });
  const [oldDigits, setOldDigits] = useState<string[]>(() => Array(6).fill(""));
  const [newDigits, setNewDigits] = useState<string[]>(() => Array(6).fill(""));
  const [confirmDigits, setConfirmDigits] = useState<string[]>(() => Array(6).fill(""));
  const oldRefs = useRef<(HTMLInputElement | null)[]>([]);
  const newRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (state?.success) toast.success("Passcode berhasil diubah");
    if (state?.error) toast.error(state.error);
  }, [state]);

  if (!profile) return null;

  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header className="flex items-center gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
          {initials || "P"}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-xl font-semibold">{profile.name}</h1>
            <Badge variant={profile.status === "active" ? "success" : "secondary"}>
              {profile.status === "active" ? "Aktif" : "Nonaktif"}
            </Badge>
          </div>
          <p className="mt-0.5 font-mono text-sm text-muted-foreground">
            {profile.customer_number}
          </p>
        </div>
      </header>

      {required && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive" role="alert">
          Ganti passcode sementara sebelum melanjutkan.
        </p>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Informasi pelanggan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <HugeiconsIcon icon={UserIcon} size={18} className="mt-0.5 text-muted-foreground" />
            <div><p className="text-sm text-muted-foreground">Nomor meter</p><p className="font-medium">{profile.meter_number || "-"}</p></div>
          </div>
          <div className="flex items-start gap-3">
            <HugeiconsIcon icon={AiPhoneIcon} size={18} className="mt-0.5 text-muted-foreground" />
            <div><p className="text-sm text-muted-foreground">Telepon</p><p className="font-medium">{profile.phone || "-"}</p></div>
          </div>
          <div className="flex items-start gap-3">
            <HugeiconsIcon icon={MapPinIcon} size={18} className="mt-0.5 text-muted-foreground" />
            <div><p className="text-sm text-muted-foreground">Alamat</p><p className="font-medium">{profile.address || "-"}</p></div>
          </div>
          <div className="flex items-start gap-3">
            <HugeiconsIcon icon={CalendarIcon} size={18} className="mt-0.5 text-muted-foreground" />
            <div><p className="text-sm text-muted-foreground">Bergabung sejak</p><p className="font-medium">{profile.join_date ? new Date(profile.join_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-base">Ganti passcode</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-5 text-sm text-muted-foreground">Gunakan 6 digit angka yang mudah Anda ingat, tetapi tidak mudah ditebak.</p>
          <form action={action} className="space-y-5">
            <div className="space-y-4">
                  <PasscodeInput
                    digits={oldDigits}
                    setDigits={setOldDigits}
                    refs={oldRefs}
                    prefix="old"
                    label="Passcode Lama"
                    disabled={pending}
                  />
                  <PasscodeInput
                    digits={newDigits}
                    setDigits={setNewDigits}
                    refs={newRefs}
                    prefix="new"
                    label="Passcode Baru"
                    disabled={pending}
                  />
                  <PasscodeInput
                    digits={confirmDigits}
                    setDigits={setConfirmDigits}
                    refs={confirmRefs}
                    prefix="confirm"
                    label="Konfirmasi Passcode Baru"
                    disabled={pending}
                  />
            </div>
            <input type="hidden" name="old_passcode" value={oldDigits.join("")} />
            <input type="hidden" name="new_passcode" value={newDigits.join("")} />
            <input type="hidden" name="confirm_passcode" value={confirmDigits.join("")} />
            <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
              Simpan passcode
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
