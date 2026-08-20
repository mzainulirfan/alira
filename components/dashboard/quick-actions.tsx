import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import type { QuickActionItem } from "./types";
import { cn } from "@/lib/utils";

const tileClass = [
  "bg-petrol text-white",
  "bg-aqua-light text-aqua",
  "bg-brass-light text-brass",
] as const;

const arrowFill = ["bg-petrol", "bg-aqua", "bg-brass"] as const;

export function QuickActions({ actions }: { actions: QuickActionItem[] }) {
  if (actions.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-2">
      {actions.map((action, index) => (
        <QuickActionCard key={action.key} action={action} index={index} />
      ))}
    </div>
  );
}

function QuickActionCard({
  action,
  index,
}: {
  action: QuickActionItem;
  index: number;
}) {
  const { href, icon, label, description } = action;
  const tile = tileClass[index % tileClass.length];
  const arrow = arrowFill[index % arrowFill.length];

  return (
    <Link
      href={href}
      className="group flex min-h-[110px] flex-col justify-between rounded-[14px] border border-line bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-petrol/30 hover:shadow-md active:scale-[0.98]"
    >
      <div>
        <div
          className={cn(
            "mb-2.5 flex size-8 items-center justify-center rounded-[9px]",
            tile
          )}
        >
          <HugeiconsIcon icon={icon} className="size-4" />
        </div>
        <p className="font-display text-[12.5px] font-bold text-petrol">{label}</p>
        <p className="text-[10.5px] leading-[14px] text-muted-text">{description}</p>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="font-mono text-[10px] text-muted-2">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          className={cn(
            "flex size-5 items-center justify-center rounded-md text-white transition-transform group-hover:translate-x-0.5",
            arrow
          )}
        >
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
        </span>
      </div>
    </Link>
  );
}