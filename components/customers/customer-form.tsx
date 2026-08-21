"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  CallIcon,
  Calendar01Icon,
  Edit01Icon,
  GaugeIcon,
  MapPinIcon,
  UserIcon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmationDialogHeader } from "@/components/ui/confirmation-dialog";
import {
  createCustomerAction,
  updateCustomerAction,
  type CustomerFormState,
} from "@/app/actions/customers";
import type { Customer } from "@/lib/types";

const initialState: CustomerFormState = {};

type FormValues = {
  name: string;
  phone: string;
  address: string;
  meter_number: string;
  join_date: string;
  status: "active" | "inactive";
};

const EMPTY_VALUES: FormValues = {
  name: "",
  phone: "",
  address: "",
  meter_number: "",
  join_date: "",
  status: "active",
};

function valuesOf(customer?: Customer): FormValues {
  if (!customer) return EMPTY_VALUES;
  return {
    name: customer.name,
    phone: customer.phone ?? "",
    address: customer.address ?? "",
    meter_number: customer.meter_number ?? "",
    join_date: customer.join_date ?? "",
    status: customer.status,
  };
}

function isDirty(current: FormValues, original: FormValues): boolean {
  return (
    current.name !== original.name ||
    current.phone !== original.phone ||
    current.address !== original.address ||
    current.meter_number !== original.meter_number ||
    current.join_date !== original.join_date ||
    current.status !== original.status
  );
}

const PHONE_REGEX = /^[0-9+\-\s()]{8,16}$/;

