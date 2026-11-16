# Artalibas Core 942 - Kekuatan Apel Kompi Markas 🐯

Aplikasi manajemen dan rekapitulasi harian kekuatan apel personel militer/satuan **Kompi Markas - Artalibas Core 942**. Dirancang untuk pencatatan otomatis, sinkronisasi Google Sheets, ekspor format laporan WhatsApp/Telegram, manajemen hak akses berjenjang (Multi-Role RBAC), dan database personel paten.

---

## 🌟 Fitur Utama

- **📊 Rekapitulasi Kekuatan Apel Real-Time**
  - Perhitungan otomatis: Jumlah Organik, Kurang (Dinas Dalam, Dinas Luar, Dinas Khusus, Lain-Lain), dan Siap Ops (Hadir).
  - Format status apel militer presisi sesuai standar pelaporan dinas harian.
- **🛡️ Manajemen Akses Berjenjang (RBAC)**
  - **Administrator Utama (`zulfi`)**: Hak akses penuh termasuk mengelola akun admin (`bamin`), user, menghapus user/admin, mengubah database paten, sinkronisasi Google Sheets, dsb. (Diri sendiri terproteksi dari penghapusan).
  - **Admin (`bamin`)**: Dapat mengelola keterangan personel, memindahkan apel ke paten, dan mengubah database paten.
  - **User**: Mode operasional terbatas (hanya dapat melihat data dan melakukan pencatatan apel harian, tanpa izin merusak database personel paten).
- **📋 Database Personel Paten (Master Organik)**
  - Database organik 94 personel terdata lengkap berdasarkan pangkat, NRP/NIP, jabatan, kategori utama (Dinas Dalam, Dinas Luar, Dinas Khusus, Lain-Lain, Hadir), dan sub-keterangan dinas.
- **⚡ Pindahkan Keterangan Apel ke Paten**
  - Tombol aksi satu-klik khusus Administrator Utama dan Admin untuk memperbarui data master paten langsung dari situasi apel harian terkini.
- **📑 Sinkronisasi Otomatis Google Sheets**
  - Integrasi dengan Google Sheets API untuk auto-sync database paten tanpa perlu re-publish berkala secara manual.
- **📱 Format Laporan Siap Kirim (Copy to WhatsApp)**
  - Format output teks apel berstruktur emoji macan (`🐯`) yang siap disalin dan dikirimkan ke grup komando.
- **🎨 UI Modern & Responsif**
  - Dibangun dengan React 19, TypeScript, Vite, Tailwind CSS v4, dan Lucide Icons dengan nuansa taktis militer modern.

---

## 🚀 Panduan Memulai (Quick Start)

### 1. Prasyarat
- **Node.js** v18+ atau v20+
- **npm**, **pnpm**, atau **yarn**

### 2. Instalasi Dependensi
```bash
# Clone repositori dari GitHub
git clone https://github.com/USERNAME_ANDA/artalibas-core-942.git
cd artalibas-core-942

# Install dependensi paket
npm install
```

### 3. Menjalankan Aplikasi di Mode Pengembangan
```bash
npm run dev
```
Buka browser di `http://localhost:3000` (atau port yang ditampilkan di terminal).

### 4. Build untuk Produksi
```bash
npm run build
```
Hasil build akan tersimpan di direktori `dist/` dan siap di-deploy ke Vercel, Netlify, Cloudflare Pages, Firebase Hosting, atau VPS.

---

## 🔐 Akun Default Sistem

| Peran (Role) | Username | Password Default | Izin Utama |
|---|---|---|---|
| **Administrator Utama** | `zulfi` | `artalibas942` | Akses penuh, kelola user & admin, ubah paten, proteksi akun sendiri |
| **Admin** | `bamin` | `bamin942` | Kelola personel, pindahkan apel ke paten, ubah data paten |
| **User** | `user` / Tamu | *(Mode User)* | Input apel harian, tidak bisa mengubah data paten |

---

## 📁 Struktur Proyek

```text
├── public/                 # File aset statis
├── src/
│   ├── components/         # Komponen UI (Header, Footer, Tables, Modals, UserManagement)
│   ├── data/               # Data master organik 94 personel awal
│   ├── services/           # Service integrasi (Google Sheets, Auth, Storage)
│   ├── types/              # Deklarasi tipe TypeScript (Personnel, Roles, Auth)
│   ├── utils/              # Logika kalkulasi apel militer, pengelompokan dinas
│   ├── App.tsx             # Entry point komponen utama aplikasi
│   ├── index.css           # Styling Tailwind CSS
│   └── main.tsx            # Bootstrap React DOM
├── index.html              # Template HTML utama
├── package.json            # Daftar dependensi & script build
├── tsconfig.json           # Konfigurasi TypeScript
├── vite.config.ts          # Konfigurasi bundler Vite
└── README.md               # Dokumentasi proyek
```

---

## 📤 Cara Upload ke GitHub (Panduan Langkah demi Langkah)

1. Buka [GitHub.com](https://github.com) dan buat repository baru (misal: `artalibas-core-942`).
2. Di komputer lokal Anda (setelah mengekstrak file ZIP ini), buka terminal di dalam folder proyek:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit Artalibas Core 942"
   git branch -M main
   git remote add origin https://github.com/USERNAME_ANDA/artalibas-core-942.git
   git push -u origin main
   ```
3. Repository Anda sekarang sudah ter-publish di GitHub!

---

## 📜 Lisensi
Hak Cipta © 2025 **Kompi Markas - Artalibas Core 942**. Seluruh hak cipta dilindungi undang-undang.
