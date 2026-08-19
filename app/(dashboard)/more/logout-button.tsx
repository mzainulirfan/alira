"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logout01Icon } from "@hugeicons/core-free-icons";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmationDialogHeader } from "@/components/ui/confirmation-dialog";

export function LogoutButton() {
  const [open, setOpen] = useState(false);

  async function clearCachesAndLogout() {
    try {
      if ("caches" in window) {
        const names = await caches.keys();
        await Promise.all(
          names
            .filter((name) => name.startsWith("alira-"))
            .map((name) => caches.delete(name))
        );
      }
    } finally {
      await logoutAction();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          />
        }
      >
        <HugeiconsIcon icon={Logout01Icon} />
        Keluar
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
         <ConfirmationDialogHeader
           icon={Logout01Icon}
           tone="warning"
           title="Keluar dari Alira?"
           description="Sesi Anda akan diakhiri dan passcode diperlukan untuk masuk kembali."
         />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
           <form action={clearCachesAndLogout} className="w-full sm:w-auto">
             <Button type="submit" variant="destructive" className="w-full">
              Keluar
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
