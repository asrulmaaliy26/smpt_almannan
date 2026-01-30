# Create Journal API Integration

## Overview
Halaman CreateJournal telah diintegrasikan dengan API backend untuk mengirim data jurnal dengan format **form-data** yang mendukung upload file PDF.

## API Endpoint
- **URL**: `POST http://localhost:8000/api/journals`
- **Content-Type**: `multipart/form-data`
- **Headers**: `Accept: application/json`

## Request Fields

### Text Fields (Required)
- `title` - Judul jurnal
- `category` - Kategori jurnal
- `abstract` - Abstrak/ringkasan jurnal
- `author` - Penulis/Mahasiswa
- `mentor` - Pembimbing/Mentor
- `score` - Nilai (0-100)
- `date` - Tanggal publikasi (format: YYYY-MM-DD)
- `jenjang` - Jenjang pendidikan dalam **lowercase** (tk, mi, smp, ma, stai)
- `is_best` - Status jurnal terbaik (1 atau 0)

### File Fields (Optional)
- `documentUrl` - File PDF jurnal (single file, max 10MB)

## Categories Available
- Ekonomi Syariah
- Pendidikan
- Teknologi
- Sosial
- Kesehatan
- Sains
- Lainnya

## API Function (services/api.ts)

```typescript
export interface CreateJournalPayload {
    title: string;
    category: string;
    abstract: string;
    author: string;
    mentor: string;
    score: number;
    date: string;
    jenjang: string;
    is_best: boolean;
    documentUrl?: File;
}

export interface CreateJournalResponse {
    message: string;
    data: JournalItem;
}

export const createJournal = async (payload: CreateJournalPayload): Promise<CreateJournalResponse> => {
    const formData = new FormData();

    // Add text fields
    formData.append('title', payload.title);
    formData.append('category', payload.category);
    formData.append('abstract', payload.abstract);
    formData.append('author', payload.author);
    formData.append('mentor', payload.mentor);
    formData.append('score', payload.score.toString());
    formData.append('date', payload.date);
    formData.append('jenjang', payload.jenjang);
    formData.append('is_best', payload.is_best ? '1' : '0');

    // Add PDF document if provided
    if (payload.documentUrl) {
        formData.append('documentUrl', payload.documentUrl);
    }

    const response = await fetch(`${API_BASE_URL}/api/journals`, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    });

    // ... error handling ...

    return data as CreateJournalResponse;
};
```

## Frontend Implementation (CreateJournal.tsx)

### State Management

```typescript
import { createJournal } from '../../services/api';
import { Loader2, Award } from 'lucide-react';

const [isSubmitting, setIsSubmitting] = useState(false);
const [title, setTitle] = useState('');
const [author, setAuthor] = useState('');
const [mentor, setMentor] = useState('');
const [category, setCategory] = useState('');
const [score, setScore] = useState(0);
const [abstract, setAbstract] = useState('');
const [isBest, setIsBest] = useState(false);
const [documentFile, setDocumentFile] = useState<File | null>(null);
const [jenjang, setJenjang] = useState<EducationLevel>(activeLevel === 'UMUM' ? 'SMA' : activeLevel);
```

### File Upload Handler

```typescript
const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    const fileSizeMB = file.size / (1024 * 1024);
    
    if (fileSizeMB > 10) {
      alert('File terlalu besar! Maksimal 10MB');
      e.target.value = '';
      return;
    }
    
    setDocumentFile(file);
  }
};
```

### Submit Handler

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validation
  if (!title.trim() || !abstract.trim() || !author.trim() || !mentor.trim()) {
    alert('Semua field wajib harus diisi');
    return;
  }
  if (score < 0 || score > 100) {
    alert('Nilai harus antara 0-100');
    return;
  }

  setIsSubmitting(true);
  try {
    const today = new Date().toISOString().split('T')[0];

    const response = await createJournal({
      title,
      category,
      abstract,
      author,
      mentor,
      score,
      date: today,
      jenjang: jenjang.toLowerCase(),
      is_best: isBest,
      documentUrl: documentFile || undefined,
    });

    alert(response.message || 'Jurnal berhasil ditambahkan!');
    navigate('/admin/journals');
  } catch (error: any) {
    alert(error.message || 'Gagal menyimpan jurnal');
  } finally {
    setIsSubmitting(false);
  }
};
```

### UI Components

#### PDF Upload

```tsx
<div className="md:col-span-2">
  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
    <FileText className="w-4 h-4" /> Dokumen PDF (Opsional)
  </label>
  <input 
    type="file" 
    accept=".pdf"
    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800" 
    onChange={handleDocumentChange}
  />
  <p className="text-xs text-slate-400 mt-2">Format: PDF (Max: 10MB)</p>
  {documentFile && (
    <p className="text-xs text-slate-500 mt-2">
      📄 {documentFile.name} ({(documentFile.size / (1024 * 1024)).toFixed(2)} MB)
    </p>
  )}
