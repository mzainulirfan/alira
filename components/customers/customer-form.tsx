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
import { cn } from "@/lib/utils";
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
      <DialogTrigger render={<Button />}>
        {trigger ?? (
          <>
            <HugeiconsIcon icon={isEdit ? Edit01Icon : Add01Icon} />
            {isEdit ? "Edit" : "Tambah Pelanggan"}
          </>
        )}
      </DialogTrigger>
      <DialogContent
        initialFocus={() => nameRef.current}
        className="max-h-[calc(100%-2rem)] overflow-y-auto sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Pelanggan" : "Tambah Pelanggan"}</DialogTitle>
          <DialogDescription>
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
          className="flex flex-col gap-4"
        >
          {isEdit && customer && (
            <input type="hidden" name="id" value={customer.id} />
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nama Pelanggan</Label>
            <div className="relative">
              <HugeiconsIcon
                icon={UserIcon}
                strokeWidth={1.6}
                className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground"
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
                className="pl-8"
              />
            </div>
            {errors.name && (
              <p id="name-error" className="text-xs text-destructive">
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Nomor HP</Label>
              <div className="relative">
                <HugeiconsIcon
                  icon={CallIcon}
                  strokeWidth={1.6}
                  className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground"
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
                  className="pl-8"
                />
              </div>
              {errors.phone && (
                <p id="phone-error" className="text-xs text-destructive">
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="meter_number">Nomor Meter</Label>
              <div className="relative">
                <HugeiconsIcon
                  icon={GaugeIcon}
                  strokeWidth={1.6}
                  className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="meter_number"
                  name="meter_number"
                  maxLength={20}
                  value={values.meter_number}
                  onChange={(e) => update("meter_number", e.target.value)}
                  placeholder="cth. WM-003234"
                  autoComplete="off"
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">Alamat</Label>
            <div className="relative">
              <HugeiconsIcon
                icon={MapPinIcon}
                strokeWidth={1.6}
                className="pointer-events-none absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground"
              />
              <Textarea
                id="address"
                name="address"
                value={values.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="cth. Jl. Melati No.12, RT 03/RW 01"
                rows={2}
                autoComplete="off"
                className="pl-8"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="join_date">Tanggal Mulai</Label>
              <div className="relative">
                <HugeiconsIcon
                  icon={Calendar01Icon}
                  strokeWidth={1.6}
                  className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="join_date"
                  name="join_date"
                  type="date"
                  value={values.join_date}
                  onChange={(e) => update("join_date", e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <div className="grid grid-cols-2 gap-1 rounded-lg border border-input bg-background p-1">
                {(["active", "inactive"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => update("status", value)}
                    className={cn(
                      "flex h-7 cursor-pointer items-center justify-center gap-1.5 rounded-md text-sm transition-colors",
                      values.status === value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={value}
                      checked={values.status === value}
                      readOnly
                      className="sr-only"
                    />
                    {value === "active" ? "Aktif" : "Nonaktif"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={closeForm}>
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Perubahan belum disimpan</DialogTitle>
            <DialogDescription>
              Ada data yang belum tersimpan. Yakin ingin menutup form ini?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Lanjut Mengisi
            </Button>
            <Button variant="destructive" onClick={discardChanges}>
              Buang Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}