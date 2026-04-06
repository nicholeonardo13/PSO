# PSO Custom Backoffice

Sistem manajemen tempat les privat — mengelola orang tua, murid, guru, sesi les, tagihan, pembayaran, dan gaji guru.

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | React 18 + Vite 5 + Tailwind CSS 3 + TanStack Query v5 |
| **Backend** | Spring Boot 3.3.4 + Java 21 + Spring Security 6 (JWT) |
| **ORM / DB Migration** | Spring Data JPA + Hibernate + Flyway |
| **Database** | PostgreSQL 14+ |
| **HTTP Client** | Axios |
| **Icons** | Lucide React |
| **Routing** | React Router DOM v6 |

---

## Fitur

| Fitur | Deskripsi |
|-------|-----------|
| **Login Admin** | JWT authentication, stateless |
| **Dashboard** | Statistik ringkas + aksi cepat + tagihan outstanding |
| **Orang Tua & Murid** | CRUD dalam satu halaman (2 tab) — murid bisa tanpa orang tua |
| **Guru** | CRUD + riwayat gaji |
| **Mata Pelajaran** | CRUD |
| **Tarif Sesi** | Tarif fleksibel per kombinasi guru–murid–mapel |
| **Sesi Les** | Input, edit, hapus sesi; auto-fill tarif; filter per orang tua/guru/bulan |
| **Pembayaran** | Catat pembayaran, update saldo orang tua otomatis |
| **Invoice Bulanan** | Detail sesi per murid & mata pelajaran + ringkasan saldo + cetak PDF |
| **Ringkasan Tahunan** | Summary per bulan + semua pembayaran dalam setahun |
| **Cetak Invoice** | Picker orang tua + bulan/tahun → buka & cetak invoice |
| **Gaji Guru** | Preview detail per guru (per sesi, murid, mapel, tanggal) + generate & simpan |
| **Dark Mode** | Toggle light/dark mode |
| **Bilingual** | Bahasa Indonesia / English |

---

## Business Rules

- Invoice bulan X **dikunci** setelah bulan X+1 berakhir (tidak bisa tambah/edit/hapus sesi)
- Ringkasan tahunan dikunci setelah tahun berikutnya berakhir
- Kelebihan bayar **carry forward** ke bulan berikutnya sebagai saldo pembuka
- Tarif sesi di-lookup otomatis berdasarkan kombinasi guru + murid + mata pelajaran
- Murid dapat didaftarkan **tanpa orang tua** (independen)

---

## Struktur Proyek

```
PSO/
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── components/         # Layout, PageHeader, StatCard, EmptyState, dll
│   │   ├── contexts/           # AuthContext, ThemeContext, LanguageContext
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── parents/        # ParentList, ParentDetail
│   │   │   ├── teachers/       # TeacherList
│   │   │   ├── courses/        # CourseList
│   │   │   ├── session-rates/  # SessionRateList
│   │   │   ├── sessions/       # SessionList, RecordSession
│   │   │   ├── payments/       # PaymentList, RecordPayment
│   │   │   ├── invoices/       # MonthlyInvoice, YearlySummary, GenerateInvoice
│   │   │   └── salary/         # SalaryPage
│   │   ├── services/api.js     # Semua panggilan API (Axios)
│   │   └── utils/
│   │       ├── format.js       # formatRupiah, formatDate, formatDuration, monthName
│   │       └── translations.js # Semua teks ID/EN
│   └── tailwind.config.js
│
├── backend-spring/             # Spring Boot 3
│   └── src/main/java/com/pso/backoffice/
│       ├── controller/         # REST Controllers
│       ├── service/            # Business logic
│       ├── repository/         # Spring Data JPA + native queries
│       ├── entity/             # JPA Entities
│       ├── security/           # JWT filter, config
│       └── resources/
│           ├── application.yml
│           └── db/migration/   # Flyway SQL migrations
│
├── start-backend.sh            # Script untuk jalankan backend lokal
└── docker-compose.yml
```

---

## Setup Lokal

### Prasyarat

- **Java 21** (`/opt/homebrew/opt/openjdk@21` untuk macOS Homebrew)
- **Maven 3.8+**
- **Node.js 18+**
- **PostgreSQL 14+**

### 1. Setup Database

