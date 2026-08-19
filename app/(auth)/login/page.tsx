import type { Metadata } from "next";
import { HugeiconsIcon } from "@hugeicons/react";
import { DropletIcon } from "@hugeicons/core-free-icons";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Masuk",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-background px-4 pt-16 md:pt-24">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HugeiconsIcon icon={DropletIcon} size={26} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-medium text-foreground">Alira</span>
            <p className="text-sm text-muted-foreground">
              Kelola air, meter, dan tagihan dalam satu tempat.
            </p>
          </div>
        </div>

        <section className="mt-8 flex flex-col rounded-lg border border-border bg-card p-6">
          <h1 className="text-xl font-medium text-foreground">Masuk ke Alira</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Masukkan username dan passcode 6 digit.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </section>
      </div>

      <footer className="mx-auto w-full max-w-sm py-6 text-center text-xs text-muted-foreground">
        Dikelola oleh pengurus PAM setempat
      </footer>
    </main>
  );
}
