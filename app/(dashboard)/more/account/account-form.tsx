"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Logout01Icon } from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/actions/auth";

export function AccountForm() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Keluar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Anda akan diminta memasukkan passcode untuk masuk kembali.
          </p>
          <form action={logoutAction}>
            <Button type="submit" variant="destructive">
              <HugeiconsIcon icon={Logout01Icon} />
              Keluar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}