```sql
-- Jalankan di psql
CREATE USER pso_user WITH PASSWORD 'pso_password';
CREATE DATABASE pso_db OWNER pso_user;
```

### 2. Jalankan Backend

Cara termudah — gunakan script yang sudah tersedia:

```bash
# Di root folder PSO
chmod +x start-backend.sh
./start-backend.sh
```

Script ini otomatis:
- Set `JAVA_HOME` ke Java 21
- Matikan proses lama di port 4000
- Jalankan `mvn spring-boot:run` dengan env yang tepat

Flyway akan otomatis menjalankan migrasi schema saat startup pertama kali.

**Atau manual:**

```bash
cd backend-spring
export JAVA_HOME=/opt/homebrew/opt/openjdk@21
export PATH="$JAVA_HOME/bin:$PATH"

JDBC_DATABASE_URL=jdbc:postgresql://localhost:5432/pso_db \
DATABASE_USERNAME=pso_user \
DATABASE_PASSWORD=pso_password \
JWT_SECRET=pso_super_secret_jwt_key_change_in_production \
mvn spring-boot:run
```

Backend berjalan di **http://localhost:4000**

### 3. Jalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di **http://localhost:5173**

Buka browser → login dengan `admin` / `admin123`

---

## Environment Variables Backend

| Variable | Default | Keterangan |
|----------|---------|------------|
| `JDBC_DATABASE_URL` | `jdbc:postgresql://localhost:5432/pso_db` | JDBC URL database |
| `DATABASE_USERNAME` | `pso_user` | Username PostgreSQL |
| `DATABASE_PASSWORD` | `pso_password` | Password PostgreSQL |
| `JWT_SECRET` | *(wajib diset)* | Secret key untuk sign JWT token |
| `SERVER_PORT` | `4000` | Port backend |

---

## API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/auth/login` | Login, returns JWT |
| `GET` | `/api/auth/me` | Info user login |
| `GET` | `/api/dashboard` | Data dashboard |
| `GET/POST/PUT/DELETE` | `/api/parents` | CRUD orang tua |
| `GET/POST/PUT/DELETE` | `/api/students` | CRUD murid |
| `GET/POST/PUT/DELETE` | `/api/teachers` | CRUD guru |
| `GET/POST/PUT/DELETE` | `/api/courses` | CRUD mata pelajaran |
| `GET/POST/PUT/DELETE` | `/api/session-rates` | CRUD tarif sesi |
| `GET/POST/PUT/DELETE` | `/api/sessions` | CRUD sesi les |
| `GET/POST` | `/api/payments` | Daftar & catat pembayaran |
| `GET` | `/api/invoices` | Daftar semua invoice |
| `GET` | `/api/invoices/:parentId/:year/:month` | Invoice bulanan |
| `GET` | `/api/invoices/:parentId/:year` | Ringkasan tahunan |
| `GET` | `/api/salary/detail/:year/:month` | Detail sesi per guru |
| `GET` | `/api/salary/preview/:year/:month` | Preview gaji (agregat) |
| `POST` | `/api/salary/generate/:year/:month` | Generate & simpan gaji |
| `GET` | `/api/salary` | Riwayat gaji tersimpan |

---

## Deploy ke Production

### Frontend → Vercel

```bash
cd frontend
# Set environment variable di dashboard Vercel:
# VITE_API_URL = https://your-backend.example.com/api
npm run build
```

### Backend → Render / Railway / Fly.io

- Root: `backend-spring/`
- Build command: `mvn clean package -DskipTests`
- Start command: `java -jar target/backoffice-1.0.0.jar`
- Environment variables:
  - `JDBC_DATABASE_URL` = JDBC connection string PostgreSQL
  - `DATABASE_USERNAME` / `DATABASE_PASSWORD`
  - `JWT_SECRET` = string acak panjang (min 32 karakter)

Flyway akan otomatis migrate schema saat startup.

### Database → Neon / Supabase (Free Tier)

1. Buat project di [neon.tech](https://neon.tech) atau [supabase.com](https://supabase.com)
2. Copy JDBC connection string
3. Set sebagai `JDBC_DATABASE_URL`

---

## Default Credentials

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `admin123` |

> **Ganti password default segera setelah pertama kali login di production!**
