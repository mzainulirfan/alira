import type { ReactNode } from "react";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const toneStyles = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/10 text-destructive",
} as const;

export function ConfirmationDialogHeader({
  icon,
  title,
  description,
  tone = "default",
}: {
  icon: IconSvgElement;
  title: ReactNode;
  description: ReactNode;
  tone?: keyof typeof toneStyles;
}) {
  return (
    <div data-confirmation-dialog className="flex items-start gap-3 pr-6">
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full",
          toneStyles[tone]
        )}
      >
        <HugeiconsIcon icon={icon} className="size-5" />
      </div>
      <DialogHeader className="min-w-0 gap-1 pt-0.5 text-left">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
    </div>
  );
}

export function ConfirmationDialogSummary({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border bg-muted/40 p-3 text-sm", className)}>
      {children}
    </div>
  );
}
