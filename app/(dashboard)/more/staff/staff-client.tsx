"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Edit01Icon,
  Key01Icon,
  PowerIcon,
  UserGroupIcon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons";
import {
  resetStaffPasscodeAction,
  saveStaffAction,
  setStaffStatusAction,
  unlockStaffAction,
  type StaffFormState,
} from "@/app/actions/staff";
import { Button } from "@/components/ui/button";
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
import type { StaffRole } from "@/lib/types";
import type { StaffProfile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/dashboard/section-heading";

const noState: StaffFormState = {};

const ROLE_COLORS: Record<StaffRole, string> = {
  admin: "bg-aqua-light text-aqua",
  treasurer: "bg-brass-light text-brass",
  meter_reader: "bg-info/15 text-info",
};

export function StaffClient({
  staff,
  currentUserId,
}: {
  staff: StaffProfile[];
  currentUserId: string;
}) {
  const activeCount = staff.filter((profile) => profile.status === "active").length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-3">
        <Link
          href="/more"
          className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-aqua-light text-aqua transition-colors hover:bg-aqua/80"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} />
        </Link>
        <div>
          <h1 className="font-display text-[26px] font-bold leading-[32px] text-petrol sm:text-[30px] sm:leading-[38px]">
            Admin & Pegawai
          </h1>
          <p className="mt-0.5 text-[12.5px] font-medium text-muted-text">
            {activeCount} aktif dari {staff.length} akun
          </p>
        </div>
        <StaffForm />
      </div>

      <section className="flex flex-col">
        <SectionHeading title="Daftar Akun" />
        {staff.length === 0 ? (
          <EmptyStaffState />
        ) : (
          <div className="flex flex-col gap-3">
            {staff.map((profile) => (
              <StaffCard
                key={profile.id}
                profile={profile}
                isCurrentUser={profile.id === currentUserId}
              />
            ))}
          </div>
        )}
      </section>
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
  const isActive = profile.status === "active";

  return (
    <div className="group relative overflow-hidden rounded-[14px] border border-line bg-card py-4 pr-3 pl-4 transition-all hover:-translate-y-0.5 hover:border-petrol/30 hover:shadow-md">
      <span
        className={cn(
          "absolute top-0 bottom-0 left-0 w-1",
          isActive ? "bg-aqua" : "bg-muted"
        )}
      />
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 border-t border-dashed border-line"
      />
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 border-t border-dashed border-line"
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-[10px]",
              ROLE_COLORS[profile.role]
            )}
          >
            <HugeiconsIcon icon={UserGroupIcon} size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-display text-[15px] font-semibold text-petrol">
                {profile.name}
              </p>
              {isCurrentUser && (
                <span className="shrink-0 rounded-full bg-aqua-light px-2 py-0.5 font-mono text-[10px] font-bold text-aqua">
                  ANDA
                </span>
              )}
            </div>
            <p className="mt-0.5 flex items-center gap-1 font-mono text-[11px] text-muted-2">
              @{profile.username}
              <span className="text-line">·</span>
              {STAFF_ROLE_LABEL[profile.role]}
            </p>
            {profile.last_login_at && (
              <p className="mt-0.5 font-mono text-[10px] text-muted-2">
                Login terakhir: {formatDateTime(profile.last_login_at)}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <StaffForm profile={profile} />
          <ResetPasscode profile={profile} />
          {locked && <UnlockStaff id={profile.id} />}
          {!isCurrentUser && (
            <StaffStatusButton
              profile={profile}
              nextStatus={isActive ? "inactive" : "active"}
            />
          )}
        </div>
      </div>

      <div className="relative mt-3 flex flex-wrap items-center gap-2 border-t border-dashed border-line pt-3">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-mono text-[10px] font-bold",
            isActive ? "bg-aqua-light text-aqua" : "bg-muted text-muted-2"
          )}
        >
          {isActive ? "AKTIF" : "NONAKTIF"}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-mono text-[10px] font-bold",
            ROLE_COLORS[profile.role]
          )}
        >
          {STAFF_ROLE_LABEL[profile.role].toUpperCase()}
        </span>
        {locked && (
          <span className="rounded-full bg-destructive/10 px-2 py-0.5 font-mono text-[10px] font-bold text-destructive">
            TERKUNCI
          </span>
        )}
      </div>
    </div>
  );
}

function EmptyStaffState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-line bg-card py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-[12px] bg-muted text-muted-2">
        <HugeiconsIcon icon={UserGroupIcon} size={24} />
      </div>
      <div>
        <p className="font-display text-[15px] font-bold text-petrol">
          Belum ada pegawai
        </p>
        <p className="text-[13px] text-muted-2">
          Tambahkan pegawai pertama untuk mengelola aplikasi.
        </p>
      </div>
    </div>
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
            className={isEdit ? "h-8 px-2" : ""}
          />
        }
      >
        {isEdit ? (
          <>
            <HugeiconsIcon icon={Edit01Icon} />
            Edit
          </>
        ) : (
          <>
            <HugeiconsIcon icon={Add01Icon} />
            Tambah
          </>
        )}
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
              className="h-10 rounded-[10px] border border-line bg-card px-3 text-sm outline-none focus-visible:border-aqua focus-visible:ring-3 focus-visible:ring-aqua/20"
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

          <DialogFooter className="pt-2">
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
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-muted-text hover:text-brass"
          />
        }
      >
        <HugeiconsIcon icon={Key01Icon} className="size-4" />
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
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 px-2",
          nextStatus === "active"
            ? "text-aqua hover:bg-aqua-light"
            : "text-muted-text hover:text-destructive"
        )}
        onClick={() => setOpen(true)}
      >
        <HugeiconsIcon icon={PowerIcon} className="size-4" />
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
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-aqua hover:bg-aqua-light"
      >
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
