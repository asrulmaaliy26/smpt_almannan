# Create Project API Integration

## Status
✅ **API Function Ready** - `createProject()` sudah dibuat di `services/api.ts`
⚠️ **Frontend Integration** - Perlu update CreateProject.tsx (manual atau bertahap)

## API Endpoint
- **URL**: `POST http://localhost:8000/api/projects`
- **Content-Type**: `multipart/form-data`
- **Headers**: `Accept: application/json`

## Request Fields

### Text Fields (Required)
- `title` - Judul proyek
- `category` - Kategori proyek
- `description` - Deskripsi lengkap proyek
- `author` - Penulis/Tim
- `date` - Tanggal (format: YYYY-MM-DD)
- `jenjang` - Jenjang pendidikan dalam **lowercase** (tk, mi, smp, ma, stai)

### File Fields (Optional)
- `imageUrl` - File gambar proyek (single file)
- `documents[]` - Array file dokumen (multiple files)
- `document_types[]` - Array tipe dokumen (document, proposal, report, presentation, data, other)
- `document_titles[]` - Array judul dokumen

## Document Structure

Berbeda dengan News yang menggunakan struktur `ProjectDocument`, Projects menggunakan **3 array terpisah**:

```typescript
// Contoh: 2 dokumen
documents: [file1.pdf, file2.docx]
document_types: ['proposal', 'report']
document_titles: ['Proposal Penelitian', 'Laporan Akhir']
```

## API Function (services/api.ts)

```typescript
export interface CreateProjectPayload {
    title: string;
    category: string;
    description: string;
    author: string;
    date: string;
    jenjang: string;
    imageUrl?: File;
    documents?: File[];
    document_types?: string[];
    document_titles?: string[];
}

export const createProject = async (payload: CreateProjectPayload): Promise<CreateProjectResponse> => {
    const formData = new FormData();

    // Add text fields
    formData.append('title', payload.title);
    formData.append('category', payload.category);
    formData.append('description', payload.description);
    formData.append('author', payload.author);
    formData.append('date', payload.date);
    formData.append('jenjang', payload.jenjang);

    // Add image
    if (payload.imageUrl) {
        formData.append('imageUrl', payload.imageUrl);
    }

    // Add documents with metadata
    if (payload.documents && payload.documents.length > 0) {
        payload.documents.forEach((file) => {
            formData.append('documents[]', file);
        });

        if (payload.document_types && payload.document_types.length > 0) {
            payload.document_types.forEach((type) => {
                formData.append('document_types[]', type);
            });
        }

        if (payload.document_titles && payload.document_titles.length > 0) {
            payload.document_titles.forEach((title) => {
                formData.append('document_titles[]', title);
            });
        }
    }

    const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    });

    // ... error handling ...

    return data as CreateProjectResponse;
};
```

## Frontend Integration Steps

### 1. Update State (CreateProject.tsx)

```typescript
import { createProject } from '../../services/api';
import { Loader2 } from 'lucide-react';

interface DocumentWithMetadata {
  file: File | null;
  type: string;
  title: string;
}

const [isSubmitting, setIsSubmitting] = useState(false);
const [imageFile, setImageFile] = useState<File | null>(null);
const [documents, setDocuments] = useState<DocumentWithMetadata[]>([]);
```

### 2. Update Handlers

```typescript
const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    setImageFile(e.target.files[0]);
  }
};

const handleDocumentFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    const newDocs = [...documents];
    const file = e.target.files[0];
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    
    newDocs[index] = {
      ...newDocs[index],
      file: file,
      title: newDocs[index].title || fileName
    };
    setDocuments(newDocs);
  }
};

const handleDocumentMetadataChange = (index: number, field: 'type' | 'title', value: string) => {
  const newDocs = [...documents];
  newDocs[index] = { ...newDocs[index], [field]: value };
  setDocuments(newDocs);
};

const addDocumentField = () => {
  setDocuments([...documents, { file: null, type: 'document', title: '' }]);
};

const removeDocumentField = (index: number) => {
  const newDocs = documents.filter((_, i) => i !== index);
  setDocuments(newDocs);
};
```