</div>
```

#### Score Input

```tsx
<div>
  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
    <Star className="w-4 h-4" /> Nilai <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-md ml-2">0-100</span>
  </label>
  <input 
    type="number" 
    min="0" 
    max="100" 
    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-2xl" 
    value={score} 
    onChange={(e) => setScore(Number(e.target.value))} 
  />
</div>
```

#### Best Journal Checkbox

```tsx
<div>
  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
    <Award className="w-4 h-4" /> Status Jurnal
  </label>
  <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl">
    <input 
      type="checkbox" 
      id="isBest" 
      checked={isBest} 
      onChange={(e) => setIsBest(e.target.checked)} 
      className="w-5 h-5 rounded border-slate-300"
    />
    <label htmlFor="isBest" className="font-bold text-slate-700 cursor-pointer">
      🏆 Tandai sebagai Jurnal Terbaik
    </label>
  </div>
</div>
```

## Testing dengan Postman

```
Method: POST
URL: http://localhost:8000/api/journals
Headers: Accept: application/json
Body: form-data

Fields:
- title: "Zakat & Ekonomi Digital"
- category: "Ekonomi Syariah"
- abstract: "Penelitian tentang implementasi zakat..."
- author: "Ahmad Mahasiswa"
- mentor: "Dr. Zainal"
- score: 98
- date: "2024-05-24"
- jenjang: "stai" (lowercase!)
- is_best: 1 (atau 0)
- documentUrl: [Select PDF File]
```

## Key Features

### ✅ Implemented Features

1. **PDF Upload** - Single file upload dengan validasi ukuran (max 10MB)
2. **Score Validation** - Input number dengan range 0-100
3. **Best Journal Flag** - Checkbox untuk menandai jurnal terbaik
4. **Auto Date** - Tanggal otomatis set ke hari ini
5. **File Size Display** - Menampilkan ukuran file dalam MB
6. **Loading State** - Button disabled saat submit dengan spinner
7. **Validation** - Validasi semua field required
8. **Error Handling** - Alert untuk error dan success

### 📋 Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | ✅ | Judul jurnal |
| category | string | ✅ | Kategori jurnal |
| abstract | text | ✅ | Abstrak/ringkasan |
| author | string | ✅ | Nama penulis/mahasiswa |
| mentor | string | ✅ | Nama pembimbing |
| score | number | ✅ | Nilai 0-100 |
| jenjang | string | ✅ | Jenjang (lowercase) |
| is_best | boolean | ✅ | Status terbaik (default: false) |
| documentUrl | file | ❌ | PDF dokumen (optional) |

## Notes

- **API Endpoint**: `/api/journals` (bukan `/journals`)
- **Jenjang Format**: Harus lowercase (tk, mi, smp, ma, stai)
- **Score Range**: 0-100 (validated on frontend and should be validated on backend)
- **is_best**: Dikirim sebagai '1' atau '0' (string) ke backend
- **PDF Only**: File upload hanya menerima .pdf
- **Max File Size**: 10MB untuk PDF
- **Date**: Automatically set to today's date
- **Categories**: Ekonomi Syariah, Pendidikan, Teknologi, Sosial, Kesehatan, Sains, Lainnya

## Comparison: News vs Projects vs Journals

| Feature | News | Projects | Journals |
|---------|------|----------|----------|
| **Main Image** | ✅ main_image | ✅ imageUrl | ❌ |
| **Gallery** | ✅ gallery[] | ❌ | ❌ |
| **Documents** | ❌ | ✅ documents[] + metadata | ✅ documentUrl (single PDF) |
| **Score** | ❌ | ❌ | ✅ score (0-100) |
| **Best Flag** | ❌ | ❌ | ✅ is_best |
| **Mentor** | ❌ | ❌ | ✅ mentor |
| **Abstract** | ✅ excerpt | ✅ description | ✅ abstract |

## Next Steps

1. ✅ API function created (`createJournal`)
2. ✅ Frontend updated (CreateJournal.tsx)
3. ⚠️ Test with backend API
4. ⚠️ Update EditJournal.tsx (if needed)
5. ⚠️ Ensure JournalDetail.tsx displays PDF correctly
