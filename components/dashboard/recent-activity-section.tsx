import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  BanknoteIcon,
  Tap01Icon,
  UserAdd01Icon,
  BanknoteArrowUpIcon,
  InboxIcon,
} from "@hugeicons/core-free-icons";
import type { ActivityItem } from "./types";
import { SectionHeading } from "./section-heading";
import { cn } from "@/lib/utils";

export const activityIcons: Record<ActivityItem["type"], IconSvgElement> = {
  payment: BanknoteIcon,
  reading: Tap01Icon,
  customer: UserAdd01Icon,
  expense: BanknoteArrowUpIcon,
};

const dotClass: Record<ActivityItem["type"], string> = {
  payment: "bg-aqua text-white",
  reading: "bg-brass text-white",
  customer: "bg-petrol text-white",
  expense: "bg-coral text-white",
};

export function RecentActivitySection({
  activities,
  viewAllHref = "/more",
}: {
  activities: ActivityItem[];
  viewAllHref?: string;
}) {
  return (
    <section className="flex flex-col">
      <SectionHeading title="Aktivitas Terbaru" linkLabel="Lihat Semua" linkHref={viewAllHref} />
      <div className="rounded-[14px] border border-line bg-card px-4 py-3">
        {activities.length === 0 ? (
          <EmptyActivity />
        ) : (
          <ol className="relative flex flex-col">
            {activities.map((activity, index) => (
              <li
                key={activity.id}
                className={cn(
                  "relative flex gap-3 pb-1",
                  index !== activities.length - 1 && "mb-1"
                )}
              >
                {index !== activities.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute top-5 bottom-0 left-[11px] w-px border-l border-dashed border-line"
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 flex size-[23px] shrink-0 items-center justify-center rounded-full",
                    dotClass[activity.type]
                  )}
                >
                  <HugeiconsIcon icon={activityIcons[activity.type]} className="size-3" />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="truncate text-[13px] font-semibold text-petrol">
                    {activity.title}
                  </p>
                  <p className="truncate text-[11.5px] text-muted-2">
                    {activity.description}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-0.5 pt-0.5">
                  {activity.badge && (
                    <span className="rounded-full bg-green-light px-2 py-0.5 font-mono text-[9.5px] font-bold tracking-wide text-green">
                      {activity.badge.toUpperCase()}
                    </span>
                  )}
                  <span className="font-mono text-[10.5px] text-muted-2">
                    {formatActivityTime(activity.time)}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function EmptyActivity() {
  return (
    <div className="flex flex-col items-center gap-1.5 px-2 py-6 text-center">
      <span className="flex size-10 items-center justify-center rounded-xl bg-aqua-light text-aqua">
        <HugeiconsIcon icon={InboxIcon} className="size-5" />
      </span>
      <p className="text-sm font-semibold text-petrol">Belum ada aktivitas</p>
      <p className="text-xs text-muted-2">Aktivitas terbaru akan muncul di sini.</p>
    </div>
  );
}

export function formatActivityTime(value: string): string {
  const date = new Date(value);
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((startOfDay - startOfDate) / 86400000);

  if (diffDays === 0)
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "KEMARIN";
  return date
    .toLocaleDateString("id-ID", { day: "numeric", month: "short" })
    .toUpperCase();
}