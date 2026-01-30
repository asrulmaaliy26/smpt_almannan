# Migrasi Kategori ke API Dinamis

## Ringkasan Perubahan

Semua kategori statis (PROJECT_CATEGORIES, JOURNAL_CATEGORIES, NEWS_CATEGORIES) telah diganti dengan pemanggilan API dinamis.

## File yang Diubah

### 1. `services/api.ts`
- ✅ Menambahkan fungsi `fetchProjectCategories()` - mengambil kategori proyek
- ✅ Menambahkan fungsi `fetchJournalCategories()` - mengambil kategori jurnal  
- ✅ Menambahkan fungsi `fetchNewsCategories()` - mengambil kategori berita

### 2. Halaman Publik
- ✅ `pages/Projects.tsx` - menggunakan `fetchProjectCategories()`
- ✅ `pages/Journals.tsx` - menggunakan `fetchJournalCategories()`
- ✅ `pages/News.tsx` - menggunakan `fetchNewsCategories()`

### 3. Halaman Admin
- ✅ `pages/Admin/CreateProject.tsx` - menggunakan `fetchProjectCategories()`
- ✅ `pages/Admin/EditProject.tsx` - menggunakan `fetchProjectCategories()`
- ✅ `pages/Admin/CreateJournal.tsx` - menggunakan `fetchJournalCategories()`
- ✅ `pages/Admin/EditJournal.tsx` - menggunakan `fetchJournalCategories()`

### 4. `constants.tsx`
- ✅ Menghapus konstanta statis:
  - `PROJECT_CATEGORIES`
  - `JOURNAL_CATEGORIES`
  - `NEWS_CATEGORIES`

## Struktur API

### Endpoint
```
GET http://127.0.0.1:8000/categories
```

### Response Format
```json
{
  "project_categories": [
    "Semua",
    "Sains & Teknologi",
    "Sosial & Budaya",
    "Keagamaan",
    "Seni & Kreativitas",
    "Kewirausahaan"
  ],
  "journal_categories": [
    "Semua",
    "Tafsir & Hadis",
    "Sains Terapan",
    "Ekonomi Syariah",
    "Pendidikan",
    "Sosial Humaniora"
  ],
  "news_categories": [
    "Semua",
    "Akademik",
    "Kegiatan",
    "Pengumuman",
    "Prestasi"
  ]
}
```

## Keuntungan

1. **Fleksibilitas** - Kategori dapat diubah dari backend tanpa perlu rebuild frontend
2. **Konsistensi** - Satu sumber data untuk semua kategori
3. **Mudah Maintenance** - Update kategori hanya perlu dilakukan di satu tempat (backend)
4. **Scalability** - Mudah menambah atau mengurangi kategori

## Cara Kerja

Setiap komponen yang membutuhkan kategori akan:
1. Membuat state `categories` dengan nilai awal array kosong
2. Menggunakan `useEffect` untuk memanggil fungsi API yang sesuai
3. Menyimpan hasil ke state `categories`
4. Menampilkan loading state saat data sedang diambil
5. Menampilkan kategori setelah data berhasil dimuat

## Error Handling

Semua pemanggilan API dilengkapi dengan try-catch untuk menangani error:
```typescript
try {
  const data = await fetchProjectCategories();
  setCategories(data);
} catch (error) {
  console.error('Error loading categories:', error);
}
```
