"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  LockIcon,
  SaveIcon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { changePasscodeAction } from "@/app/actions/customer-auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProfileContentProps {
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
  error,
  disabled,
}: {
  digits: string[];
  setDigits: (digits: string[]) => void;
  refs: React.RefObject<(HTMLInputElement | null)[]>;
  prefix: string;
  label: string;
  error?: boolean;
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
        document.getElementById(`${prefix}-${index}`)?.focus();
      } else {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      document.getElementById(`${prefix}-${index}`)?.focus();
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
            onChange={(e) => {
              const digit = e.target.value.replace(/\D/g, "").slice(-1);
              const next = [...digits];
              next[i] = digit;
              setDigits(next);
              if (digit && i < DIGIT_COUNT - 1) {
                document.getElementById(`${prefix}-${i + 1}`)?.focus();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace") {
                e.preventDefault();
                if (i > 0) {
                  const next = [...digits];
                  next[i] = "";
                  setDigits(next);
                  document.getElementById(`${prefix}-${i - 1}`)?.focus();
                } else {
                  const next = [...digits];
                  next[i] = "";
                  setDigits(next);
                }
              } else if (e.key === "ArrowLeft" && i > 0) {
                document.getElementById(`${prefix}-${i - 1}`)?.focus();
              } else if (e.key === "ArrowRight" && i < DIGIT_COUNT - 1) {
                document.getElementById(`${prefix}-${i + 1}`)?.focus();
              }
            }}
            onPaste={(e) => {
              e.preventDefault();
              const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, DIGIT_COUNT);
              const next = Array(DIGIT_COUNT).fill("");
              for (let j = 0; j < text.length; j++) next[j] = text[j];
              setDigits(next);
            }}
            aria-label={`Digit ${i + 1}`}
            disabled={disabled}
            className={cn(
              "h-14 w-full min-w-0 flex-1 rounded-md border border-input bg-transparent text-center text-xl font-semibold text-foreground outline-none transition-colors",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            )}
          />
        ))}
      </div>
    </div>
  );
}

export default function ProfileContent({ profile, required }: {
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

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-xl font-medium">Profil Saya</h1>
        <p className="text-sm text-muted-foreground">Kelola informasi akun dan keamanan</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={UserIcon} size={18} />
            Informasi Pelanggan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <HugeiconsIcon icon={UserIcon} size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Nama</p>
              <p className="font-medium">{profile?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <HugeiconsIcon icon={UserIcon} size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Nomor Pelanggan</p>
              <p className="font-medium">{profile?.customer_number}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <HugeiconsIcon icon={UserIcon} size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Nomor Meter</p>
              <p className="font-medium">{profile?.meter_number || "-"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <HugeiconsIcon icon={UserIcon} size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Alamat</p>
              <p className="font-medium">{profile?.address || "-"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <HugeiconsIcon icon={UserIcon} size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Telepon</p>
              <p className="font-medium">{profile?.phone || "-"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <HugeiconsIcon icon={UserIcon} size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{profile?.status}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <HugeiconsIcon icon={UserIcon} size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bergabung Sejak</p>
              <p className="font-medium">
                {profile?.join_date ? new Date(profile.join_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={LockIcon} size={18} />
            Ganti Passcode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="flex flex-col gap-4">
            <div className="space-y-3">
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
            <Button type="submit" className="w-full" disabled={pending}>
              Simpan Perubahan
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}