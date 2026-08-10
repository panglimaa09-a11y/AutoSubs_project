# AutoSubs

Struktur awal production-ready untuk AutoSubs dengan Vite + Supabase.

## Struktur

- `src/css/` — stylesheet
- `src/js/` — entry point dan logika aplikasi
- `src/js/services/` — koneksi/API Supabase
- `src/js/modules/` — modul Auth, Dashboard, Topup, Bot, Spin, Admin, dll.
- `src/components/` — komponen UI
- `src/assets/` — gambar/icon
- `supabase/migrations/` — SQL migration
- `supabase/functions/` — Edge Functions
- `public/` — file publik

## Menjalankan

1. Salin `.env.example` menjadi `.env`
2. Isi URL dan anon key Supabase.
3. Jalankan:
   `npm install`
4. Jalankan:
   `npm run dev`

Jangan masukkan `service_role` key ke frontend.
