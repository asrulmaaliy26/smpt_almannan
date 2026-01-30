# Create News API Integration

## Overview
Halaman CreateNews telah diintegrasikan dengan API backend untuk mengirim data berita dengan format **form-data** yang mendukung upload file gambar.

## API Endpoint
- **URL**: `POST http://localhost:8000/api/news`
- **Content-Type**: `multipart/form-data`
- **Headers**: `Accept: application/json`

## Request Fields

### Text Fields (Required)
- `title` - Judul berita
- `excerpt` - Ringkasan singkat berita
- `content` - Konten lengkap berita
- `date` - Tanggal publikasi (format: YYYY-MM-DD)
- `category` - Kategori berita (Prestasi, Kegiatan, Akademik, Pengumuman, Wisuda, Seminar, Lainnya)
- `jenjang` - Jenjang pendidikan dalam **lowercase** (tk, mi, smp, ma, stai)

### Text Fields (Optional)
- `level` - Tingkat prestasi (Nasional, Internasional, Provinsi) - hanya untuk kategori Prestasi

### File Fields (Optional)
- `main_image` - File gambar utama (single file)
- `gallery[]` - Array file gambar galeri (multiple files)

## Response Format

### Success Response (201 Created)
```json
{
  "message": "Berita berhasil ditambahkan",
  "data": {
    "id": 1,
    "title": "Siswa MA Juara Olimpiade",
    "excerpt": "Prestasi membanggakan...",
    "content": "Siswa Madrasah Aliyah berhasil meraih juara...",
    "date": "2024-05-24",
    "views": 0,
    "category": "Prestasi",
    "jenjang": "MA",
    "main_image": "http://localhost:8000/storage/news/main/1234567890_image.jpg",
    "gallery": [
      "http://localhost:8000/storage/news/gallery/1234567891_gallery1.jpg",
      "http://localhost:8000/storage/news/gallery/1234567892_gallery2.jpg"
    ],
    "created_at": "2024-05-24T10:00:00.000000Z",
    "updated_at": "2024-05-24T10:00:00.000000Z"
  }
}
```

### Error Response (4xx/5xx)
```json
{
  "message": "Error message here"
}
```

## Frontend Implementation

### Files Modified

1. **`services/api.ts`**
   - Added `CreateNewsPayload` interface
   - Added `CreateNewsResponse` interface
   - Added `createNews()` function

2. **`pages/Admin/CreateNews.tsx`**
   - Added `excerpt` field (textarea)
   - Replaced URL inputs with file upload inputs
   - Added file state management (`mainImage`, `gallery`)
   - Added file change handlers
   - Integrated with `createNews()` API
   - Added loading state during submission
   - Added validation before submit

### Key Features

1. **File Upload Support**
   - Main image: Single file upload with file name preview
   - Gallery: Individual file uploads with add/remove functionality
     - Click "Tambah Foto" to add a new gallery slot
     - Each gallery item has its own file input
     - Remove unwanted items with trash button
     - Shows file name after selection

2. **Auto-generated Excerpt**
   - When using AI Auto-Write, excerpt is automatically generated from first 150 characters

3. **Validation**
   - Title, excerpt, and content are required
   - User-friendly error messages
   - Filters out empty gallery slots before submission

4. **Loading States**
   - Submit button shows loading spinner during API call
   - Button is disabled while submitting

5. **Error Handling**
   - Try-catch block for API errors
   - User-friendly error alerts

## Usage Example

### Using the Form

1. Fill in the title
2. Write or generate excerpt
3. Select category and jenjang
4. If category is "Prestasi", select level
5. Upload main image (optional)
6. Add gallery images (optional):
   - Click "Tambah Foto" button
   - Select image file for that slot
   - Repeat to add more images
   - Click trash icon to remove unwanted slots
7. Write or generate content using AI
8. Click "Simpan Publikasi"

### Using AI Auto-Write

1. Enter brief points in the AI panel
2. Click "Generate Konten"
3. AI will generate title, excerpt, and content
4. Review and edit as needed
5. Add images and submit

## Testing with Postman

```
Method: POST
URL: http://localhost:8000/api/news
Headers: Accept: application/json
Body: form-data

Fields:
- title: "Siswa MA Juara Olimpiade"
- excerpt: "Prestasi membanggakan..."
- content: "Siswa Madrasah Aliyah berhasil meraih juara..."
- date: "2024-05-24"
- category: "Prestasi"
- jenjang: "ma" (lowercase!)
- level: "Nasional"
- main_image: [Select File]
- gallery[]: [Select File] (can select multiple)
```

## Testing with HTML

Buka file `.docs/test-api-news.html` di browser untuk testing dengan UI yang lebih user-friendly.

## Notes

- **API Endpoint**: Menggunakan `/api/news` (bukan `/news`)
- **Jenjang Format**: Harus lowercase (tk, mi, smp, ma, stai)
- **Date**: Automatically set to today's date
- **Level**: Field is only sent when category is "Prestasi"
- **Files**: Optional - news can be created without images
- **Gallery**: Accepts multiple files at once
- **All file inputs**: Accept image/* types only
- **Categories**: Prestasi, Kegiatan, Akademik, Pengumuman, Wisuda, Seminar, Lainnya
