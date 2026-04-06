# PSO Dashboard

Sistem manajemen tempat les privat — mengelola orang tua, murid, guru, sesi, tagihan, dan gaji guru.

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + TanStack Query
- **Backend**: Node.js + Express + Knex.js
- **Database**: PostgreSQL

---

## Setup (Local Development)

### Prasyarat
- Node.js 18+
- PostgreSQL 14+ (atau Docker)

### Option A: Tanpa Docker (Manual)

**1. Jalankan PostgreSQL**
Buat database `pso_db` dengan user `pso_user` / password `pso_password`:
```sql
CREATE USER pso_user WITH PASSWORD 'pso_password';
CREATE DATABASE pso_db OWNER pso_user;
```

**2. Setup Backend**
```bash
cd backend
npm install
# Edit .env jika perlu sesuaikan DATABASE_URL
npm run migrate        # Jalankan migrasi
npm run seed           # Buat admin default (admin/admin123)
npm run dev            # Jalankan di port 4000
```

**3. Setup Frontend**
```bash
cd frontend
npm install
npm run dev            # Jalankan di port 3000
```

Buka `http://localhost:3000` — login dengan `admin` / `admin123`

---

### Option B: Dengan Docker Compose

```bash
# Di root folder PSO
docker-compose up -d

# Tunggu postgres siap, lalu jalankan migrasi
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

Buka `http://localhost:3000`

---

## Deploy ke Production

### Frontend → Vercel
```bash
cd frontend
# Set environment variable di Vercel:
# VITE_API_URL = https://your-backend.render.com/api
npm run build
```

### Backend → Render / Railway
- Root: `backend/`
- Build command: `npm install`
- Start command: `node index.js`
- Environment variables:
  - `DATABASE_URL` = PostgreSQL connection string (dari Neon/Supabase)
  - `JWT_SECRET` = random string panjang
  - `NODE_ENV` = production
- Jalankan migration: `npm run migrate && npm run seed`

### Database → Neon (Free)
1. Buat project di [neon.tech](https://neon.tech)
2. Copy connection string ke `DATABASE_URL`

---

## Fitur

| Fitur | Deskripsi |
|-------|-----------|
| Login Admin | JWT authentication |
| Manajemen Orang Tua & Murid | CRUD dengan pencarian |
| Manajemen Guru | CRUD |
| Manajemen Mata Pelajaran | CRUD |
| Tarif Sesi | Tarif berbeda per murid-guru-mapel |
| Input Sesi Les | Auto-fill tarif, validasi invoice locked |
| Catat Pembayaran | Update saldo orang tua |
| Invoice Bulanan | Tampilan seperti referensi gambar + print |
| Ringkasan Tahunan | Summary per bulan + semua pembayaran |
| Gaji Guru | Preview & generate gaji bulanan |

## Business Rules
- Invoice bulan X dikunci setelah bulan X+1 berakhir
- Ringkasan tahunan dikunci setelah tahun+1 berakhir
- Sesi tidak bisa dihapus — koreksi dengan nilai negatif
- Jika sesi lebih dari 2 bulan lalu, ditagihkan ke bulan berjalan
- Kelebihan bayar carry forward ke bulan berikut

## Default Credentials
- Username: `admin`
- Password: `admin123`

> **Ganti password default setelah pertama kali login!**
