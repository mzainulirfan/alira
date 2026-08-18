"use client";

import { useActionState, useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const initialState: LoginState = {};
const DIGIT_COUNT = 6;

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);
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

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
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

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
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
      <input type="hidden" name="passcode" value={digits.join("")} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="passcode">Passcode</Label>
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
              autoFocus={i === 0}
              aria-label={`Digit ${i + 1}`}
              aria-invalid={hasError}
              aria-describedby={hasError ? "login-error" : undefined}
              disabled={pending}
              className={cn(
                "h-14 w-full min-w-0 flex-1 rounded-xl border border-input bg-transparent text-center text-xl font-semibold text-foreground outline-none transition-colors",
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