### 3. Update Submit Handler

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validation
  if (!title.trim() || !description.trim() || !author.trim()) {
    alert('Semua field wajib harus diisi');
    return;
  }

  setIsSubmitting(true);
  try {
    const today = new Date().toISOString().split('T')[0];
    const validDocs = documents.filter(doc => doc.file !== null);
    
    const response = await createProject({
      title,
      category,
      description,
      author,
      date: today,
      jenjang: jenjang.toLowerCase(),
      imageUrl: imageFile || undefined,
      documents: validDocs.length > 0 ? validDocs.map(d => d.file!) : undefined,
      document_types: validDocs.length > 0 ? validDocs.map(d => d.type) : undefined,
      document_titles: validDocs.length > 0 ? validDocs.map(d => d.title) : undefined,
    });

    alert(response.message || 'Proyek berhasil ditambahkan!');
    navigate('/admin/projects');
  } catch (error: any) {
    alert(error.message || 'Gagal menyimpan proyek');
  } finally {
    setIsSubmitting(false);
  }
};
```

### 4. Update UI - Image Upload

```tsx
<div className="md:col-span-2">
  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
    <ImageIcon className="w-4 h-4" /> Gambar Sampul Proyek
  </label>
  <input 
    type="file" 
    accept="image/*"
    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800" 
    onChange={handleImageChange}
  />
  {imageFile && (
    <p className="text-xs text-slate-500 mt-2">📎 {imageFile.name}</p>
  )}
</div>
```

### 5. Update UI - Documents

```tsx
<div className="md:col-span-2">
  <div className="flex justify-between items-center mb-4">
    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
      <FileText className="w-4 h-4" /> Dokumen Pendukung
    </label>
    <button
      type="button"
      onClick={addDocumentField}
      className="flex items-center gap-1 text-xs font-black text-slate-900 hover:text-islamic-gold-600 transition-colors"
    >
      <Plus className="w-4 h-4" /> Tambah Dokumen
    </button>
  </div>
  <div className="space-y-4">
    {documents.length === 0 ? (
      <p className="text-xs text-slate-400 italic py-4 text-center bg-slate-50 rounded-xl border border-slate-100">
        Belum ada dokumen. Klik "Tambah Dokumen" untuk menambahkan.
      </p>
    ) : (
      documents.map((doc, index) => (
        <div key={index} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
          <div className="flex gap-2 items-start">
            <div className="flex-1 space-y-3">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                onChange={(e) => handleDocumentFileChange(index, e)}
              />
              {doc.file && (
                <p className="text-xs text-slate-500 ml-1">📎 {doc.file.name}</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold"
                  value={doc.title}
                  onChange={(e) => handleDocumentMetadataChange(index, 'title', e.target.value)}
                  placeholder="Judul Dokumen"
                />
                <select
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold"
                  value={doc.type}
                  onChange={(e) => handleDocumentMetadataChange(index, 'type', e.target.value)}
                >
                  <option value="document">Document</option>
                  <option value="proposal">Proposal</option>
                  <option value="report">Report</option>
                  <option value="presentation">Presentation</option>
                  <option value="data">Data</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeDocumentField(index)}
              className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))
    )}
  </div>
</div>
```

## Testing dengan Postman

```
Method: POST
URL: http://localhost:8000/api/projects
Headers: Accept: application/json
Body: form-data

Fields:
- title: "Penelitian Energi Terbarukan"
- category: "Penelitian"
- description: "Deskripsi lengkap proyek..."
- author: "Dr. Ahmad Fauzi, M.Pd"
- date: "2024-05-24"
- jenjang: "ma" (lowercase!)
- imageUrl: [Select File]
- documents[]: [Select File 1]
- documents[]: [Select File 2]
- document_types[]: "proposal"
- document_types[]: "report"
- document_titles[]: "Proposal Penelitian"
- document_titles[]: "Laporan Akhir"
```

## Notes

- **API Endpoint**: `/api/projects` (bukan `/projects`)
- **Jenjang Format**: Harus lowercase (tk, mi, smp, ma, stai)
- **Document Arrays**: Harus sinkron (jumlah documents[], document_types[], document_titles[] harus sama)
- **File Types**: Image (jpg, png, gif, svg, webp), Documents (pdf, doc, docx, xls, xlsx, ppt, pptx)
- **Categories**: Penelitian, Pengabdian Masyarakat, Karya Ilmiah, Inovasi, Kompetisi, Lainnya

## Next Steps

1. Update CreateProject.tsx sesuai panduan di atas
2. Test dengan HTML test file yang sudah disediakan
3. Update EditProject.tsx dengan cara yang sama
4. Pastikan ProjectDetail.tsx bisa menampilkan dokumen dengan benar
