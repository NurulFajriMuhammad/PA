# Document Repository - Sistem Manajemen Dokumen Terpusat

## 📋 Deskripsi

Document Repository adalah sistem terpusat untuk mengelola semua dokumen/lampiran dari seluruh aplikasi audit. Sistem ini secara otomatis mengumpulkan dokumen dari berbagai modul dan menyediakan interface pencarian dan pengelolaan yang powerful.

## 🏗️ Arsitektur Sistem

### Backend (Laravel)
- **Model**: `DocumentRepository`
- **Controller**: `DocumentRepositoryController`
- **Migration**: `create_document_repositories_table`
- **Routes**: `/api/document-repository/*`

### Frontend (React)
- **Component**: `DocumentRepository.jsx`
- **API Client**: `../../../Shared/api/apiClient`

### Database (PostgreSQL)
- **Table**: `document_repositories`
- **Functions**: `sync_document_repository()`, `get_document_statistics()`, `search_documents()`

## 📊 Modul yang Tersinkronisasi

Sistem mengumpulkan dokumen dari modul berikut:

1. **Tindak Lanjut** (`tindak_lanjut`)
   - Field: `bukti`
   - Kategori: "Arsip Tindak Lanjut"

2. **Analisis Temuan** (`analisis_temuan`)
   - Field: `lampiran`, `lampiran_name`
   - Kategori: "Arsip Analisis"

3. **Auditee Document** (`auditee_document`)
   - Field: `file_path`, `judul_dokumen`, `file_type`
   - Kategori: "Dokumen Auditee"

4. **External Audit Temuan** (`external_audit_temuan`)
   - Field: `lampiran`
   - Kategori: "Arsip External Audit"

5. **LHE File** (`lhe_file`)
   - Field: `file_path`, `file_name`, `file_type`, `file_size`
   - Kategori: "Laporan Hasil Audit"

## 🚀 Instalasi & Setup

### 1. Jalankan SQL Schema
```sql
-- Jalankan isi file document_repository_postgresql.sql di pgAdmin
```

### 2. Verifikasi Route
```bash
cd Backend
php artisan route:list --path=document-repository
```

### 3. Jalankan Server
```bash
# Backend
php artisan serve --host=192.168.1.8 --port=8000

# Frontend (di terminal terpisah)
cd Frontend/AuditApp
npm run dev
```

## 📡 API Endpoints

### GET /api/document-repository
Mengambil daftar dokumen dengan filtering dan pagination.

**Query Parameters:**
- `search` - Pencarian berdasarkan judul
- `category` - Filter kategori (default: Semua)
- `module` - Filter modul
- `file_type` - Filter tipe file
- `page` - Halaman pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [...],
    "current_page": 1,
    "last_page": 5
  },
  "categories": ["Semua", "Arsip Tindak Lanjut", ...],
  "modules": ["tindak_lanjut", "analisis_temuan", ...],
  "file_types": ["pdf", "jpg", ...]
}
```

### POST /api/document-repository/sync
Sinkronisasi dokumen dari semua modul.

**Response:**
```json
{
  "success": true,
  "message": "Document repository berhasil disinkronisasi"
}
```

### GET /api/document-repository/statistics
Mengambil statistik dokumen.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_documents": 150,
    "categories": {"Arsip Tindak Lanjut": 45, ...},
    "modules": {"tindak_lanjut": 45, ...},
    "file_types": {"pdf": 120, ...},
    "total_size": 52428800
  }
}
```

### GET /api/document-repository/download/{id}
Download dokumen berdasarkan ID.

## 🎨 Fitur Frontend

### 1. Dashboard Statistik
- Total dokumen
- Jumlah kategori
- Jumlah modul
- Total ukuran file

### 2. Filter & Pencarian
- **Kategori**: Filter berdasarkan kategori dokumen
- **Modul**: Filter berdasarkan modul asal
- **Tipe File**: Filter berdasarkan ekstensi file
- **Search**: Pencarian real-time berdasarkan judul

### 3. Pagination
- Navigasi halaman dengan Previous/Next
- Informasi halaman saat ini

### 4. Actions
- **View**: Membuka dokumen di tab baru
- **Download**: Mengunduh dokumen
- **Sync**: Sinkronisasi data dari database

## 🧪 Testing

### Browser Console Test
```javascript
// Jalankan di browser console setelah login
import('./test_document_repository.js').then(module => {
  module.runAllTests();
});
```

### Manual Test
1. Buka halaman Document Repository
2. Klik tombol "Sinkronisasi"
3. Periksa statistik dan daftar dokumen
4. Test filter dan pencarian
5. Test download dokumen

## 🔧 Troubleshooting

### Error: "No token found"
- Pastikan user sudah login
- Periksa localStorage untuk `authToken` atau `token`

### Error: "Document repository berhasil disinkronisasi" tapi tidak ada data
- Periksa apakah ada data di tabel asal (tindak_lanjut, analisis_temuan, dll)
- Jalankan query manual di pgAdmin:
```sql
SELECT sync_document_repository();
```

### Error: "File tidak ditemukan"
- Periksa apakah file fisik ada di folder `storage/app/public/`
- Periksa path file di database

### Frontend tidak loading
- Periksa console browser untuk error
- Pastikan VITE_BACKEND_URL sudah benar di `.env`
- Periksa koneksi jaringan

## 📈 Optimasi & Performa

### Database Indexes
- `idx_document_repositories_category`
- `idx_document_repositories_module`
- `idx_document_repositories_file_type`
- `idx_document_repositories_created_at`
- `idx_document_repositories_title` (GIN index untuk full-text search)

### Frontend Optimasi
- Debounced search (300ms delay)
- Pagination dengan 20 items per halaman
- Lazy loading untuk statistik
- Error boundaries untuk graceful failure

## 🔒 Keamanan

- Authentication required untuk semua endpoints
- File access melalui Laravel Storage dengan permission check
- SQL injection prevention dengan parameterized queries
- CORS protection dengan Sanctum

## 📝 Catatan Pengembangan

### Menambah Modul Baru
1. Tambahkan method sync di `DocumentRepository::syncDocuments()`
2. Update fungsi `sync_document_repository()` di SQL
3. Pastikan field file path tersedia di model baru

### Menambah Filter Baru
1. Update controller `index()` method
2. Update fungsi `search_documents()` di SQL
3. Update frontend filter UI

### Custom Kategori
- Edit kategori mapping di method sync masing-masing modul
- Update UI jika perlu menambah kategori baru

---

**Versi**: 1.0.0
**Tanggal**: April 2026
**Developer**: AI Assistant