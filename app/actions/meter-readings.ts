"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/auth/dal";
import { createSupabaseAdmin } from "@/lib/supabase/server";

const METER_PHOTOS_BUCKET = "meter-photos";

export type SaveReadingState = {
  error?: string;
  success?: boolean;
  usage?: number;
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
  await verifySession();

  const customerId = formData.get("customer_id");
  const period = formData.get("period");
  const currentReadingRaw = formData.get("current_reading");
  const previousReadingRaw = formData.get("previous_reading");
  const photo = formData.get("photo");

  if (typeof customerId !== "string" || !customerId) {
    return { error: "Pelanggan tidak valid." };
  }
  if (typeof period !== "string" || !/^\d{4}-\d{2}$/.test(period)) {
    return { error: "Periode tidak valid." };
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
  const supabase = createSupabaseAdmin();

  try {
    let photoUrl: string | null = null;
    if (photo instanceof File && photo.size > 0) {
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

    const { error } = await supabase.from("pam_meter_readings").upsert(
      {
        customer_id: customerId,
        period: `${period}-01`,
        previous_reading: previousReading,
        current_reading: currentReading,
        usage,
        photo_url: photoUrl,
      },
      { onConflict: "customer_id,period" }
    );

    if (error) {
      return { error: `Gagal menyimpan pencatatan: ${error.message}` };
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal menyimpan pencatatan." };
  }

  revalidatePath("/meter-readings");
  revalidatePath("/dashboard");
  return { success: true, usage };
}