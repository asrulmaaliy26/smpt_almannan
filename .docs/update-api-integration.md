# Update API Integration (News, Projects, Journals)

## Overview
API functions untuk update (PUT) News, Projects, dan Journals telah ditambahkan ke `services/api.ts`. Semua menggunakan FormData untuk mendukung file upload.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/news/{id}` | Update berita |
| PUT | `/api/projects/{id}` | Update proyek |
| PUT | `/api/journals/{id}` | Update jurnal |

## Common Headers
- **Content-Type**: `multipart/form-data` (auto-set by browser)
- **Accept**: `application/json`

---

## 1. Update News

### API Function

```typescript
export interface UpdateNewsPayload extends CreateNewsPayload {
    id: number;
}

export const updateNews = async (payload: UpdateNewsPayload): Promise<CreateNewsResponse> => {
    const formData = new FormData();

    formData.append('title', payload.title);
    formData.append('excerpt', payload.excerpt);
    formData.append('content', payload.content);
    formData.append('date', payload.date);
    formData.append('category', payload.category);
    formData.append('jenjang', payload.jenjang);

    if (payload.level) {
        formData.append('level', payload.level);
    }

    if (payload.main_image) {
        formData.append('main_image', payload.main_image);
    }

    if (payload.gallery && payload.gallery.length > 0) {
        payload.gallery.forEach((file) => {
            formData.append('gallery[]', file);
        });
    }

    const response = await fetch(`${API_BASE_URL}/api/news/${payload.id}`, {
        method: 'PUT',
        body: formData,
        headers: { 'Accept': 'application/json' }
    });

    // ... error handling ...

    return data as CreateNewsResponse;
};
```

### Usage Example

```typescript
import { updateNews } from '../../services/api';

const handleUpdate = async () => {
  try {
    const response = await updateNews({
      id: newsId,
      title,
      excerpt,
      content,
      date: new Date().toISOString().split('T')[0],
      category,
      jenjang: jenjang.toLowerCase(),
      level: category === 'Prestasi' ? level : undefined,
      main_image: mainImageFile || undefined,
      gallery: validGallery.length > 0 ? validGallery : undefined,
    });

    alert(response.message || 'Berita berhasil diupdate!');
    navigate('/admin/news');
  } catch (error: any) {
    alert(error.message || 'Gagal mengupdate berita');
  }
};
```

---

## 2. Update Project

### API Function

```typescript
export interface UpdateProjectPayload extends CreateProjectPayload {
    id: number;
}

export const updateProject = async (payload: UpdateProjectPayload): Promise<CreateProjectResponse> => {
    const formData = new FormData();

    formData.append('title', payload.title);
    formData.append('category', payload.category);
    formData.append('description', payload.description);
    formData.append('author', payload.author);
    formData.append('date', payload.date);
    formData.append('jenjang', payload.jenjang);

    if (payload.imageUrl) {
        formData.append('imageUrl', payload.imageUrl);
    }

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

    const response = await fetch(`${API_BASE_URL}/api/projects/${payload.id}`, {
        method: 'PUT',
        body: formData,
        headers: { 'Accept': 'application/json' }
    });

    // ... error handling ...

    return data as CreateProjectResponse;
};
```

### Usage Example

```typescript
import { updateProject } from '../../services/api';

const handleUpdate = async () => {
  try {
    const validDocs = documents.filter(doc => doc.file !== null);
    
    const response = await updateProject({
      id: projectId,
      title,
      category,
      description,
      author,
      date: new Date().toISOString().split('T')[0],
      jenjang: jenjang.toLowerCase(),
      imageUrl: imageFile || undefined,
      documents: validDocs.length > 0 ? validDocs.map(d => d.file!) : undefined,
      document_types: validDocs.length > 0 ? validDocs.map(d => d.type) : undefined,
      document_titles: validDocs.length > 0 ? validDocs.map(d => d.title) : undefined,
    });

    alert(response.message || 'Proyek berhasil diupdate!');
    navigate('/admin/projects');
  } catch (error: any) {
    alert(error.message || 'Gagal mengupdate proyek');
  }
};
```

---

## 3. Update Journal

### API Function

```typescript
export interface UpdateJournalPayload extends CreateJournalPayload {
    id: number;
}

export const updateJournal = async (payload: UpdateJournalPayload): Promise<CreateJournalResponse> => {
    const formData = new FormData();

    formData.append('title', payload.title);
    formData.append('category', payload.category);
    formData.append('abstract', payload.abstract);
    formData.append('author', payload.author);
    formData.append('mentor', payload.mentor);
    formData.append('score', payload.score.toString());
    formData.append('date', payload.date);
    formData.append('jenjang', payload.jenjang);
    formData.append('is_best', payload.is_best ? '1' : '0');

    if (payload.documentUrl) {
        formData.append('documentUrl', payload.documentUrl);
    }

    const response = await fetch(`${API_BASE_URL}/api/journals/${payload.id}`, {
        method: 'PUT',
        body: formData,
        headers: { 'Accept': 'application/json' }
    });

    // ... error handling ...

    return data as CreateJournalResponse;
};
```

### Usage Example

```typescript
import { updateJournal } from '../../services/api';

