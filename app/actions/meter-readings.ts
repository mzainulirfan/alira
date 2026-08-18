"use server";

import { revalidatePath } from "next/cache";
import { assertRole } from "@/lib/auth/dal";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { METER_ROLES } from "@/lib/staff";

const METER_PHOTOS_BUCKET = "meter-photos";

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

async function ensureBucket(supabase: ReturnType<typeof createSupabaseAdmin>) {
  const { data } = await supabase.storage.getBucket(METER_PHOTOS_BUCKET);
  if (data) return;

  const { error } = await supabase.storage.createBucket(METER_PHOTOS_BUCKET, {
    public: true,
  });
  if (error) throw new Error(`Gagal menyiapkan penyimpanan foto: ${error.message}`);
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
  const previousReadingRaw = formData.get("previous_reading");
  const photo = formData.get("photo");
  const revisionReason = formData.get("revision_reason");

  if (typeof customerId !== "string" || !customerId) {
    return { error: "Pelanggan tidak valid." };
  }
  if (typeof period !== "string" || !/^\d{4}-\d{2}$/.test(period)) {
    return { error: "Periode tidak valid." };
  }
  const isRevision = typeof readingId === "string" && readingId.length > 0;
  if (
    isRevision &&
    (typeof revisionReason !== "string" || revisionReason.trim().length < 3)
  ) {
    return { error: "Alasan revisi minimal 3 karakter." };
  }

  const previousReading = Number(previousReadingRaw);
  const currentReading = Number(currentReadingRaw);
  if (!Number.isFinite(currentReading) || currentReading < 0) {
    return { error: "Angka meter sekarang tidak valid." };
  }
  if (currentReading < previousReading) {
    return {
      error:
        "Meter sekarang tidak boleh lebih kecil dari meter sebelumnya (" +
        previousReading +
        ").",
    };
  }

  const usage = currentReading - previousReading;
  const next = formData.get("next") === "true";
  const supabase = createSupabaseAdmin();

  try {
    if (isRevision) {
      const { data: existingReading, error: readingError } = await supabase
        .from("pam_meter_readings")
        .select("id, customer_id, period, previous_reading")
        .eq("id", readingId)
        .maybeSingle();
      if (readingError) return { error: readingError.message };
      if (
        !existingReading ||
        existingReading.customer_id !== customerId ||
        existingReading.period !== `${period}-01`
      ) {
        return { error: "Pencatatan meter tidak ditemukan." };
      }
      if (currentReading < Number(existingReading.previous_reading)) {
        return {
          error: "Meter sekarang tidak boleh lebih kecil dari meter sebelumnya.",
        };
      }

      const { data: bill, error: billError } = await supabase
        .from("pam_bills")
        .select("id, status")
        .eq("meter_reading_id", readingId)
        .maybeSingle();
      if (billError) return { error: billError.message };
      if (bill?.status === "paid") {
        return {
          error: "Pencatatan tidak dapat direvisi karena tagihan sudah dibayar.",
        };
      }
      if (bill) {
        const { data: payment, error: paymentError } = await supabase
          .from("pam_payments")
          .select("id")
          .eq("bill_id", bill.id)
          .limit(1)
          .maybeSingle();
        if (paymentError) return { error: paymentError.message };
        if (payment) {
          return {
            error: "Pencatatan tidak dapat direvisi karena pembayaran sudah tercatat.",
          };
        }
      }
    }

    let photoUrl: string | null = null;
    const hasNewPhoto = photo instanceof File && photo.size > 0;
    if (hasNewPhoto) {
      await ensureBucket(supabase);
      const path = `${period}/${customerId}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from(METER_PHOTOS_BUCKET)
        .upload(path, photo, { upsert: true, contentType: photo.type });

      if (uploadError) {
        return { error: `Gagal mengunggah foto: ${uploadError.message}` };
      }
      const { data: urlData } = supabase.storage
        .from(METER_PHOTOS_BUCKET)
        .getPublicUrl(path);
      photoUrl = urlData.publicUrl;
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
        p_photo_url: photoUrl,
        p_replace_photo: hasNewPhoto,
        p_reason: (revisionReason as string).trim(),
        p_actor: session.userId,
        p_fallback_price_per_m3: tariff?.price_per_m3 ?? 0,
      });
      if (error) return { error: error.message };
      const result = data as { usage?: number; bill_updated?: boolean } | null;
      revalidatePath("/meter-readings");
      revalidatePath("/bills");
      revalidatePath("/dashboard");
      return {
        success: true,
        usage: Number(result?.usage ?? usage),
        billUpdated: result?.bill_updated === true,
      };
    }

    const { error } = await supabase.from("pam_meter_readings").insert({
        customer_id: customerId,
        period: `${period}-01`,
        previous_reading: previousReading,
        current_reading: currentReading,
        usage,
        photo_url: photoUrl,
        recorded_by: session.userId,
        recorded_at: new Date().toISOString(),
      });

    if (error) {
      return { error: `Gagal menyimpan pencatatan: ${error.message}` };
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal menyimpan pencatatan." };
  }

  revalidatePath("/meter-readings");
  revalidatePath("/dashboard");
  return { success: true, usage, next };
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

  const result = data as { bill_deleted?: boolean } | null;
  revalidatePath("/meter-readings");
  revalidatePath("/bills");
  revalidatePath("/dashboard");
  return { success: true, billDeleted: result?.bill_deleted === true };
}
