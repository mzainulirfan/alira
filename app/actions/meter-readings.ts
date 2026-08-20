"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { assertRole, verifySession } from "@/lib/auth/dal";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { getImageExtension, hasValidImageSignature } from "@/lib/image-upload";
import { METER_ROLES } from "@/lib/staff";
import { parseCustomerQrPayload } from "@/lib/customer-qr";
import { isValidPeriod, periodToDate } from "@/lib/period";
import {
  ensurePrivateBucket,
  removeStorageObjects,
} from "@/lib/storage";
import type { Bill, Customer, MeterReading } from "@/lib/types";

const METER_PHOTOS_BUCKET = "meter-photos";
const MAX_METER_PHOTO_SIZE = 5 * 1024 * 1024;

export type SaveReadingState = {
  error?: string;
  success?: boolean;
  usage?: number;
  next?: boolean;
  billUpdated?: boolean;
};

export type CancelReadingState = {
  error?: string;
  success?: boolean;
  billDeleted?: boolean;
};

export type ResolveMeterScanResult = {
  error?: string;
  customer?: Customer;
  reading?: MeterReading | null;
  previousReading?: number;
  billStatus?: Bill["status"] | null;
};

export async function resolveMeterScanAction(
  rawCode: string,
  period: string
): Promise<ResolveMeterScanResult> {
  await verifySession();
  const customerNumber = parseCustomerQrPayload(rawCode);
  if (!customerNumber) {
    return { error: "Kode bukan QR Alira atau formatnya tidak valid." };
  }
  if (!isValidPeriod(period)) {
    return { error: "Periode pencatatan tidak valid." };
  }

  const supabase = createSupabaseAdmin();
  const { data: customer, error: customerError } = await supabase
    .from("pam_customers")
    .select(
      "id, customer_number, name, phone, address, meter_number, join_date, status, created_at, updated_at"
    )
    .eq("customer_number", customerNumber)
    .maybeSingle();
  if (customerError) return { error: customerError.message };
  if (!customer) return { error: "Pelanggan dari kode ini tidak ditemukan." };
  if (customer.status !== "active") return { error: "Pelanggan ini sudah tidak aktif." };

  const periodDate = periodToDate(period);
  const [readingResult, previousResult, billResult] = await Promise.all([
    supabase
      .from("pam_meter_readings")
      .select(
        "id, customer_id, period, previous_reading, current_reading, usage, photo_path, recorded_by, recorded_at, created_at"
      )
      .eq("customer_id", customer.id)
      .eq("period", periodDate)
      .maybeSingle(),
    supabase
      .from("pam_meter_readings")
      .select("current_reading")
      .eq("customer_id", customer.id)
      .lt("period", periodDate)
      .order("period", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("pam_bills")
      .select("status")
      .eq("customer_id", customer.id)
      .eq("period", periodDate)
      .maybeSingle(),
  ]);

  const error = readingResult.error ?? previousResult.error ?? billResult.error;
  if (error) return { error: error.message };

  const reading = readingResult.data as MeterReading | null;

  return {
    customer: customer as Customer,
    reading: reading ?? null,
    previousReading: Number(previousResult.data?.current_reading ?? 0),
    billStatus: (billResult.data?.status as Bill["status"] | undefined) ?? null,
  };
}

export async function warmMeterScanAction(): Promise<void> {
  return;
}

export async function saveReadingAction(
  _prev: SaveReadingState | undefined,
  formData: FormData
): Promise<SaveReadingState> {
  const session = await assertRole(METER_ROLES);

  const customerId = formData.get("customer_id");
  const readingId = formData.get("reading_id");
  const period = formData.get("period");
  const currentReadingRaw = formData.get("current_reading");
  const photo = formData.get("photo");
  const revisionReason = formData.get("revision_reason");

  if (typeof customerId !== "string" || !customerId) {
    return { error: "Pelanggan tidak valid." };
  }
  if (!isValidPeriod(period)) {
    return { error: "Periode tidak valid." };
  }
  const isRevision = typeof readingId === "string" && readingId.length > 0;
  if (
    isRevision &&
    (typeof revisionReason !== "string" || revisionReason.trim().length < 3)
  ) {
    return { error: "Alasan revisi minimal 3 karakter." };
  }

  const currentReading = Number(currentReadingRaw);
  if (!Number.isFinite(currentReading) || currentReading < 0) {
    return { error: "Angka meter sekarang tidak valid." };
  }
  const next = formData.get("next") === "true";
  const hasNewPhoto = photo instanceof File && photo.size > 0;
  if (hasNewPhoto) {
    const extension = getImageExtension(photo.type);
    if (!extension) {
      return { error: "Foto meter harus berupa file JPEG, PNG, atau WebP." };
    }
    if (photo.size > MAX_METER_PHOTO_SIZE) {
      return { error: "Ukuran foto meter maksimal 5 MB." };
    }
    if (!(await hasValidImageSignature(photo))) {
      return { error: "Isi file foto meter tidak valid." };
    }
  }

  const supabase = createSupabaseAdmin();
  let uploadedPhotoPath: string | null = null;

  async function removeUploadedPhoto() {
    if (!uploadedPhotoPath) return;
    await removeStorageObjects(supabase, METER_PHOTOS_BUCKET, [uploadedPhotoPath]);
  }

  try {
    if (isRevision) {
      const { data: existingReading, error: readingError } = await supabase
        .from("pam_meter_readings")
        .select("id, customer_id, period")
        .eq("id", readingId)
        .maybeSingle();
      if (readingError) return { error: readingError.message };
      if (
        !existingReading ||
        existingReading.customer_id !== customerId ||
        existingReading.period !== periodToDate(period)
      ) {
        return { error: "Pencatatan meter tidak ditemukan." };
      }
    }

    let photoPath: string | null = null;
    if (hasNewPhoto) {
      await ensurePrivateBucket(supabase, METER_PHOTOS_BUCKET);
      uploadedPhotoPath =
        `${period}/${customerId}/${randomUUID()}.` +
        getImageExtension(photo.type);
      const { error: uploadError } = await supabase.storage
        .from(METER_PHOTOS_BUCKET)
        .upload(uploadedPhotoPath, photo, { upsert: false, contentType: photo.type });

      if (uploadError) {
        uploadedPhotoPath = null;
        return { error: `Gagal mengunggah foto: ${uploadError.message}` };
      }
      photoPath = uploadedPhotoPath;
    }

    if (isRevision) {
      const { data: tariff } = await supabase
        .from("pam_tariffs")
        .select("price_per_m3")
        .eq("is_active", true)
        .order("effective_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      const { data, error } = await supabase.rpc("pam_revise_meter_reading", {
        p_reading_id: readingId,
        p_current_reading: currentReading,
        p_photo_url: photoPath,
        p_replace_photo: hasNewPhoto,
        p_reason: (revisionReason as string).trim(),
        p_actor: session.userId,
        p_fallback_price_per_m3: tariff?.price_per_m3 ?? 0,
      });
      if (error) {
        await removeUploadedPhoto();
        return { error: error.message };
      }
      const result = data as {
        usage?: number;
        bill_updated?: boolean;
        previous_photo_path?: string | null;
      } | null;
      const committedPhotoPath = uploadedPhotoPath;
      uploadedPhotoPath = null;
      if (result?.previous_photo_path && committedPhotoPath) {
        await removeStorageObjects(
          supabase,
          METER_PHOTOS_BUCKET,
          [result.previous_photo_path]
        );
      }
      revalidatePath("/meter-readings");
      revalidatePath("/bills");
      revalidatePath("/dashboard");
      revalidatePath("/reports");
      revalidatePath(`/customers/${customerId}`);
      revalidateTag("meter-readings", "max");
      revalidateTag("bills", "max");
      return {
        success: true,
        usage: Number(result?.usage ?? 0),
        billUpdated: result?.bill_updated === true,
      };
    }

    const { data, error } = await supabase.rpc("pam_create_meter_reading", {
      p_customer_id: customerId,
      p_period: periodToDate(period),
      p_current_reading: currentReading,
      p_photo_url: photoPath,
      p_actor: session.userId,
    });

    if (error) {
      await removeUploadedPhoto();
      return { error: `Gagal menyimpan pencatatan: ${error.message}` };
    }
    const result = data as { usage?: number } | null;
    uploadedPhotoPath = null;
    revalidatePath("/meter-readings");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    revalidatePath(`/customers/${customerId}`);
    revalidateTag("meter-readings", "max");
    revalidateTag("bills", "max");
    return { success: true, usage: Number(result?.usage ?? 0), next };
  } catch (e) {
    await removeUploadedPhoto();
    return { error: e instanceof Error ? e.message : "Gagal menyimpan pencatatan." };
  }
}

export async function cancelReadingAction(
  _prev: CancelReadingState | undefined,
  formData: FormData
): Promise<CancelReadingState> {
  const session = await assertRole(METER_ROLES);
  const readingId = formData.get("reading_id");
  const reason = formData.get("reason");
  if (typeof readingId !== "string" || !readingId) {
    return { error: "Pencatatan meter tidak valid." };
  }
  if (typeof reason !== "string" || reason.trim().length < 3) {
    return { error: "Alasan pembatalan minimal 3 karakter." };
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.rpc("pam_cancel_meter_reading", {
    p_reading_id: readingId,
    p_reason: reason.trim(),
    p_actor: session.userId,
  });
  if (error) return { error: error.message };
  const result = data as {
    bill_deleted?: boolean;
    photo_path?: string | null;
  } | null;
  if (result?.photo_path) {
    await removeStorageObjects(supabase, METER_PHOTOS_BUCKET, [result.photo_path]);
  }

  revalidatePath("/meter-readings");
  revalidatePath("/bills");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidateTag("meter-readings", "max");
  revalidateTag("bills", "max");
  return { success: true, billDeleted: result?.bill_deleted === true };
}
