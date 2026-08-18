"use client";

import { useActionState, useEffect, useRef, useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Camera01Icon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  saveReadingAction,
  type SaveReadingState,
} from "@/app/actions/meter-readings";
import { formatCurrency, formatMeter } from "@/lib/format";
import type { Customer, MeterReading, Tariff } from "@/lib/types";

const initialState: SaveReadingState = {};

export function ReadingForm({
  customer,
  period,
  reading,
  previousReading,
  tariff,
  trigger,
  nextCustomerId,
}: {
  customer: Customer;
  period: string;
  reading?: MeterReading | null;
  previousReading: number;
  tariff: Tariff | null;
  trigger?: ReactElement;
  nextCustomerId?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [current, setCurrent] = useState(
    reading ? String(reading.current_reading) : ""
  );
  const [original, setOriginal] = useState(
    reading ? String(reading.current_reading) : ""
  );
  const [photoName, setPhotoName] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const [state, formAction, pending] = useActionState(
    saveReadingAction,
    initialState
  );
  const [lastState, setLastState] = useState(state);

  const currentNum = Number(current);
  const usage =
    Number.isFinite(currentNum) && currentNum >= previousReading
      ? currentNum - previousReading
      : null;

  const estimatedWater =
    usage !== null && tariff ? usage * tariff.price_per_m3 : null;
  const estimatedTotal =
    estimatedWater !== null && tariff
      ? Math.round(estimatedWater + tariff.monthly_fee)
      : null;

  const dirty = current !== original || photoName !== null;

  if (state !== lastState) {
    setLastState(state);
    if (state?.success) {
      setOpen(false);
    }
  }

  useEffect(() => {
    if (state?.success) {
      toast.success(
        `Pencatatan tersimpan. Pemakaian ${formatMeter(state.usage ?? 0)}.`
      );
      router.refresh();
      if (state.next && nextCustomerId) {
        window.dispatchEvent(
          new CustomEvent("alira:open-reading", { detail: nextCustomerId })
        );
      }
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router, nextCustomerId]);

  useEffect(() => {
    function handleOpenReading(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail === customer.id) {
        const resetValue = reading ? String(reading.current_reading) : "";
        setCurrent(resetValue);
        setOriginal(resetValue);
        setPhotoName(null);
        if (photoRef.current) photoRef.current.value = "";
        setConfirmOpen(false);
        setOpen(true);
      }
    }
    window.addEventListener("alira:open-reading", handleOpenReading);
    return () =>
      window.removeEventListener("alira:open-reading", handleOpenReading);
  }, [customer.id, reading]);

  function closeForm() {
    if (dirty) {
      setConfirmOpen(true);
    } else {
      setOpen(false);
    }
  }

  function discardChanges() {
    setCurrent(original);
    setPhotoName(null);
    if (photoRef.current) photoRef.current.value = "";
    setConfirmOpen(false);
    setOpen(false);
  }

  function handleOpenChange(next: boolean) {
    if (next) {
      const resetValue = reading ? String(reading.current_reading) : "";
      setCurrent(resetValue);
      setOriginal(resetValue);
      setPhotoName(null);
      if (photoRef.current) photoRef.current.value = "";
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
            <Button
              size={reading ? "sm" : "default"}
              variant={reading ? "ghost" : "default"}
            />
          )
        }
      >
        {reading ? "Ubah" : "Catat Meter"}
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100%-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Catat Meter</DialogTitle>
          <DialogDescription>
            {customer.name} · {customer.customer_number} ·{" "}
            {customer.meter_number ? `Meter ${customer.meter_number}` : "Tanpa nomor meter"}
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="customer_id" value={customer.id} />
          <input type="hidden" name="period" value={period} />
          <input type="hidden" name="previous_reading" value={previousReading} />

          <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Meter sebelumnya: </span>
            <span className="font-medium">{formatMeter(previousReading)}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="current_reading">Meter sekarang</Label>
            <Input
              id="current_reading"
              name="current_reading"
              type="number"
              inputMode="numeric"
              min={previousReading}
              step="any"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="cth. 1265"
              autoFocus
              required
            />
            {currentNum < previousReading && (
              <p className="text-xs text-destructive">
                Meter sekarang tidak boleh lebih kecil dari meter sebelumnya.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Pemakaian</span>
            <span className="font-semibold">
              {usage !== null ? formatMeter(usage) : "—"}
            </span>
          </div>

          {estimatedTotal !== null ? (
            <div className="flex flex-col gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tarif air</span>
                <span>
                  {formatCurrency(Math.round(estimatedWater ?? 0))}
                  <span className="text-muted-foreground">
                    {" "}
                    × {usage} m³
                  </span>
                </span>
              </div>
              {tariff && tariff.monthly_fee > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Abonemen</span>
                  <span>{formatCurrency(tariff.monthly_fee)}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-primary/15 pt-2 text-sm">
                <span className="font-medium">Perkiraan tagihan</span>
                <span className="text-base font-semibold text-primary">
                  {formatCurrency(estimatedTotal)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Menggunakan tarif aktif saat ini. Jatuh tempo & tagihan final
                dibuat saat generate tagihan.
              </p>
            </div>
          ) : tariff === null ? (
            <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
              Belum ada tarif aktif. Atur tarif di Pengaturan agar perkiraan
              tagihan dapat dihitung.
            </p>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="photo">Foto meter (opsional)</Label>
            <input
              ref={photoRef}
              id="photo"
              name="photo"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) =>
                setPhotoName(e.target.files?.[0]?.name ?? null)
              }
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => photoRef.current?.click()}
            >
              <HugeiconsIcon icon={Camera01Icon} />
              {photoName ? photoName : "Ambil Foto"}
            </Button>
            {reading?.photo_url && (
              <p className="text-xs text-muted-foreground">
                Foto lama akan diganti jika mengunggah foto baru.
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeForm}>
              Batal
            </Button>
            {reading ? (
              <Button type="submit" disabled={pending || usage === null}>
                {pending
                  ? "Menyimpan..."
                  : "Simpan Perubahan"}
              </Button>
            ) : (
              <>
                <Button type="submit" variant="outline" disabled={pending || usage === null}>
                  Simpan
                </Button>
                <Button
                  type="submit"
                  name="next"
                  value="true"
                  disabled={pending || usage === null || !nextCustomerId}
                >
                  {pending ? "Menyimpan..." : "Simpan & Lanjut"}
                </Button>
              </>
            )}
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

export function ReadingStatusBadge({ reading }: { reading?: MeterReading | null }) {
  return reading ? (
    <Badge variant="success">
      <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-3" />
      Sudah Dicatat
    </Badge>
  ) : (
    <Badge variant="warning">Belum Dicatat</Badge>
  );
}