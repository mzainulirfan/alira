import type { Metadata } from "next";
import { HugeiconsIcon } from "@hugeicons/react";
import { DropletIcon } from "@hugeicons/core-free-icons";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Masuk",
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <HugeiconsIcon icon={DropletIcon} size={32} />
          </div>
          <h1 className="text-2xl font-medium">Alira</h1>
          <p className="text-sm text-muted-foreground">
            Kelola air, meter, dan tagihan dalam satu tempat.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}