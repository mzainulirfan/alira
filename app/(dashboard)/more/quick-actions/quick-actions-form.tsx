"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons";
import { updateQuickActionsAction, type SettingsFormState } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import {
  QUICK_ACTIONS,
  QUICK_ACTION_BY_KEY,
  type QuickActionKey,
} from "@/lib/quick-actions";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { cn } from "@/lib/utils";

const noState: SettingsFormState = {};

export function QuickActionsForm({
  initialActions,
}: {
  initialActions: QuickActionKey[];
}) {
  const [selected, setSelected] = useState(initialActions);
  const [state, formAction, pending] = useActionState(
    updateQuickActionsAction,
    noState
  );

  useEffect(() => {
    if (state?.success) toast.success("Quick Action tersimpan.");
    else if (state?.error) toast.error(state.error);
  }, [state]);

  const orderedActions = [
    ...selected.map((key) => QUICK_ACTION_BY_KEY[key]),
    ...QUICK_ACTIONS.filter((action) => !selected.includes(action.key)),
  ];

  function toggleAction(key: QuickActionKey) {
    if (selected.includes(key)) {
      if (selected.length === 1) {
        toast.error("Minimal satu Quick Action harus aktif.");
        return;
      }
      setSelected((current) => current.filter((item) => item !== key));
      return;
    }

    if (selected.length >= 3) {
      toast.error("Maksimal 3 Quick Action dapat ditampilkan.");
      return;
    }
    setSelected((current) => [...current, key]);
  }

  function moveAction(key: QuickActionKey, direction: -1 | 1) {
    setSelected((current) => {
      const index = current.indexOf(key);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;

      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-3">
        <Link href="/more" className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-aqua-light text-aqua transition-colors hover:bg-aqua/80">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} />
        </Link>
        <div>
          <h1 className="font-display text-[26px] font-bold leading-[32px] text-petrol sm:text-[30px] sm:leading-[38px]">
            Quick Action
          </h1>
          <p className="mt-0.5 text-[12.5px] font-medium text-muted-text">
            Pilih dan urutkan maksimal 3 pintasan di Dashboard
          </p>
        </div>
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        <input type="hidden" name="quick_actions" value={JSON.stringify(selected)} />

        <section className="flex flex-col">
          <SectionHeading title="Daftar Quick Action" />
          <div className="rounded-[14px] border border-line bg-card divide-y divide-dashed divide-line">
            {orderedActions.map((action) => {
              const enabled = selected.includes(action.key);
              const index = selected.indexOf(action.key);

              return (
                <div key={action.key} className="group relative flex items-center gap-3 overflow-hidden rounded-[14px] bg-transparent py-3.5 pr-3 pl-4 transition-all hover:-translate-y-0.5 hover:bg-petrol/3 hover:shadow-md">
                  <span className="absolute top-0 bottom-0 left-0 w-1 bg-brass" />
                  <span aria-hidden className="absolute inset-x-0 top-0 border-t border-dashed border-line" />
                  <span aria-hidden className="absolute inset-x-0 bottom-0 border-t border-dashed border-line" />
                  <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-[10px]", enabled ? "bg-brass-light text-brass" : "bg-muted text-muted-2")}>
                    <HugeiconsIcon icon={action.icon} size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-[13.5px] font-semibold text-petrol">{action.label}</p>
                    <p className="truncate font-mono text-[11px] text-muted-2">{action.description}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {enabled && (
                      <div className="flex items-center gap-1">
                        <Button type="button" variant="ghost" size="icon-sm" disabled={index === 0} title="Naikkan urutan" onClick={() => moveAction(action.key, -1)} className="rounded-[8px] text-brass hover:bg-brass-light">
                          <HugeiconsIcon icon={ArrowUp01Icon} />
                        </Button>
                        <Button type="button" variant="ghost" size="icon-sm" disabled={index === selected.length - 1} title="Turunkan urutan" onClick={() => moveAction(action.key, 1)} className="rounded-[8px] text-brass hover:bg-brass-light">
                          <HugeiconsIcon icon={ArrowDown01Icon} />
                        </Button>
                      </div>
                    )}
                    <input type="checkbox" checked={enabled} onChange={() => toggleAction(action.key)} aria-label={`${enabled ? "Nonaktifkan" : "Aktifkan"} ${action.label}`} className="size-4 shrink-0 accent-primary" />
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-paper text-muted-2 transition-all group-hover:bg-petrol group-hover:text-white">
                      <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <Button type="submit" disabled={pending} className="rounded-[10px] bg-petrol font-display text-[14px] font-semibold text-white hover:bg-petrol-2 w-full">
          {pending ? "Menyimpan..." : `Simpan ${selected.length} Quick Action`}
        </Button>
      </form>
    </div>
  );
}