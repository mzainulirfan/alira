"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Edit01Icon,
  Key01Icon,
  PowerIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import {
  resetStaffPasscodeAction,
  saveStaffAction,
  setStaffStatusAction,
  unlockStaffAction,
  type StaffFormState,
} from "@/app/actions/staff";
import { SubPageHeader } from "@/components/layout/sub-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ConfirmationDialogHeader,
  ConfirmationDialogSummary,
} from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STAFF_ROLES, STAFF_ROLE_LABEL } from "@/lib/staff";
import type { StaffProfile } from "@/lib/types";

const noState: StaffFormState = {};

export function StaffClient({
  staff,
  currentUserId,
}: {
  staff: StaffProfile[];
  currentUserId: string;
}) {
  const activeCount = staff.filter((profile) => profile.status === "active").length;

  return (
    <div className="flex flex-col gap-4">
      <SubPageHeader
        title="Admin & Pegawai"
        description={`${activeCount} aktif dari ${staff.length} akun`}
        action={<StaffForm />}
      />

      <div className="flex flex-col gap-2">
        {staff.map((profile) => (
          <StaffCard
            key={profile.id}
            profile={profile}
            isCurrentUser={profile.id === currentUserId}
          />
        ))}
      </div>
    </div>
  );
}

function StaffCard({
  profile,
  isCurrentUser,
}: {
  profile: StaffProfile;
  isCurrentUser: boolean;
}) {
  const locked = profile.is_locked === true;

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 py-3">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <HugeiconsIcon icon={UserGroupIcon} size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-medium">{profile.name}</p>
              <Badge variant={profile.status === "active" ? "success" : "secondary"}>
                {profile.status === "active" ? "Aktif" : "Nonaktif"}
              </Badge>
              {locked && <Badge variant="warning">Terkunci</Badge>}
            </div>
            <p className="text-xs text-muted-foreground">
              @{profile.username} · {STAFF_ROLE_LABEL[profile.role]}
              {isCurrentUser ? " · Anda" : ""}
            </p>
            {profile.last_login_at && (
              <p className="text-xs text-muted-foreground">
                Login terakhir {formatDateTime(profile.last_login_at)}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <StaffForm profile={profile} />
          <ResetPasscode profile={profile} />
          {locked && <UnlockStaff id={profile.id} />}
          {!isCurrentUser && (
            <StaffStatusButton
              profile={profile}
              nextStatus={profile.status === "active" ? "inactive" : "active"}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StaffForm({ profile }: { profile?: StaffProfile }) {
  const isEdit = !!profile;
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(saveStaffAction, noState);
  const [lastState, setLastState] = useState(state);

  if (state !== lastState) {
    setLastState(state);
    if (state?.success) setOpen(false);
  }

  useEffect(() => {
    if (state?.success) toast.success(isEdit ? "Pegawai diperbarui." : "Pegawai ditambahkan.");
    else if (state?.error) toast.error(state.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant={isEdit ? "ghost" : "default"}
            size={isEdit ? "sm" : "default"}
          />
        }
      >
        <HugeiconsIcon icon={isEdit ? Edit01Icon : Add01Icon} />
        {isEdit ? "Edit" : "Tambah Pegawai"}
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100%-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Pegawai" : "Tambah Pegawai"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          {profile && <input type="hidden" name="id" value={profile.id} />}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`staff-name-${profile?.id ?? "new"}`}>Nama</Label>
            <Input
              id={`staff-name-${profile?.id ?? "new"}`}
              name="name"
              defaultValue={profile?.name ?? ""}
              className="h-10"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`staff-username-${profile?.id ?? "new"}`}>Username</Label>
            <Input
              id={`staff-username-${profile?.id ?? "new"}`}
              name="username"
              defaultValue={profile?.username ?? ""}
              autoCapitalize="none"
              spellCheck={false}
              className="h-10"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`staff-role-${profile?.id ?? "new"}`}>Role</Label>
            <select
              id={`staff-role-${profile?.id ?? "new"}`}
              name="role"
              defaultValue={profile?.role ?? "meter_reader"}
              className="h-10 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {STAFF_ROLES.map((role) => (
                <option key={role.key} value={role.key}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {!isEdit && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="staff-passcode">Passcode Sementara</Label>
                <Input
                  id="staff-passcode"
                  name="passcode"
                  type="password"
                  inputMode="numeric"
                  minLength={6}
                  maxLength={6}
                  pattern="[0-9]{6}"
                  className="h-10"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="staff-confirm-passcode">Konfirmasi</Label>
                <Input
                  id="staff-confirm-passcode"
                  name="confirm_passcode"
                  type="password"
                  inputMode="numeric"
                  minLength={6}
                  maxLength={6}
                  pattern="[0-9]{6}"
                  className="h-10"
                  required
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ResetPasscode({ profile }: { profile: StaffProfile }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    resetStaffPasscodeAction,
    noState
  );
  const [lastState, setLastState] = useState(state);

  if (state !== lastState) {
    setLastState(state);
    if (state?.success) setOpen(false);
  }

  useEffect(() => {
    if (state?.success) toast.success("Passcode sementara dibuat.");
    else if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>
        <HugeiconsIcon icon={Key01Icon} />
        Reset Passcode
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
         <ConfirmationDialogHeader
           icon={Key01Icon}
           tone="warning"
           title="Reset Passcode?"
           description={`${profile.name} harus mengganti passcode sementara saat login berikutnya.`}
         />
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={profile.id} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`reset-passcode-${profile.id}`}>Passcode Sementara</Label>
            <Input
              id={`reset-passcode-${profile.id}`}
              name="passcode"
              type="password"
              inputMode="numeric"
              minLength={6}
              maxLength={6}
              pattern="[0-9]{6}"
              className="h-10"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`reset-confirm-${profile.id}`}>Konfirmasi Passcode</Label>
            <Input
              id={`reset-confirm-${profile.id}`}
              name="confirm_passcode"
              type="password"
              inputMode="numeric"
              minLength={6}
              maxLength={6}
              pattern="[0-9]{6}"
              className="h-10"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Menyimpan..." : "Reset Passcode"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StaffStatusButton({
  profile,
  nextStatus,
}: {
  profile: StaffProfile;
  nextStatus: "active" | "inactive";
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <form
        ref={formRef}
        action={async (formData) => {
          try {
            await setStaffStatusAction(formData);
            toast.success(
              nextStatus === "active" ? "Pegawai diaktifkan." : "Pegawai dinonaktifkan."
            );
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal mengubah status.");
          }
        }}
      >
        <input type="hidden" name="id" value={profile.id} />
        <input type="hidden" name="status" value={nextStatus} />
      </form>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <HugeiconsIcon icon={PowerIcon} />
        {nextStatus === "active" ? "Aktifkan" : "Nonaktifkan"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
           <ConfirmationDialogHeader
             icon={PowerIcon}
             tone={nextStatus === "active" ? "success" : "destructive"}
             title={`${nextStatus === "active" ? "Aktifkan" : "Nonaktifkan"} akun?`}
             description={
               nextStatus === "active"
                 ? "Pegawai dapat kembali masuk dan menggunakan aplikasi."
                 : "Pegawai tidak dapat masuk sampai akun diaktifkan kembali."
             }
           />
           <ConfirmationDialogSummary>
             <p className="font-medium">{profile.name}</p>
             <p className="mt-1 text-xs text-muted-foreground">
               {profile.username} · {STAFF_ROLE_LABEL[profile.role]}
             </p>
           </ConfirmationDialogSummary>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button
              variant={nextStatus === "inactive" ? "destructive" : "default"}
              onClick={() => {
                setOpen(false);
                formRef.current?.requestSubmit();
              }}
            >
              Konfirmasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function UnlockStaff({ id }: { id: string }) {
  return (
    <form
      action={async (formData) => {
        try {
          await unlockStaffAction(formData);
          toast.success("Akun dibuka kembali.");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Gagal membuka akun.");
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="outline" size="sm">
        Buka Kunci
      </Button>
    </form>
  );
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
