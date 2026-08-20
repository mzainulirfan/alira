"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  MapPinIcon,
  AiPhoneIcon,
  CalendarIcon,
  AiLockIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { changePasscodeAction } from "@/app/actions/customer-auth";
import { formatDate } from "@/lib/format";
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
      <div className="grid grid-cols-6 gap-1.5 sm:flex sm:gap-2" role="group" aria-label={label}>
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
            className="h-11 w-full min-w-0 rounded-lg border border-border bg-card text-center text-lg font-semibold text-foreground outline-none transition-all hover:border-primary/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground sm:w-10"
          />
        ))}
      </div>
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: typeof UserIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-muted/50 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <HugeiconsIcon icon={icon} className="size-4 shrink-0" />
        <span>{label}</span>
      </div>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <header className="flex items-center gap-4">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl font-semibold text-primary-foreground">
          {initials || "P"}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-xl font-medium">{profile.name}</h1>
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
        <div
          className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive"
          role="alert"
        >
          <HugeiconsIcon icon={AiLockIcon} size={16} />
          Ganti passcode sementara sebelum melanjutkan.
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Informasi pelanggan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoTile
              icon={UserIcon}
              label="Nomor meter"
              value={profile.meter_number || "-"}
            />
            <InfoTile
              icon={AiPhoneIcon}
              label="Telepon"
              value={profile.phone || "-"}
            />
            <InfoTile
              icon={MapPinIcon}
              label="Alamat"
              value={profile.address || "-"}
            />
            <InfoTile
              icon={CalendarIcon}
              label="Bergabung sejak"
              value={profile.join_date ? formatDate(profile.join_date) : "-"}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <HugeiconsIcon icon={AiLockIcon} size={18} />
            Ganti passcode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Masukkan passcode lama dan buat passcode baru 6 digit.
            </p>
            <div className="space-y-4">
              <PasscodeInput
                digits={oldDigits}
                setDigits={setOldDigits}
                refs={oldRefs}
                prefix="old"
                label="Passcode lama"
                disabled={pending}
              />
              <PasscodeInput
                digits={newDigits}
                setDigits={setNewDigits}
                refs={newRefs}
                prefix="new"
                label="Passcode baru"
                disabled={pending}
              />
              <PasscodeInput
                digits={confirmDigits}
                setDigits={setConfirmDigits}
                refs={confirmRefs}
                prefix="confirm"
                label="Konfirmasi passcode baru"
                disabled={pending}
              />
            </div>
            <input type="hidden" name="old_passcode" value={oldDigits.join("")} />
            <input type="hidden" name="new_passcode" value={newDigits.join("")} />
            <input type="hidden" name="confirm_passcode" value={confirmDigits.join("")} />
            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending}>
              <HugeiconsIcon icon={AiLockIcon} size={17} />
              {pending ? "Menyimpan..." : "Simpan passcode"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}