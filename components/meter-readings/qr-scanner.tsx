"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Camera01Icon,
  CheckmarkCircle01Icon,
  Image01Icon,
  ReloadIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import {
  resolveMeterScanAction,
  warmMeterScanAction,
  type ResolveMeterScanResult,
} from "@/app/actions/meter-readings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMeter, formatShortPeriod } from "@/lib/format";

type ScannerControls = { stop: () => void };
type CameraStatus = "idle" | "starting" | "active" | "error";

function isRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

function getCameraErrorMessage(error: unknown): string {
  if (!window.isSecureContext) {
    return "Kamera hanya tersedia melalui HTTPS atau localhost. Buka aplikasi dari alamat HTTPS.";
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    return "Browser ini tidak mendukung akses kamera. Gunakan browser terbaru atau pilih foto QR.";
  }

  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Izin kamera ditolak. Izinkan kamera pada pengaturan situs browser, lalu coba lagi.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "Kamera tidak ditemukan pada perangkat ini. Anda tetap dapat memilih foto QR.";
  }
  if (name === "NotReadableError" || name === "TrackStartError" || name === "AbortError") {
    return "Kamera sedang digunakan aplikasi lain atau gagal dimulai. Tutup aplikasi kamera lain, lalu coba lagi.";
  }
  if (name === "OverconstrainedError" || name === "ConstraintNotSatisfiedError") {
    return "Konfigurasi kamera belakang tidak didukung perangkat ini. Coba lagi untuk memakai kamera yang tersedia.";
  }
  return "Kamera gagal dimulai. Coba lagi atau gunakan foto QR dari perangkat.";
}

