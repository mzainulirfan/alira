# Alira

Kelola air, meter, dan tagihan dalam satu tempat.

**Stack:** Next.js (App Router) · Tailwind CSS · shadcn/ui · hugeicons · Supabase · PWA

## Setup

### 1. Buat proyek Supabase

Buat proyek di [supabase.com](https://supabase.com), lalu jalankan migrasi schema:

1. Buka **SQL Editor** di dashboard Supabase.
2. Salin isi `supabase/migrations/0001_init.sql` dan jalankan.

### 2. Konfigurasi environment

```bash
cp .env.example .env.local
```

Isi `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SESSION_SECRET=<hasil dari: openssl rand -base64 32>
```

- Anon key dan service role key ada di **Settings → API** di dashboard Supabase.

### 3. Set passcode login

```bash
npm run set-passcode -- 123456
```

Passcode harus 6 digit angka dan disimpan sebagai hash.

### 4. Jalankan aplikasi

```bash
npm run dev
```

Buka `http://localhost:3000`, masuk dengan passcode yang sudah diatur.

## Script

| Perintah                | Fungsi                                |
| ----------------------- | ------------------------------------- |
| `npm run dev`           | Jalankan server development           |
| `npm run build`         | Build produksi                        |
| `npm run lint`          | Jalankan ESLint                       |
| `npm run icons`         | Generate ulang icon PWA               |
| `npm run set-passcode`  | Set passcode login (hash)             |

## Struktur Folder

```text
app/
  (auth)/login/        Halaman login passcode
  (dashboard)/         Layout dashboard + halaman utama
  actions/             Server actions (auth)
components/
  layout/              Sidebar, bottom nav, header
  dashboard/           Komponen dashboard
  ui/                  Komponen shadcn/ui
lib/
  auth/                Passcode, session (JWT), DAL
  supabase/            Client browser & server
  format.ts            Format rupiah, meter, tanggal
proxy.ts               Proteksi route (auth guard)
supabase/migrations/   Schema SQL
```

## Auth

Login berbasis passcode sederhana (bukan Supabase Auth):

- Passcode di-hash (scrypt-like) dan disimpan di tabel `pam_app_settings.passcode_hash`.
- Setelah verifikasi, session JWT disimpan di cookie httpOnly.
- `proxy.ts` melindungi semua route `/dashboard*` dan mengarahkan ke `/login`.
