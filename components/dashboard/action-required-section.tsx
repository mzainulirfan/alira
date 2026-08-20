import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { SectionHeading } from "./section-heading";
import { cn } from "@/lib/utils";

export type ActionRequiredItem = {
  label: string;
  value: number;
  href: string;
  tone: "warning" | "destructive";
};

export function ActionRequiredSection({
  items,
  linkHref = "/more",
}: {
  items: ActionRequiredItem[];
  linkHref?: string;
}) {
  return (
    <div className="flex flex-col">
      <SectionHeading title="Perlu Tindakan" linkLabel="Lihat Semua" linkHref={linkHref} />
      <div className="flex flex-col gap-3">
        {items.length === 0 ? (
          <div className="flex items-center gap-2.5 rounded-[14px] border border-dashed border-line bg-card px-4 py-4">
            <span className="flex size-7 items-center justify-center rounded-full bg-green-light">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-green" />
            </span>
            <p className="text-[13px] text-muted-text">Semua beres, tidak ada tindakan yang perlu diambil.</p>
          </div>
        ) : (
          items.map((item) => <Ticket key={item.label} {...item} />)
        )}
      </div>
    </div>
  );
}

function Ticket({ label, value, href, tone }: ActionRequiredItem) {
  return (
    <Link
      href={href}
      className="group relative flex items-center gap-3 overflow-hidden rounded-[14px] border border-line bg-card py-3.5 pr-3 pl-4 transition-all hover:-translate-y-0.5 hover:border-brass/40 hover:shadow-md"
    >
      <span className="absolute top-0 bottom-0 left-0 w-1 bg-brass" />
      <span className="absolute top-1/2 left-1.5 size-[5px] -translate-y-1/2 rounded-full bg-brass-light" />
      <span className="absolute bottom-1.5 left-1.5 size-[5px] rounded-full bg-brass-light" />
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 border-t border-dashed border-line"
      />
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 border-t border-dashed border-line"
      />
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-semibold text-petrol">{label}</p>
          <p className="text-[11px] text-muted-2">Perlu perhatian Anda</p>
        </div>
        <span
          className={cn(
            "flex h-9 min-w-9 items-center justify-center rounded-full px-2 font-mono text-[13px] font-bold",
            tone === "destructive" ? "bg-coral-light text-coral" : "bg-brass-light text-brass"
          )}
        >
          {value}
        </span>
      </div>
    </Link>
  );
}