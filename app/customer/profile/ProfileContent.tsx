"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  MapPinIcon,
  AiPhoneIcon,
  Calendar01Icon,
  AiLockIcon,
  ArrowLeft01Icon,
  GaugeIcon,
  ShieldIcon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { changePasscodeAction } from "@/app/actions/customer-auth";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
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
  value,
  onChange,
  prefix,
  label,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  prefix: string;
  label: string;
  disabled?: boolean;
}) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, DIGIT_COUNT);
    onChange(digits);
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, DIGIT_COUNT);
    onChange(text);
  }

  return (
    <div className="space-y-2">
      <Label className="block text-[12.5px] font-semibold text-petrol">{label}</Label>
      <input
        id={prefix}
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={DIGIT_COUNT}
        autoComplete="one-time-code"
        value={value}
        onChange={handleChange}
        onPaste={handlePaste}
        placeholder="••••••"
        disabled={disabled}
        className="h-11 w-full rounded-[10px] border border-line bg-card px-4 text-center font-mono text-lg tracking-[0.3em] text-petrol outline-none transition-all placeholder:text-muted-2/40 hover:border-petrol/40 focus-visible:border-aqua focus-visible:ring-3 focus-visible:ring-aqua/20 disabled:cursor-not-allowed disabled:bg-muted-2/10 disabled:text-muted-2"
      />
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: typeof UserIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-9 items-center justify-center rounded-[10px] bg-aqua-light text-aqua">
        <HugeiconsIcon icon={icon} size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-muted-2">{label}</p>
        <p className="truncate text-[13px] font-semibold text-petrol">{value}</p>
      </div>
    </div>
  );
}

export default function ProfileContent({ profile, required }: {
  profile: ProfileContentProps["profile"];
  required: ProfileContentProps["required"];
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(changePasscodeAction, { error: undefined, success: undefined });
  const [oldPasscode, setOldPasscode] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");

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

  const isActive = profile.status === "active";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/customer/dashboard")}
          className="flex size-9 items-center justify-center rounded-[10px] border border-line bg-card text-petrol transition-colors hover:bg-aqua-light hover:text-aqua"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} />
        </button>
        <div>
          <h1 className="font-display text-[26px] font-bold leading-[32px] text-petrol sm:text-[30px] sm:leading-[38px]">
            Profil Saya
          </h1>
          <p className="mt-0.5 text-[12.5px] font-medium text-muted-text">
            Kelola informasi akun Anda
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[14px] bg-gradient-to-br from-petrol via-petrol-2 to-[#0b2e34] p-5 sm:p-6">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)",
            backgroundSize: "14px 14px",
            maskImage: "linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.1))",
            WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.1))",
          }}
        />
        <div className="absolute -top-[38px] -right-[38px] size-[170px] rounded-full border-[1.5px] border-aqua/35">
          <div className="absolute inset-[22px] rounded-full border border-dashed border-brass/40" />
        </div>

        <div className="relative z-10 flex items-start gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 font-display text-xl font-bold text-white backdrop-blur-sm">
            {initials || "P"}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
              {profile.name}
            </h2>
            <p className="mt-0.5 font-mono text-[13px] text-aqua">
              {profile.customer_number}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold",
                  isActive ? "bg-green/20 text-green" : "bg-coral/20 text-coral"
                )}
              >
                <span className={cn("size-1 rounded-full", isActive ? "bg-green" : "bg-coral")} />
                {isActive ? "AKTIF" : "NONAKTIF"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {required && (
        <div className="flex items-center gap-2 rounded-[10px] bg-coral-light px-3 py-2.5">
          <HugeiconsIcon icon={AiLockIcon} size={16} className="shrink-0 text-coral" />
          <p className="text-[12.5px] font-medium text-coral">
            Ganti passcode sementara sebelum melanjutkan
          </p>
        </div>
      )}

      <div className="rounded-[14px] border border-line bg-card">
        <div className="flex items-center gap-2 border-b border-dashed border-line px-4 py-3">
          <HugeiconsIcon icon={UserIcon} size={16} className="text-aqua" />
          <p className="font-display text-[13.5px] font-bold text-petrol">Informasi Pelanggan</p>
        </div>

        <div className="flex flex-col gap-4 p-4">
          <InfoRow
            icon={GaugeIcon}
            label="Nomor Meter"
            value={profile.meter_number || "-"}
          />
          <InfoRow
            icon={AiPhoneIcon}
            label="Telepon"
            value={profile.phone || "-"}
          />
          <InfoRow
            icon={MapPinIcon}
            label="Alamat"
            value={profile.address || "-"}
          />
          <InfoRow
            icon={Calendar01Icon}
            label="Bergabung Sejak"
            value={profile.join_date ? formatDate(profile.join_date) : "-"}
          />
        </div>
      </div>

      <div className="rounded-[14px] border border-line bg-card">
        <div className="flex items-center gap-2 border-b border-dashed border-line px-4 py-3">
          <HugeiconsIcon icon={ShieldIcon} size={16} className="text-brass" />
          <p className="font-display text-[13.5px] font-bold text-petrol">Keamanan Akun</p>
        </div>

        <div className="flex flex-col gap-4 p-4">
          <InfoRow
            icon={Clock01Icon}
            label="Status Akun"
            value={isActive ? "Aktif" : "Nonaktif"}
          />
        </div>
      </div>

      <div className="rounded-[14px] border border-line bg-card">
        <div className="flex items-center gap-2 border-b border-dashed border-line px-4 py-3">
          <HugeiconsIcon icon={AiLockIcon} size={16} className="text-coral" />
          <p className="font-display text-[13.5px] font-bold text-petrol">Ganti Passcode</p>
        </div>

        <form action={action} className="flex flex-col gap-4 p-4">
          <p className="text-[12.5px] text-muted-2">
            Masukkan passcode lama dan buat passcode baru 6 digit.
          </p>

          <PasscodeInput
            value={oldPasscode}
            onChange={setOldPasscode}
            prefix="old"
            label="Passcode lama"
            disabled={pending}
          />
          <PasscodeInput
            value={newPasscode}
            onChange={setNewPasscode}
            prefix="new"
            label="Passcode baru"
            disabled={pending}
          />
          <PasscodeInput
            value={confirmPasscode}
            onChange={setConfirmPasscode}
            prefix="confirm"
            label="Konfirmasi passcode baru"
            disabled={pending}
          />

          <input type="hidden" name="old_passcode" value={oldPasscode} />
          <input type="hidden" name="new_passcode" value={newPasscode} />
          <input type="hidden" name="confirm_passcode" value={confirmPasscode} />

          <Button
            type="submit"
            className="w-full rounded-[10px] bg-petrol py-5 font-display text-[13px] font-semibold text-white hover:bg-petrol-2"
            disabled={pending}
          >
            <HugeiconsIcon icon={AiLockIcon} size={16} />
            {pending ? "Menyimpan..." : "Simpan Passcode"}
          </Button>
        </form>
      </div>
    </div>
  );
}
