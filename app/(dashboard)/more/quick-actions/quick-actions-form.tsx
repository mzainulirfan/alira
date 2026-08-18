"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons";
import { updateQuickActionsAction, type SettingsFormState } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  QUICK_ACTIONS,
  QUICK_ACTION_BY_KEY,
  type QuickActionKey,
} from "@/lib/quick-actions";

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
    <form action={formAction} className="flex flex-col gap-4">
      <input
        type="hidden"
        name="quick_actions"
        value={JSON.stringify(selected)}
      />

      <Card>
        <CardContent className="flex flex-col divide-y p-0">
          {orderedActions.map((action) => {
            const enabled = selected.includes(action.key);
            const index = selected.indexOf(action.key);

            return (
              <div key={action.key} className="flex items-center gap-3 px-3 py-3">
                <div
                  className={
                    enabled
                      ? "flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                      : "flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
                  }
                >
                  <HugeiconsIcon icon={action.icon} size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{action.label}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>

                {enabled && (
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={index === 0}
                      title="Naikkan urutan"
                      onClick={() => moveAction(action.key, -1)}
                    >
                      <HugeiconsIcon icon={ArrowUp01Icon} />
                      <span className="sr-only">Naikkan {action.label}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={index === selected.length - 1}
                      title="Turunkan urutan"
                      onClick={() => moveAction(action.key, 1)}
                    >
                      <HugeiconsIcon icon={ArrowDown01Icon} />
                      <span className="sr-only">Turunkan {action.label}</span>
                    </Button>
                  </div>
                )}

                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => toggleAction(action.key)}
                  aria-label={`${enabled ? "Nonaktifkan" : "Aktifkan"} ${action.label}`}
                  className="size-4 shrink-0 accent-primary"
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Menyimpan..." : `Simpan ${selected.length} Quick Action`}
      </Button>
    </form>
  );
}
