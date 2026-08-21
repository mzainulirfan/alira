"use client";

import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Calendar01Icon,
  Camera01Icon,
} from "@hugeicons/core-free-icons";
import { formatDate, formatMeter, formatShortPeriod } from "@/lib/format";
import { SectionHeading } from "@/components/dashboard/section-heading";
import type { MeterReading } from "@/lib/types";

export default function MeterReadingDetailClient({
  reading,
}: {
  reading: MeterReading;
}) {
  const router = useRouter();
  const hasPhoto = Boolean(reading.photo_url);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <div className="flex items-end justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push("/customer/meter-readings")}
          className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-aqua-light text-aqua transition-colors hover:bg-aqua/80"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} />
        </button>
        <div>
          <h1 className="font-display text-[26px] font-bold leading-[32px] text-petrol sm:text-[30px] sm:leading-[38px]">
            Detail Meter
          </h1>
          <p className="mt-0.5 text-[12.5px] font-medium text-muted-text">
            {formatShortPeriod(reading.period)}
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[18px] bg-gradient-to-br from-petrol via-petrol-2 to-[#0b2e34] p-5 sm:p-6">
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
        <div className="relative z-10 flex flex-col gap-3">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-aqua">
            <span className="size-1.5 rounded-full bg-aqua" />
            Pencatatan Meter
          </span>
          <div className="flex items-center gap-3">
            <p className="font-mono text-[28px] font-bold text-white">
              {formatMeter(reading.current_reading)}
            </p>
            <span className="shrink-0 rounded-full bg-green-light px-2 py-0.5 font-mono text-[9.5px] font-bold text-green">
              TERCATAT
            </span>
          </div>
          <p className="max-w-[78%] text-[12.5px] leading-relaxed text-[#b9d4d0]">
            {hasPhoto ? "Pencatatan dengan foto" : "Pencatatan tanpa foto"}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10.5px] text-[#b9d4d0]">
            <span className="flex items-center gap-1.5">
              <HugeiconsIcon icon={Calendar01Icon} className="size-3.5" />
              {formatShortPeriod(reading.period)}
            </span>
            {reading.recorded_at && (
              <span className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Calendar01Icon} className="size-3.5" />
                Dicatat {formatDate(reading.recorded_at)}
              </span>
            )}
          </div>
        </div>
      </div>

      <section className="flex flex-col">
        <SectionHeading title="Pencatatan Meter" />
        <div className="rounded-[14px] border border-line bg-card p-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <MeterValue label="Sebelumnya" value={reading.previous_reading} />
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4 rotate-180 text-muted-2" />
            <MeterValue label="Sekarang" value={reading.current_reading} align="right" />
          </div>
          <div className="mt-3 flex items-end justify-between border-t border-dashed border-line pt-3">
            <span className="font-mono text-[10.5px] text-muted-2">Pemakaian</span>
            <span className="font-mono text-[18px] font-bold text-petrol">{formatMeter(reading.usage)} m³</span>
          </div>
          {hasPhoto && (
            <a
              href={reading.photo_url!}
              target="_blank"
              rel="noreferrer"
              className="group relative mt-3 block overflow-hidden rounded-[12px] border border-line"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={reading.photo_url!}
                alt={`Foto meter ${formatShortPeriod(reading.period)}`}
                loading="lazy"
                decoding="async"
                className="h-28 w-full object-cover transition-transform group-hover:scale-[1.02]"
              />
              <span className="absolute right-2 bottom-2 flex items-center gap-1 rounded-md bg-background/90 px-2 py-1 text-[11px] font-medium shadow-sm">
                <HugeiconsIcon icon={Camera01Icon} className="size-3.5" />
                Lihat Foto
              </span>
            </a>
          )}
        </div>
      </section>

      <section className="flex flex-col">
        <SectionHeading title="Informasi Pencatatan" />
        <div className="rounded-[14px] border border-line bg-card p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {reading.recorded_by && (
              <DetailValue label="Petugas" value={reading.recorded_by} />
            )}
            <DetailValue
              label="Status"
              value={hasPhoto ? "Dengan Foto" : "Tanpa Foto"}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function MeterValue({
  label,
  value,
  align = "left",
}: {
  label: string;
  value: number;
  align?: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : undefined}>
      <p className="font-mono text-[10.5px] text-muted-2">{label}</p>
      <p className="mt-0.5 font-mono text-[18px] font-semibold text-petrol">{formatMeter(value)}</p>
    </div>
  );
}

function DetailValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] bg-paper/80 p-3">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-text">{label}</p>
      <p className="mt-0.5 font-display text-[13px] font-semibold text-petrol">{value}</p>
    </div>
  );
}
