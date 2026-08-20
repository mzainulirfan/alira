import type { Metadata } from "next";
import { HugeiconsIcon } from "@hugeicons/react";
import { DropletIcon } from "@hugeicons/core-free-icons";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Masuk",
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-paper px-4 pt-14 md:pt-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage: "radial-gradient(rgba(14,59,67,0.06) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
          maskImage: "linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.15))",
          WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.15))",
        }}
      />
      <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full border-[1.5px] border-aqua/25">
        <div className="absolute inset-[30px] rounded-full border border-dashed border-brass/30" />
      </div>
      <div className="pointer-events-none absolute -bottom-32 -left-28 size-80 rounded-full border-[1.5px] border-aqua/15" />

      <div className="relative mx-auto flex w-full max-w-sm flex-1 flex-col">
        <div className="flex items-center justify-center gap-2.5">
          <div className="flex size-10 items-center justify-center rounded-[12px] bg-petrol text-aqua">
            <HugeiconsIcon icon={DropletIcon} size={22} />
          </div>
          <span className="font-display text-[22px] font-bold tracking-[-0.01em] text-petrol">
            Alira
            <span className="ml-1 align-middle font-display text-[15px] font-semibold uppercase tracking-[0.02em] text-brass">
              AJA
            </span>
          </span>
        </div>
        <p className="mt-2 text-center font-mono text-[11px] tracking-[0.02em] text-muted-text">
          KELOLA AIR · METER · TAGIHAN
        </p>

        <section className="mt-8 flex flex-col rounded-[18px] border border-line bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_rgba(14,59,67,0.06)]">
          <div className="flex items-center gap-2">
            <span className="inline-block h-[16px] w-1 rounded-[2px] bg-brass" />
            <h1 className="font-display text-[19px] font-bold text-petrol">
              Masuk ke Alira
            </h1>
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-text">
            Masukkan username (petugas) atau nomor pelanggan dan passcode 6 digit.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </section>
      </div>

      <footer className="relative mx-auto w-full max-w-sm py-6 text-center font-mono text-[10.5px] text-muted-2">
        DIKELOLA OLEH PENGURUS PAM SETEMPAT
      </footer>
    </main>
  );
}