export function QrScanner({
  period,
  canEdit,
}: {
  period: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const controlsRef = useRef<ScannerControls | null>(null);
  const scanLockedRef = useRef(false);
  const requestGenerationRef = useRef(0);
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<ResolveMeterScanResult | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const [resolving, setResolving] = useState(false);
  const [restartKey, setRestartKey] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [decodedCode, setDecodedCode] = useState<string | null>(null);

  function handleVideoRef(element: HTMLVideoElement | null) {
    videoRef.current = element;
    setVideoReady(Boolean(element));
  }

  useEffect(() => {
    if (!open || result || !videoReady || !videoRef.current) return;

    let disposed = false;
    const video = videoRef.current;
    const generation = requestGenerationRef.current;

    async function requestStream(relaxed: boolean): Promise<MediaStream> {
      try {
        return await navigator.mediaDevices.getUserMedia(
          relaxed
            ? { audio: false, video: true }
            : {
                audio: false,
                video: {
                  facingMode: { ideal: "environment" },
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                },
              }
        );
      } catch (error) {
        const name = error instanceof DOMException ? error.name : "";
        if (
          !relaxed &&
          (name === "OverconstrainedError" || name === "ConstraintNotSatisfiedError")
        ) {
          return requestStream(true);
        }
        throw error;
      }
    }

    async function waitForVideoDimensions() {
      if (video.videoWidth > 0 && video.videoHeight > 0) return;
      await new Promise<void>((resolve, reject) => {
        const startedAt = Date.now();
        const interval = window.setInterval(() => {
          if (disposed || requestGenerationRef.current !== generation) {
            window.clearInterval(interval);
            return;
          }
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            window.clearInterval(interval);
            resolve();
          } else if (Date.now() - startedAt > 8000) {
            window.clearInterval(interval);
            reject(new DOMException("Video kamera tidak menerima frame.", "TimeoutError"));
          }
        }, 120);
      });
    }

    async function startScanner() {
      try {
        setCameraStatus("starting");
        if (!window.isSecureContext) throw new DOMException("Insecure context", "SecurityError");
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new DOMException("Camera API unavailable", "NotSupportedError");
        }

        const { BrowserQRCodeReader } = await import("@zxing/browser");
        const reader = new BrowserQRCodeReader();
        const onScan = (
          scanResult: { getText: () => string } | undefined,
          _error: unknown,
          callbackControls: ScannerControls
        ) => {
          if (
            !scanResult ||
            scanLockedRef.current ||
            requestGenerationRef.current !== generation
          ) {
            return;
          }
          scanLockedRef.current = true;
          setDecodedCode(scanResult.getText());
          callbackControls.stop();
          void resolveCode(scanResult.getText(), generation);
        };

        const stream = await requestStream(false);
        if (disposed || requestGenerationRef.current !== generation) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        video.srcObject = stream;
        await video.play().catch(() => undefined);
        await waitForVideoDimensions();
        if (disposed || requestGenerationRef.current !== generation) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const controls = await reader.decodeFromStream(stream, video, onScan);
        if (disposed || requestGenerationRef.current !== generation) controls.stop();
        else {
          controlsRef.current = controls;
          setCameraStatus("active");
        }
      } catch (error) {
        console.error("Gagal membuka kamera QR:", error);
        if (!disposed && requestGenerationRef.current === generation) {
          setCameraStatus("error");
          setCameraError(getCameraErrorMessage(error));
        }
      }
    }

    void startScanner();
    return () => {
      disposed = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
      video.srcObject = null;
    };
    // resolveCode intentionally uses the current period from this render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, result, restartKey, videoReady]);

  async function resolveCode(
    rawCode: string,
    generation: number = requestGenerationRef.current
  ) {
    setResolving(true);
    let resolved = false;
    try {
      const nextResult = await resolveMeterScanAction(rawCode, period);
      if (requestGenerationRef.current !== generation) return;
      setResult(nextResult);
      resolved = true;
    } catch (error) {
      if (isRedirectError(error)) return;
      console.error("Gagal memeriksa hasil scan QR:", error);
      if (requestGenerationRef.current === generation) {
        setCameraStatus("error");
        setCameraError(
          "Kode berhasil dibaca, tetapi data pelanggan gagal diperiksa. Periksa koneksi lalu coba lagi."
        );
      }
    } finally {
      if (requestGenerationRef.current === generation) {
        setResolving(false);
        if (!resolved) scanLockedRef.current = false;
      }
    }
  }

  async function scanImage(file: File) {
    const generation = ++requestGenerationRef.current;
    controlsRef.current?.stop();
    controlsRef.current = null;
    scanLockedRef.current = true;
    setCameraStatus("idle");
    setCameraError(null);
    setResolving(true);

    const imageUrl = URL.createObjectURL(file);
    let rawCode: string;
    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const reader = new BrowserQRCodeReader();
      const scanResult = await reader.decodeFromImageUrl(imageUrl);
      rawCode = scanResult.getText();
    } catch (error) {
      console.error("Gagal membaca foto QR:", error);
      if (requestGenerationRef.current === generation) {
        scanLockedRef.current = false;
        setCameraStatus("error");
        setCameraError(
          "QR tidak ditemukan pada foto. Pastikan kode terlihat utuh, terang, dan tidak buram."
        );
        setResolving(false);
      }
      return;
    } finally {
      URL.revokeObjectURL(imageUrl);
    }

    if (requestGenerationRef.current !== generation) return;
    setDecodedCode(rawCode);
    await resolveCode(rawCode, generation);
  }

  function handleOpenChange(next: boolean) {
    requestGenerationRef.current += 1;
    setOpen(next);
    setResolving(false);
    if (next) {
      scanLockedRef.current = false;
      setResult(null);
      setManualCode("");
      setCameraError(null);
      setDecodedCode(null);
      setCameraStatus("idle");
      void warmMeterScanAction().catch(() => undefined);
    } else {
      setCameraStatus("idle");
    }
  }

  function scanAgain() {
    requestGenerationRef.current += 1;
    scanLockedRef.current = false;
    setResult(null);
    setCameraError(null);
    setDecodedCode(null);
    setCameraStatus("idle");
    setRestartKey((value) => value + 1);
  }

  function retryCamera() {
    requestGenerationRef.current += 1;
    controlsRef.current?.stop();
    controlsRef.current = null;
    scanLockedRef.current = false;
    setResolving(false);
    setCameraError(null);
    setDecodedCode(null);
    setCameraStatus("idle");
    setRestartKey((value) => value + 1);
  }

  function openReading() {
    if (!result?.customer) return;
    const params = new URLSearchParams();
    params.set("period", period);
    params.set("status", "all");
    params.set("q", result.customer.customer_number);
    params.set("open", result.customer.id);
    setOpen(false);
    router.push(`/meter-readings?${params.toString()}`);
  }

  const customer = result?.customer;
  const isInactive = customer?.status === "inactive";
  const isLocked = result?.billStatus === "paid";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" />}>
        <HugeiconsIcon icon={Camera01Icon} />
        Scan Kode
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100%-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Pelanggan</DialogTitle>
          <DialogDescription>
            Arahkan kamera ke QR Alira yang terpasang pada meter pelanggan.
          </DialogDescription>
        </DialogHeader>

        {!result && (
          <>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-dark">
              <video
                ref={handleVideoRef}
                autoPlay
                muted
                playsInline
                className="size-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="size-44 rounded-2xl border-2 border-white/90 shadow-[0_0_0_999px_rgba(0,0,0,0.28)]" />
              </div>
              {(resolving ||
                cameraStatus === "starting" ||
                (cameraStatus === "active" && !decodedCode)) && (
                <div className="absolute inset-x-3 bottom-3 flex flex-col items-center gap-1 rounded-lg bg-background/90 px-3 py-2 text-center text-xs font-medium">
                  <span>
                    {resolving
                      ? decodedCode
                        ? `Memeriksa pelanggan ${decodedCode}...`
                        : "Memeriksa pelanggan..."
                      : cameraStatus === "active"
                        ? "Memindai... arahkan kamera ke kode QR."
                        : "Menyiapkan kamera..."}
                  </span>
                </div>
              )}

              {!resolving && cameraStatus === "active" && decodedCode && (
                <div className="pointer-events-none absolute inset-x-3 top-3 rounded-lg bg-success/90 px-3 py-1.5 text-center text-xs font-medium text-white">
                  <span className="break-all">{decodedCode}</span>
                </div>
              )}
            </div>

            {cameraError && (
              <div className="flex flex-col gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-3 text-xs text-warning">
                <p>{cameraError}</p>
                <Button type="button" size="sm" variant="outline" onClick={retryCamera}>
                  <HugeiconsIcon icon={ReloadIcon} />
                  Coba Kamera Lagi
                </Button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void scanImage(file);
              }}
            />
            <Button
              type="button"
              variant="outline"
              disabled={resolving}
              onClick={() => fileInputRef.current?.click()}
            >
              <HugeiconsIcon icon={Image01Icon} />
              Ambil atau Pilih Foto QR
            </Button>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (!manualCode.trim() || resolving) return;
                const generation = ++requestGenerationRef.current;
                scanLockedRef.current = true;
                controlsRef.current?.stop();
                controlsRef.current = null;
                setCameraError(null);
                setCameraStatus("idle");
                void resolveCode(manualCode, generation);
              }}
              className="flex flex-col gap-2 border-t pt-4"
            >
              <Label htmlFor="manual-customer-code">Atau masukkan nomor pelanggan</Label>
              <div className="flex gap-2">
                <Input
                  id="manual-customer-code"
                  value={manualCode}
                  onChange={(event) => setManualCode(event.target.value.toUpperCase())}
                  placeholder="PAM-000123"
                  autoComplete="off"
                />
                <Button type="submit" variant="outline" disabled={resolving}>
                  <HugeiconsIcon icon={Search01Icon} />
                  Cari
                </Button>
              </div>
            </form>
          </>
        )}

        {result?.error && (
          <div className="flex flex-col gap-3 text-center">
            <div className="rounded-md border border-destructive/20 bg-destructive/5 px-4 py-5">
              <p className="font-medium">Kode tidak dapat digunakan</p>
              <p className="mt-1 text-sm text-muted-foreground">{result.error}</p>
            </div>
            <Button variant="outline" onClick={scanAgain}>
              Scan Ulang
            </Button>
          </div>
        )}

        {customer && (
          <div className="flex flex-col gap-4" aria-live="polite">
            <div className="rounded-md border bg-muted/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-success">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4" />
                    <span className="text-xs font-medium">Pelanggan ditemukan</span>
                  </div>
                  <p className="mt-2 truncate text-lg font-medium">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {customer.customer_number}
                  </p>
                </div>
                <Badge variant={isInactive ? "secondary" : "success"}>
                  {isInactive ? "Nonaktif" : "Aktif"}
                </Badge>
              </div>
              <div className="mt-4 grid gap-2 border-t pt-3 text-sm sm:grid-cols-2">
                {decodedCode && (
                  <div className="sm:col-span-2">
                    <ResultValue label="Kode QR terbaca" value={decodedCode} />
                  </div>
                )}
                <ResultValue label="Periode" value={formatShortPeriod(period)} />
                <ResultValue
                  label="Nomor meter"
                  value={customer.meter_number ?? "Belum diatur"}
                />
                {customer.address && (
                  <div className="sm:col-span-2">
                    <ResultValue label="Alamat" value={customer.address} />
                  </div>
                )}
                {result.reading && (
                  <ResultValue
                    label="Meter tercatat"
                    value={formatMeter(result.reading.current_reading)}
                  />
                )}
              </div>
            </div>

            {isInactive && (
              <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
                Pelanggan nonaktif tidak dapat melakukan pencatatan meter.
              </p>
            )}
            {isLocked && (
              <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                Pencatatan terkunci karena tagihan periode ini sudah dibayar.
              </p>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={scanAgain}>
                Scan Ulang
              </Button>
              {!canEdit || isInactive || isLocked ? (
                <Button render={<Link href={`/customers/${customer.id}`} />}>
                  Lihat Pelanggan
                </Button>
              ) : (
                <Button onClick={openReading}>
                  {result.reading ? "Ubah Pencatatan" : "Catat Meter"}
                </Button>
              )}
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ResultValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium break-words">{value}</p>
    </div>
  );
}
