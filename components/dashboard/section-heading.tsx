import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  linkLabel,
  linkHref,
  className,
}: {
  title: string;
  linkLabel?: string;
  linkHref?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-2.5 flex items-center justify-between", className)}>
      <h3 className="flex items-center gap-2 font-display text-[15px] font-bold text-petrol">
        <span className="inline-block h-[15px] w-1 rounded-[2px] bg-brass" />
        {title}
      </h3>
      {linkLabel && linkHref && (
        <Link
          href={linkHref}
          className="flex items-center gap-0.5 font-mono text-[11.5px] font-semibold text-muted-text hover:text-petrol"
        >
          {linkLabel.toUpperCase()}
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
        </Link>
      )}
    </div>
  );
}