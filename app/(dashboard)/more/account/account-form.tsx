"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Key01Icon } from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { STAFF_ROLE_LABEL } from "@/lib/staff";
import type { StaffProfile } from "@/lib/types";
import { LogoutButton } from "../logout-button";

export function AccountForm({ profile }: { profile: StaffProfile }) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{profile.name}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Username</p>
            <p className="font-medium">{profile.username}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Role</p>
            <p className="font-medium">{STAFF_ROLE_LABEL[profile.role]}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Keamanan</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button variant="outline" render={<Link href="/more/security" />}>
            <HugeiconsIcon icon={Key01Icon} />
            Ganti Passcode
          </Button>
          <LogoutButton />
        </CardContent>
      </Card>
    </div>
  );
}
