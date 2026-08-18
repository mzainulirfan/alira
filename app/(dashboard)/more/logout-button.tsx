"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logout01Icon } from "@hugeicons/core-free-icons";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function LogoutButton() {
  const [open, setOpen] = useState(false);

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
        <DialogHeader>
          <DialogTitle>Keluar dari Alira?</DialogTitle>
          <DialogDescription>
            Anda perlu memasukkan passcode untuk masuk kembali.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <form action={logoutAction}>
            <Button type="submit" variant="destructive">
              Keluar
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
