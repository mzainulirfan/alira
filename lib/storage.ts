import "server-only";

import type { createSupabaseAdmin } from "@/lib/supabase/server";

type SupabaseAdmin = ReturnType<typeof createSupabaseAdmin>;

export async function ensurePrivateBucket(
  supabase: SupabaseAdmin,
  bucket: string
): Promise<void> {
  const secureExistingBucket = async () => {
    const { data, error } = await supabase.storage.getBucket(bucket);
    if (error || !data) return false;
    if (data.public) {
      const { error: updateError } = await supabase.storage.updateBucket(bucket, {
        public: false,
      });
      if (updateError) throw new Error(`Gagal mengamankan penyimpanan: ${updateError.message}`);
    }
    return true;
  };

  if (await secureExistingBucket()) return;

  const { error } = await supabase.storage.createBucket(bucket, { public: false });
  if (error && !(await secureExistingBucket())) {
    throw new Error(`Gagal menyiapkan penyimpanan: ${error.message}`);
  }
}

export async function removeStorageObjects(
  supabase: SupabaseAdmin,
  bucket: string,
  paths: string[]
): Promise<void> {
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) {
    console.error(`Gagal membersihkan objek ${bucket}: ${error.message}`);
  }
}

export async function createSignedUrlMap(
  supabase: SupabaseAdmin,
  bucket: string,
  paths: Array<string | null>
): Promise<Map<string, string>> {
  const uniquePaths = [...new Set(paths.filter((path): path is string => Boolean(path)))];
  if (uniquePaths.length === 0) return new Map();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrls(uniquePaths, 60 * 60);
  if (error) throw new Error(`Gagal membuat akses file: ${error.message}`);

  return new Map(
    (data ?? []).flatMap((item) =>
      item.path && item.signedUrl ? [[item.path, item.signedUrl] as const] : []
    )
  );
}
