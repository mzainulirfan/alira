"use client";

import { useActionState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { LockPasswordIcon, DropletIcon } from "@hugeicons/core-free-icons";
import { loginAction, type LoginState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="passcode">Passcode</Label>
        <Input
          id="passcode"
          name="passcode"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          placeholder="Masukkan 6 digit passcode"
          className="h-11 text-center text-lg tracking-[0.5em]"
          maxLength={6}
          required
          autoFocus
        />
      </div>

      {state?.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="h-11 w-full gap-2">
        <HugeiconsIcon icon={LockPasswordIcon} size={18} />
        {pending ? "Memeriksa..." : "Masuk"}
      </Button>

      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <HugeiconsIcon icon={DropletIcon} size={14} />
        <span>Dikelola oleh pengurus PAM setempat</span>
      </div>
    </form>
  );
}