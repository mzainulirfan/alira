"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Edit01Icon,
  Delete01Icon,
  PowerIcon,
  Coins01Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  saveTariffAction,
  setTariffActiveAction,
  deleteTariffAction,
  type TariffFormState,
} from "@/app/actions/settings";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Tariff } from "@/lib/types";

const noState: TariffFormState = {};

export function TariffList({ tariffs }: { tariffs: Tariff[] }) {
  const activeTariff = tariffs.find((t) => t.is_active) ?? null;
  const inactiveTariffs = tariffs.filter((t) => !t.is_active);

  return (
    <div className="flex flex-col gap-3">
      {tariffs.length === 0 ? (
        <EmptyTariffState />
      ) : (
        <div className="flex flex-col gap-3">
          {activeTariff && <TariffCard tariff={activeTariff} hasActive />}
          {inactiveTariffs.map((t) => (
            <TariffCard key={t.id} tariff={t} hasActive={!!activeTariff} />
          ))}
        </div>
      )}
    </div>
  );
}

function TariffCard({
  tariff,
  hasActive,
}: {
  tariff: Tariff;
  hasActive: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
            <HugeiconsIcon icon={Coins01Icon} size={20} className="text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium">{tariff.name}</p>
              <Badge
                variant={tariff.is_active ? "success" : "secondary"}
                className="shrink-0"
              >
                {tariff.is_active ? "Aktif" : "Nonaktif"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(tariff.price_per_m3)} / m³
              {tariff.monthly_fee > 0 &&
                ` · Abonemen ${formatCurrency(tariff.monthly_fee)}`}
              {tariff.effective_date &&
                ` · Berlaku ${formatDate(tariff.effective_date)}`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t pt-2">
          <TariffForm tariff={tariff} />
          <ToggleTariff tariff={tariff} hasActive={hasActive} />
          <DeleteTariff tariff={tariff} isActive={tariff.is_active} />
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyTariffState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <HugeiconsIcon icon={Coins01Icon} size={24} className="text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-medium">Belum ada tarif</p>
          <p className="text-sm text-muted-foreground">
            Tambahkan tarif pertama agar tagihan dapat dibuat.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function TariffForm({ tariff }: { tariff?: Tariff }) {
  const isEdit = !!tariff;
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [state, formAction, pending] = useActionState(saveTariffAction, noState);
  const [lastState, setLastState] = useState(state);
  const [values, setValues] = useState({
    name: tariff?.name ?? "",
    price_per_m3: tariff ? String(tariff.price_per_m3) : "",
    monthly_fee: tariff ? String(tariff.monthly_fee) : "",
    effective_date: tariff?.effective_date ?? "",
    is_active: tariff ? tariff.is_active : true,
  });
  const [original, setOriginal] = useState(() => ({
    name: tariff?.name ?? "",
    price_per_m3: tariff ? String(tariff.price_per_m3) : "",
    monthly_fee: tariff ? String(tariff.monthly_fee) : "",
    effective_date: tariff?.effective_date ?? "",
    is_active: tariff ? tariff.is_active : true,
  }));
  const [errors, setErrors] = useState<{
    name?: string;
    price_per_m3?: string;
    monthly_fee?: string;
  }>({});

  const dirty =
    values.name !== original.name ||
    values.price_per_m3 !== original.price_per_m3 ||
    values.monthly_fee !== original.monthly_fee ||
    values.effective_date !== original.effective_date ||
    values.is_active !== original.is_active;

  if (state !== lastState) {
    setLastState(state);
    if (state?.success) setOpen(false);
  }

  useEffect(() => {
    if (state?.success) toast.success(isEdit ? "Tarif diperbarui." : "Tarif ditambahkan.");
    else if (state?.error) toast.error(state.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function update<K extends keyof typeof values>(
    key: K,
    value: (typeof values)[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (key === "name" || key === "price_per_m3" || key === "monthly_fee") {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!values.name.trim()) next.name = "Nama tarif wajib diisi.";
    const price = Number(values.price_per_m3);
    if (values.price_per_m3 === "" || !Number.isFinite(price) || price < 0) {
      next.price_per_m3 = "Tarif per m³ harus berupa angka ≥ 0.";
    }
    const fee = Number(values.monthly_fee);
    if (values.monthly_fee === "" || !Number.isFinite(fee) || fee < 0) {
      next.monthly_fee = "Abonemen harus berupa angka ≥ 0.";
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
      const reset = {
        name: tariff?.name ?? "",
        price_per_m3: tariff ? String(tariff.price_per_m3) : "",
        monthly_fee: tariff ? String(tariff.monthly_fee) : "",
        effective_date: tariff?.effective_date ?? "",
        is_active: tariff ? tariff.is_active : true,
      };
      setValues(reset);
      setOriginal(reset);
      setErrors({});
      setConfirmOpen(false);
      setOpen(true);
    } else {
      closeForm();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant={isEdit ? "outline" : "default"} size={isEdit ? "sm" : "default"} />}>
        {isEdit ? (
          <>
            <HugeiconsIcon icon={Edit01Icon} />
            Edit
          </>
        ) : (
          <>
            <HugeiconsIcon icon={Add01Icon} />
            Tambah Tarif
          </>
        )}
      </DialogTrigger>
      <DialogContent
        initialFocus={() => nameRef.current}
        className="max-h-[calc(100%-2rem)] overflow-y-auto sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Tarif" : "Tambah Tarif"}</DialogTitle>
        </DialogHeader>
        <form
          ref={formRef}
          action={formAction}
          onSubmit={(e) => {
            if (!validate()) e.preventDefault();
          }}
          className="flex flex-col gap-4"
        >
          {isEdit && <input type="hidden" name="id" value={tariff.id} />}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nama Tarif</Label>
            <Input
              ref={nameRef}
              id="name"
              name="name"
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="cth. Tarif Reguler"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "tariff-name-error" : undefined}
            />
            {errors.name && (
              <p id="tariff-name-error" className="text-xs text-destructive">
                {errors.name}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="price_per_m3">Tarif per m³ (Rp)</Label>
              <Input
                id="price_per_m3"
                name="price_per_m3"
                type="number"
                inputMode="numeric"
                min={0}
                step="any"
                value={values.price_per_m3}
                onChange={(e) => update("price_per_m3", e.target.value)}
                placeholder="cth. 3000"
                aria-invalid={!!errors.price_per_m3}
                aria-describedby={
                  errors.price_per_m3 ? "tariff-price-error" : undefined
                }
              />
              {errors.price_per_m3 && (
                <p id="tariff-price-error" className="text-xs text-destructive">
                  {errors.price_per_m3}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="monthly_fee">Abonemen (Rp)</Label>
              <Input
                id="monthly_fee"
                name="monthly_fee"
                type="number"
                inputMode="numeric"
                min={0}
                step="any"
                value={values.monthly_fee}
                onChange={(e) => update("monthly_fee", e.target.value)}
                placeholder="cth. 10000"
                aria-invalid={!!errors.monthly_fee}
                aria-describedby={
                  errors.monthly_fee ? "tariff-fee-error" : undefined
                }
              />
              {errors.monthly_fee && (
                <p id="tariff-fee-error" className="text-xs text-destructive">
                  {errors.monthly_fee}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="effective_date">Tanggal Berlaku (opsional)</Label>
            <Input
              id="effective_date"
              name="effective_date"
              type="date"
              value={values.effective_date}
              onChange={(e) => update("effective_date", e.target.value)}
            />
          </div>
          {isEdit && tariff.is_active && (
            <input type="hidden" name="is_active" value="true" />
          )}
          {(!isEdit || !tariff.is_active) && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="is_active"
                value="true"
                checked={values.is_active}
                onChange={(e) => update("is_active", e.target.checked)}
                className="size-4 accent-primary"
              />
              Jadikan tarif aktif
            </label>
          )}
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={closeForm}>
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Tarif"}
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

function ToggleTariff({
  tariff,
  hasActive,
}: {
  tariff: Tariff;
  hasActive: boolean;
}) {
  const isActive = tariff.is_active;
  const needsConfirm = !isActive && hasActive;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit() {
    formRef.current?.requestSubmit();
  }

  return (
    <>
      <form
        ref={formRef}
        action={async (formData) => {
          await setTariffActiveAction(formData);
          toast.success(
            isActive ? "Tarif dinonaktifkan." : "Tarif diaktifkan."
          );
        }}
      >
        <input type="hidden" name="id" value={tariff.id} />
        <input type="hidden" name="is_active" value={String(!isActive)} />
      </form>
      <Button
        type="button"
        variant={isActive ? "outline" : "ghost"}
        size="sm"
        onClick={() => (needsConfirm ? setConfirmOpen(true) : handleSubmit())}
      >
        <HugeiconsIcon icon={PowerIcon} />
        {isActive ? "Nonaktifkan" : "Aktifkan"}
      </Button>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Jadikan tarif ini aktif?</DialogTitle>
            <DialogDescription>
              Tarif aktif saat ini akan dinonaktifkan dan digantikan oleh &quot;
              {tariff.name}&quot;.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>Ya, Aktifkan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DeleteTariff({
  tariff,
  isActive,
}: {
  tariff: Tariff;
  isActive: boolean;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit() {
    formRef.current?.requestSubmit();
  }

  return (
    <>
      <form
        ref={formRef}
        action={async (formData) => {
          await deleteTariffAction(formData);
          toast.success("Tarif dihapus.");
        }}
      >
        <input type="hidden" name="id" value={tariff.id} />
      </form>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isActive}
        title={isActive ? "Nonaktifkan tarif dulu sebelum menghapus" : "Hapus tarif"}
        onClick={() => setConfirmOpen(true)}
      >
        <HugeiconsIcon icon={Delete01Icon} />
        Hapus
      </Button>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus tarif &quot;{tariff.name}&quot;?</DialogTitle>
            <DialogDescription>
              Tarif tidak dapat dikembalikan setelah dihapus.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleSubmit}>
              Hapus Tarif
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}