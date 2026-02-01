# 🎨 Toast Notification System - Migration Guide

## ✅ Setup Selesai!

ToastProvider sudah ditambahkan ke `App.tsx`. Sekarang Anda bisa menggunakan toast notifications di seluruh aplikasi!

## 📖 Cara Menggunakan

### 1. Import useToast Hook

```tsx
import { useToast } from '../../components/ToastProvider';
```

### 2. Gunakan di Component

```tsx
const MyComponent = () => {
  const toast = useToast();
  
  // Success notification
  toast.success('Data berhasil disimpan!');
  
  // Error notification
  toast.error('Gagal menyimpan data');
  
  // Warning notification
  toast.warning('Peringatan: Data akan dihapus');
  
  // Info notification
  toast.info('Informasi penting');
  
  return <div>...</div>;
};
```

## 🔄 Migration: Mengganti alert() dengan Toast

### Sebelum (menggunakan alert):
```tsx
alert('Berita berhasil ditambahkan!');
alert('Gagal menyimpan berita');
```

### Sesudah (menggunakan toast):
```tsx
const toast = useToast();

toast.success('Berita berhasil ditambahkan!');
toast.error('Gagal menyimpan berita');
```

## 📝 Contoh Lengkap - CreateNews.tsx

```tsx
import React, { useState, useContext, useEffect } from 'react';
import { useToast } from '../../components/ToastProvider'; // TAMBAHKAN INI

const CreateNews: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast(); // TAMBAHKAN INI
  
  const handleSmartAIWrite = async () => {
    if (!briefSketch.trim()) {
      toast.warning("Masukkan poin-poin kegiatan terlebih dahulu."); // GANTI alert
      return;
    }
    
    try {
      const result = await generateNewsArticle(briefSketch);
      setContent(result);
    } catch (error) {
      toast.error("Maaf, AI gagal menghasilkan berita. Silakan coba lagi."); // GANTI alert
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!title.trim()) {
      toast.warning('Judul harus diisi'); // GANTI alert
      return;
    }
    if (!excerpt.trim()) {
      toast.warning('Ringkasan harus diisi'); // GANTI alert
      return;
    }
    if (!content.trim()) {
      toast.warning('Konten harus diisi'); // GANTI alert
      return;
    }
    
    try {
      const response = await createNews({...});
      
      // Clear cache
      sessionStorage.removeItem('admin_news_data');
      sessionStorage.removeItem('admin_news_cats');
      sessionStorage.removeItem('admin_news_timestamp');
      
      toast.success(response.message || 'Berita berhasil ditambahkan!'); // GANTI alert
      navigate('/admin/news');
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan berita'); // GANTI alert
    }
  };
  
  return (...);
};
```

## 🎯 Panduan Pemilihan Tipe Toast

| Situasi | Tipe Toast | Contoh |
|---------|-----------|--------|
| Operasi berhasil | `success` | "Data berhasil disimpan!" |
| Operasi gagal | `error` | "Gagal menyimpan data" |
| Validasi form | `warning` | "Judul harus diisi" |
| Informasi umum | `info` | "Memproses data..." |

## 📋 Daftar File yang Perlu Diupdate

### Admin Pages (Priority)
- [x] `ToastProvider.tsx` - Sudah dibuat ✅
- [x] `App.tsx` - Sudah ditambahkan ✅
- [ ] `pages/Admin/CreateNews.tsx` - 7 alert()
- [ ] `pages/Admin/EditNews.tsx` - 10 alert()
- [ ] `pages/Admin/CreateProject.tsx` - 5 alert()
- [ ] `pages/Admin/EditProject.tsx` - 9 alert()
- [ ] `pages/Admin/CreateJournal.tsx` - 7 alert()
- [ ] `pages/Admin/EditJournal.tsx` - 7 alert()
- [ ] `pages/Admin/ManageNews.tsx` - 2 alert()
- [ ] `pages/Admin/ManageProjects.tsx` - 2 alert()
- [ ] `pages/Admin/ManageJournals.tsx` - 2 alert()

## 🚀 Quick Replace Pattern

Gunakan Find & Replace di VS Code:

**Find (Regex):**
```
alert\('([^']+)'\);
```

**Replace:**
```
toast.error('$1');
```

Kemudian sesuaikan tipe toast (success/error/warning/info) sesuai konteks.

## 🎨 Fitur Toast

- ✅ Auto-dismiss setelah 4 detik
- ✅ Tombol close manual
- ✅ Animasi slide-in yang smooth
- ✅ Gradient background yang cantik
- ✅ Icon sesuai tipe notifikasi
- ✅ Stacking multiple toasts
- ✅ Responsive design

## 💡 Tips

1. **Validation errors** → gunakan `warning`
2. **Success operations** → gunakan `success`
3. **Failed operations** → gunakan `error`
4. **General info** → gunakan `info`
5. Pesan harus **jelas dan singkat**
6. Gunakan **bahasa yang konsisten**

---

Selamat menggunakan sistem notifikasi yang lebih cantik! 🎉