const handleUpdate = async () => {
  try {
    const response = await updateJournal({
      id: journalId,
      title,
      category,
      abstract,
      author,
      mentor,
      score,
      date: new Date().toISOString().split('T')[0],
      jenjang: jenjang.toLowerCase(),
      is_best: isBest,
      documentUrl: documentFile || undefined,
    });

    alert(response.message || 'Jurnal berhasil diupdate!');
    navigate('/admin/journals');
  } catch (error: any) {
    alert(error.message || 'Gagal mengupdate jurnal');
  }
};
```

---

## Frontend Implementation Guide

### Steps to Update Edit Pages

1. **Import Update Function**
   ```typescript
   import { updateNews, fetchNewsById } from '../../services/api';
   // or updateProject, updateJournal
   ```

2. **Get ID from URL**
   ```typescript
   import { useParams } from 'react-router-dom';
   
   const { id } = useParams<{ id: string }>();
   const newsId = parseInt(id || '0');
   ```

3. **Load Existing Data**
   ```typescript
   useEffect(() => {
     const loadData = async () => {
       try {
         const data = await fetchNewsById(newsId);
         setTitle(data.title);
         setExcerpt(data.excerpt);
         setContent(data.content);
         // ... set other fields
       } catch (error) {
         console.error('Error loading data:', error);
       }
     };
     loadData();
   }, [newsId]);
   ```

4. **Update Submit Handler**
   ```typescript
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     
     setIsSubmitting(true);
     try {
       const response = await updateNews({
         id: newsId,
         // ... all fields
       });
       
       alert(response.message || 'Berhasil diupdate!');
       navigate('/admin/news');
     } catch (error: any) {
       alert(error.message || 'Gagal mengupdate');
     } finally {
       setIsSubmitting(false);
     }
   };
   ```

5. **Update Button Text**
   ```tsx
   <button onClick={handleSubmit} disabled={isSubmitting}>
     {isSubmitting ? (
       <>
         <Loader2 className="w-5 h-5 animate-spin" /> Mengupdate...
       </>
     ) : (
       <>
         <Save className="w-5 h-5" /> Update
       </>
     )}
   </button>
   ```

---

## Key Differences: Create vs Update

| Aspect | Create | Update |
|--------|--------|--------|
| **Method** | POST | PUT |
| **Endpoint** | `/api/news` | `/api/news/{id}` |
| **ID Required** | ❌ | ✅ |
| **Load Data** | ❌ | ✅ (useEffect) |
| **Files** | Always new | Optional (only if changed) |
| **Button Text** | "Simpan" | "Update" |

---

## Important Notes

### 🔄 File Handling in Update

- **Files are OPTIONAL** in update - only send if user uploads new file
- If no new file uploaded, backend should keep existing file
- Frontend should show existing file info (filename, URL) but allow replacement

### 📝 Best Practices

1. **Load existing data** on component mount
2. **Show existing file info** (e.g., "Current: image.jpg")
3. **Allow file replacement** with new upload
4. **Validate before submit** (same as create)
5. **Handle errors gracefully**
6. **Show loading state** during update

### ⚠️ Backend Requirements

Backend should handle:
- Keeping existing files if no new file provided
- Replacing files if new file provided
- Validating file types and sizes
- Returning updated data in response

---

## Testing with Postman

### Update News
```
Method: PUT
URL: http://localhost:8000/api/news/1
Headers: Accept: application/json
Body: form-data

Fields:
- title: "Updated Title"
- excerpt: "Updated excerpt..."
- content: "Updated content..."
- date: "2024-05-24"
- category: "Prestasi"
- jenjang: "ma"
- level: "Nasional"
- main_image: [Select File] (optional - only if changing)
- gallery[]: [Select Files] (optional - only if changing)
```

### Update Project
```
Method: PUT
URL: http://localhost:8000/api/projects/1
Headers: Accept: application/json
Body: form-data

Fields:
- title: "Updated Project Title"
- category: "Penelitian"
- description: "Updated description..."
- author: "Updated Author"
- date: "2024-05-24"
- jenjang: "stai"
- imageUrl: [Select File] (optional)
- documents[]: [Select Files] (optional)
- document_types[]: "proposal"
- document_titles[]: "Updated Proposal"
```

### Update Journal
```
Method: PUT
URL: http://localhost:8000/api/journals/1
Headers: Accept: application/json
Body: form-data

Fields:
- title: "Updated Journal Title"
- category: "Ekonomi Syariah"
- abstract: "Updated abstract..."
- author: "Updated Author"
- mentor: "Updated Mentor"
- score: 95
- date: "2024-05-24"
- jenjang: "stai"
- is_best: 1
- documentUrl: [Select PDF] (optional)
```

---

## Summary

✅ **API Functions Created**:
- `updateNews()` - PUT /api/news/{id}
- `updateProject()` - PUT /api/projects/{id}
- `updateJournal()` - PUT /api/journals/{id}

✅ **All functions support**:
- FormData for file uploads
- Optional file fields (only send if changed)
- Same validation as create
- Proper error handling

⚠️ **Next Steps**:
1. Update EditNews.tsx to use `updateNews()`
2. Update EditProject.tsx to use `updateProject()`
3. Update EditJournal.tsx to use `updateJournal()`
4. Add data loading on mount
5. Show existing file info
6. Test with backend API
