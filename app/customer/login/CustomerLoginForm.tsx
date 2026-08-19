"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { loginCustomerAction } from "@/app/actions/customer-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const DIGIT_COUNT = 6;

export function CustomerLoginForm() {
  const [state, action, pending] = useActionState(loginCustomerAction, { error: "" });
  const [customerNumber, setCustomerNumber] = useState("");
  const [digits, setDigits] = useState<string[]>(() => Array(DIGIT_COUNT).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [lastState, setLastState] = useState(state);
  const hasError = Boolean(state?.error);

  if (state !== lastState) {
    setLastState(state);
    if (state?.error) {
      setDigits(Array(DIGIT_COUNT).fill(""));
    }
  }

  useEffect(() => {
    if (state?.error) {
      inputRefs.current[0]?.focus();
    }
  }, [state?.error]);

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < DIGIT_COUNT - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index] === "" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < DIGIT_COUNT - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const text = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, DIGIT_COUNT);
    const next = Array(DIGIT_COUNT).fill("");
    for (let i = 0; i < text.length; i++) {
      next[i] = text[i];
    }
    setDigits(next);
    inputRefs.current[Math.min(text.length, DIGIT_COUNT - 1)]?.focus();
  }

  return (
    <form action={action} className="flex w-full flex-col gap-4">
      <input type="hidden" name="customer_number" value={customerNumber} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="customer_number">Nomor Pelanggan</Label>
        <Input
          id="customer_number"
          name="customer_number"
          value={customerNumber}
          onChange={(event) => setCustomerNumber(event.target.value.toUpperCase())}
          placeholder="PAM-XXXXXX"
          autoComplete="username"
          autoCapitalize="characters"
          spellCheck={false}
          className="h-11"
          disabled={pending}
          autoFocus
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label id="passcode-label" htmlFor="passcode">Passcode</Label>
        <div
          role="group"
          aria-labelledby="passcode-label"
          className="flex w-full gap-2"
        >
          {digits.map((digit, i) => (
            <input
              key={i}
              id={i === 0 ? "passcode" : undefined}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              aria-label={`Digit ${i + 1}`}
              aria-invalid={hasError}
              aria-describedby={hasError ? "login-error" : undefined}
              disabled={pending}
              className={cn(
                "h-14 w-full min-w-0 flex-1 rounded-md border border-input bg-transparent text-center text-xl font-semibold text-foreground outline-none transition-colors",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                hasError && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
              )}
            />
          ))}
        </div>

        {hasError && (
          <p id="login-error" className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" disabled={pending} className="h-12 w-full">
        {pending ? "Memeriksa..." : "Masuk"}
      </Button>
    </form>
  );
}