export function CustomerForm({
  mode = "create",
  customer,
  trigger,
}: {
  mode?: "create" | "edit";
  customer?: Customer;
  trigger?: React.ReactNode;
}) {
  const isEdit = mode === "edit";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const action = isEdit ? updateCustomerAction : createCustomerAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [lastState, setLastState] = useState(state);
  const [values, setValues] = useState<FormValues>(() =>
    valuesOf(customer)
  );
  const [original, setOriginal] = useState<FormValues>(() =>
    valuesOf(customer)
  );
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const dirty = isDirty(values, original);

  if (state !== lastState) {
    setLastState(state);
    if (state?.success) {
      setOpen(false);
    }
  }

  useEffect(() => {
    if (state?.success) {
      if (state.customerId) {
        toast.success("Pelanggan berhasil ditambahkan.");
        router.push(`/customers/${state.customerId}`);
      } else {
        toast.success("Perubahan tersimpan.");
        router.refresh();
      }
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (key === "name" || key === "phone") {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!values.name.trim()) {
      next.name = "Nama pelanggan wajib diisi.";
    }
    if (values.phone.trim() && !PHONE_REGEX.test(values.phone.trim())) {
      next.phone = "Nomor HP tidak valid. Gunakan 8–16 digit angka.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function closeForm() {
    if (dirty) {
      setConfirmOpen(true);
    } else {
      setOpen(false);
    }
  }

  function discardChanges() {
    setValues(original);
    setErrors({});
    setConfirmOpen(false);
    setOpen(false);
  }

  function handleOpenChange(next: boolean) {
    if (next) {
      setValues(valuesOf(customer));
      setOriginal(valuesOf(customer));
      setErrors({});
      setConfirmOpen(false);
      setOpen(true);
    } else {
      closeForm();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button>
              <HugeiconsIcon icon={isEdit ? Edit01Icon : Add01Icon} />
              {isEdit ? "Edit Pelanggan" : "Tambah Pelanggan"}
            </Button>
          )
        }
      />

      <DialogContent
        initialFocus={() => nameRef.current}
        className="max-h-[calc(100%-2rem)] overflow-y-auto sm:max-w-[420px] rounded-[14px] bg-card"
      >
        <DialogHeader className="border-b border-line pb-3">
          <DialogTitle className="font-display text-[18px] font-bold text-petrol">{isEdit ? "Edit Pelanggan" : "Tambah Pelanggan"}</DialogTitle>
          <DialogDescription className="font-mono text-[11px] text-muted-2">
            {isEdit
              ? `Nomor ${customer?.customer_number} tidak dapat diubah.`
              : "Nomor pelanggan dibuat otomatis oleh sistem."}
          </DialogDescription>
        </DialogHeader>

        <form
          ref={formRef}
          action={formAction}
          onSubmit={(e) => {
            if (!validate()) e.preventDefault();
          }}
          className="flex flex-col gap-3 pb-1"
        >
          {isEdit && customer && (
            <input type="hidden" name="id" value={customer.id} />
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted-text">
              Nama Pelanggan
            </Label>
            <div className="relative">
              <HugeiconsIcon
                icon={UserIcon}
                strokeWidth={1.6}
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-2"
              />
              <Input
                ref={nameRef}
                id="name"
                name="name"
                value={values.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="cth. Budi Santoso"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                autoComplete="off"
                className="h-11 pl-9 rounded-[10px] border-line"
              />
            </div>
            {errors.name && (
              <p id="name-error" className="text-xs text-coral">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone" className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted-text">
                Nomor HP
              </Label>
              <div className="relative">
                <HugeiconsIcon
                  icon={CallIcon}
                  strokeWidth={1.6}
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-2"
                />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  maxLength={16}
                  value={values.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="cth. 081234567890"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                  autoComplete="off"
                  className="h-11 pl-9 rounded-[10px] border-line"
                />
              </div>
              {errors.phone && (
                <p id="phone-error" className="text-xs text-coral">{errors.phone}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="meter_number" className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted-text">
                Nomor Meter
              </Label>
              <div className="relative">
                <HugeiconsIcon
                  icon={GaugeIcon}
                  strokeWidth={1.6}
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-2"
                />
                <Input
                  id="meter_number"
                  name="meter_number"
                  maxLength={20}
                  value={values.meter_number}
                  onChange={(e) => update("meter_number", e.target.value)}
                  placeholder="cth. WM-003234"
                  autoComplete="off"
                  className="h-11 pl-9 rounded-[10px] border-line"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address" className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted-text">
              Alamat
            </Label>
            <div className="relative">
              <HugeiconsIcon
                icon={MapPinIcon}
                strokeWidth={1.6}
                className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-muted-2"
              />
              <Textarea
                id="address"
                name="address"
                value={values.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="cth. Jl. Melati No.12, RT 03/RW 01"
                rows={2}
                autoComplete="off"
                className="h-20 pl-9 rounded-[10px] border-line"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="join_date" className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted-text">
                Tanggal Mulai
              </Label>
              <div className="relative">
                <HugeiconsIcon
                  icon={Calendar01Icon}
                  strokeWidth={1.6}
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-2"
                />
                <Input
                  id="join_date"
                  name="join_date"
                  type="date"
                  value={values.join_date}
                  onChange={(e) => update("join_date", e.target.value)}
                  className="h-11 pl-9 rounded-[10px] border-line"
                />
              </div>
            </div>

            {!isEdit && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="passcode" className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted-text">
                    Passcode Sementara
                  </Label>
                  <Input
                    id="passcode"
                    name="passcode"
                    type="password"
                    inputMode="numeric"
                    minLength={6}
                    maxLength={6}
                    pattern="[0-9]{6}"
                    placeholder="cth. 123456"
                    autoComplete="new-password"
                    className="h-11 rounded-[10px] border-line"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="confirm_passcode" className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted-text">
                    Konfirmasi Passcode
                  </Label>
                  <Input
                    id="confirm_passcode"
                    name="confirm_passcode"
                    type="password"
                    inputMode="numeric"
                    minLength={6}
                    maxLength={6}
                    pattern="[0-9]{6}"
                    placeholder="Ulangi passcode"
                    autoComplete="new-password"
                    className="h-11 rounded-[10px] border-line"
                  />
                </div>
              </div>
            )}
          </div>

          <p className="text-[11px] text-muted-2">
            {isEdit
              ? "Passcode tidak dapat diubah di sini."
              : "Kosongkan jika pelanggan belum perlu login. Pelanggan wajib mengganti passcode saat pertama login."}
          </p>

          <DialogFooter className="pt-2 border-t border-line">
            <Button
              type="button"
              variant="outline"
              className="rounded-[10px] border-line font-display text-[13px] font-semibold text-muted-text hover:text-petrol hover:border-petrol/40 w-full"
              onClick={closeForm}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="rounded-[10px] bg-petrol font-display text-[14px] font-semibold text-white hover:bg-petrol-2 w-full"
            >
              {pending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-[14px] bg-card">
          <ConfirmationDialogHeader
            icon={CheckmarkCircle01Icon}
            tone="warning"
            title="Perubahan belum disimpan"
            description="Jika ditutup sekarang, perubahan yang Anda buat akan hilang."
          />
          <DialogFooter className="pt-2 border-t border-line">
            <Button
              type="button"
              variant="outline"
              className="rounded-[10px] border-line font-display text-[13px] font-semibold text-muted-text hover:text-petrol hover:border-petrol/40 w-full"
              onClick={() => setConfirmOpen(false)}
            >
              Lanjut Mengisi
            </Button>
            <Button
              variant="outline"
              className="rounded-[10px] border-coral text-coral hover:bg-coral-light hover:border-coral font-display text-[13px] font-semibold w-full"
              onClick={discardChanges}
            >
              Buang Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}