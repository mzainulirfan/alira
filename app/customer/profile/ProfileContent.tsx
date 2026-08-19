"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  LockIcon,
  SaveIcon,
  MailIcon,
  MapPinIcon,
  AiPhoneIcon,
  CalendarIcon,
  CircleCheckIcon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
        const next = [...digits];
        next[index] = "";
        setDigits(next);
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
      <Label className="block text-sm font-medium text-foreground">{label}</Label>
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
              "h-12 w-10 min-w-0 rounded-lg border-2 bg-card text-center text-lg font-semibold text-foreground outline-none transition-all",
              "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
              "hover:border-primary/50",
              "disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed",
              "border-border"
            )}
          />
        ))}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, iconColor = "text-muted-foreground" }: {
  icon: any;
  label: string;
  value: string;
  iconColor?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/50">
        <HugeiconsIcon icon={icon} size={18} className={iconColor} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
        <p className="font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

const DIGIT_COUNT = 6;

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
    <div className="flex flex-col gap-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Profil Saya</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola informasi akun dan keamanan</p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <div className="size-24 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-foreground">{profile?.name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "?"}</span>
                  </div>
                  {profile.must_change_passcode && (
                    <Badge variant="secondary" className="absolute -bottom-2 -right-2">
                      <HugeiconsIcon icon={AlertCircleIcon} size={10} className="mr-1" />
                      Ganti Passcode
                    </Badge>
                  )}
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-foreground">{profile?.name}</h2>
                  <p className="text-sm text-muted-foreground font-mono">{profile?.customer_number}</p>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <Badge variant={profile?.status === "active" ? "success" : "secondary"} className="gap-1">
                      <HugeiconsIcon icon={CircleCheckIcon} size={10} />
                      {profile?.status === "active" ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border space-y-3">
                  <InfoRow icon={CalendarIcon} label="Bergabung" value={profile?.join_date ? new Date(profile.join_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"} iconColor="text-primary" />
                  <InfoRow icon={MailIcon} label="Status" value={profile?.status === "active" ? "Aktif" : "Nonaktif"} iconColor={profile?.status === "active" ? "text-success" : "text-muted-foreground"} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={UserIcon} size={18} className="text-primary" />
                Informasi Pelanggan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow icon={UserIcon} label="Nama Lengkap" value={profile?.name || "-"} iconColor="text-primary" />
                <InfoRow icon={MailIcon} label="Nomor Pelanggan" value={profile?.customer_number || "-"} iconColor="text-muted-foreground" />
                <InfoRow icon={UserIcon} label="Nomor Meter" value={profile?.meter_number || "-"} iconColor="text-muted-foreground" />
                <InfoRow icon={MailIcon} label="Telepon" value={profile?.phone || "-"} iconColor="text-muted-foreground" />
                <InfoRow icon={MapPinIcon} label="Alamat" value={profile?.address || "-"} iconColor="text-muted-foreground" />
                <InfoRow icon={CalendarIcon} label="Bergabung Sejak" value={profile?.join_date ? new Date(profile.join_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"} iconColor="text-primary" />
                <InfoRow icon={CircleCheckIcon} label="Status" value={profile?.status === "active" ? "Aktif" : "Nonaktif"} iconColor={profile?.status === "active" ? "text-success" : "text-muted-foreground"} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={LockIcon} size={18} className="text-primary" />
                Keamanan & Passcode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={action} className="flex flex-col gap-6">
                <div className="grid gap-4 sm:grid-cols-3">
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
                <Button type="submit" className="w-full sm:w-auto" disabled={pending} size="lg">
                  <HugeiconsIcon icon={SaveIcon} size={16} className="mr-2" />
                  Simpan Perubahan
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-destructive">
                <HugeiconsIcon icon={AlertCircleIcon} size={18} />
                Zona Bahaya
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Tindakan ini tidak dapat dibatalkan. Semua data Anda akan dihapus permanen.</p>
              <Button variant="destructive" className="w-full sm:w-auto">
                <HugeiconsIcon icon={AlertCircleIcon} size={16} className="mr-2" />
                Hapus Akun
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}