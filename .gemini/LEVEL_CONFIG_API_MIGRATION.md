# Migrasi LEVEL_CONFIG ke API Dinamis

## Ringkasan Perubahan

`LEVEL_CONFIG` yang sebelumnya berupa konstanta statis telah diganti dengan data dinamis dari API menggunakan React Context.

## File yang Diubah

### 1. **Types** (`types.ts`)
- ✅ Menambahkan interface `LevelConfigItem`
- ✅ Menambahkan type `LevelConfigData`

### 2. **API Service** (`services/api.ts`)
- ✅ Menambahkan fungsi `fetchLevelConfig()` untuk mengambil data jenjang dari API

### 3. **App Context** (`App.tsx`)
- ✅ Menambahkan `LevelConfigContext` untuk menyimpan data level config
- ✅ Menambahkan state `levelConfig` 
- ✅ Menambahkan `useEffect` untuk load data saat app mount
- ✅ Wrap aplikasi dengan `LevelConfigContext.Provider`

### 4. **Custom Hook** (`hooks/useLevelConfig.ts`)
- ✅ Membuat hook `useLevelConfig()` untuk akses mudah ke level config
- ✅ Menyediakan fallback default jika API belum loaded

### 5. **Halaman yang Diupdate**
- ✅ `pages/Home.tsx` - menggunakan `useLevelConfig()`
- ✅ `pages/Projects.tsx` - menggunakan `useLevelConfig()`
- ✅ `pages/Journals.tsx` - menggunakan `useLevelConfig()`
- ✅ `pages/News.tsx` - menggunakan `useLevelConfig()`
- ✅ `pages/About.tsx` - menggunakan `useLevelConfig()`
- ✅ `pages/Facilities.tsx` - menggunakan `useLevelConfig()`
- ✅ `components/Navbar.tsx` - menggunakan `useLevelConfig()`

### 6. **Constants** (`constants.tsx`)
- ✅ Menghapus konstanta statis `LEVEL_CONFIG`

## Struktur API

### Endpoint
```
GET http://localhost:8000/jenjang
```

### Response Format
```json
{
  "MI": {
    "color": "emerald",
    "name": "MI AL Hidayah",
    "bg": "bg-emerald-600",
    "text": "text-emerald-600",
    "type": "Madrasah Ibtidaiyah"
  },
  "SMP": {
    "color": "sky",
    "name": "SMP AL Hidayah",
    "bg": "bg-sky-600",
    "text": "text-sky-600",
    "type": "Sekolah Menengah Pertama"
  },
  "SMA": {
    "color": "islamic-green",
    "name": "SMA AL Hidayah",
    "bg": "bg-islamic-green-600",
    "text": "text-islamic-green-600",
    "type": "Sekolah Menengah Atas"
  },
  "KAMPUS": {
    "color": "indigo",
    "name": "STAI AL Hidayah",
    "bg": "bg-indigo-600",
    "text": "text-indigo-600",
    "type": "Sekolah Tinggi Agama Islam"
  },
  "UMUM": {
    "color": "slate",
    "name": "Yayasan AL Mannan",
    "bg": "bg-slate-900",
    "text": "text-slate-900",
    "type": "Pusat Yayasan"
  }
}
```

## Cara Penggunaan

### Di Komponen React

```typescript
import { useLevelConfig } from '../hooks/useLevelConfig';

const MyComponent = () => {
  const LEVEL_CONFIG = useLevelConfig();
  const { activeLevel } = useContext(LevelContext);
  
  const theme = LEVEL_CONFIG[activeLevel];
  
  return (
    <div className={theme.bg}>
      <h1>{theme.name}</h1>
    </div>
  );
};
```

### Fallback Behavior

Hook `useLevelConfig()` menyediakan fallback ke nilai default jika:
- API belum selesai loading
- Terjadi error saat fetch
- Context belum tersedia

Ini memastikan aplikasi tetap berfungsi meskipun ada masalah dengan API.

## Keuntungan

1. **Fleksibilitas** - Konfigurasi jenjang dapat diubah dari backend tanpa rebuild
2. **Konsistensi** - Satu sumber data untuk semua konfigurasi jenjang
3. **Performance** - Data di-load sekali saat app mount, lalu di-share via Context
4. **Reliability** - Fallback ke default values jika API gagal
5. **Developer Experience** - Hook yang mudah digunakan

## Arsitektur

```
API (http://localhost:8000/jenjang)
    ↓
fetchLevelConfig() [services/api.ts]
    ↓
App.tsx (load on mount)
    ↓
LevelConfigContext.Provider
    ↓
useLevelConfig() hook
    ↓
Components (Projects, Journals, News, etc.)
```

## Migration Notes

Komponen yang sebelumnya menggunakan:
```typescript
import { LEVEL_CONFIG } from '../constants';
```

Sekarang menggunakan:
```typescript
import { useLevelConfig } from '../hooks/useLevelConfig';

const LEVEL_CONFIG = useLevelConfig();
```

Tidak ada perubahan pada cara penggunaan `LEVEL_CONFIG` di dalam komponen.
