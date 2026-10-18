
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Sparkles, Wand2, Loader2,
  CheckCircle, Trophy, Plus, Trash2, Image as ImageIcon
, Eye, X, ExternalLink } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { generateNewsArticle } from '../../services/gemini';
import { updateNews, fetchNewsDetail, deleteNewsGalleryImage, fetchNewsCategories } from '../../services/api';
import { useLevelConfig } from '../../hooks/useLevelConfig';
import { EducationLevel } from '../../types';
import { useToast } from '../../components/ToastProvider';

// Helper to strip HTML tags and decode entities into plain text
const stripHtml = (html?: string) => {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#[0-9]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Helper to extract clean excerpt from content body (skips first heading)
const extractCleanExcerpt = (contentHtml?: string) => {
  if (!contentHtml) return '';
  const contentWithoutHeading = contentHtml.replace(/^<h[1-6][^>]*>.*?<\/h[1-6]>/is, '');
  const plainText = stripHtml(contentWithoutHeading || contentHtml);
  return plainText.substring(0, 160).trim() + (plainText.length > 160 ? '...' : '');
};

const EditNews: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const LEVEL_CONFIG = useLevelConfig();
  const newsId = parseInt(id || '0');
  const toast = useToast();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [briefSketch, setBriefSketch] = useState('');

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState<string>('Kegiatan');
  const [level, setLevel] = useState<'Nasional' | 'Internasional' | 'Provinsi' | 'Kabupaten' | 'Kecamatan' | 'Kota' | 'Sekolah'>('Sekolah');
  const DEFAULT_JENJANG = import.meta.env.VITE_DEFAULT_JENJANG || 'UMUM';
  const isLocked = DEFAULT_JENJANG !== 'UMUM';

  const [jenjang, setJenjang] = useState<EducationLevel>('MA');
  const [lingkupKampus, setLingkupKampus] = useState<'Umum' | 'Spesifik'>('Umum');
  const [fakultas, setFakultas] = useState<string>('');
  const [jurusan, setJurusan] = useState<string>('');
  const [content, setContent] = useState('');

  const FAKULTAS_OPTIONS: Record<string, string[]> = {
    'Ushuluddin': ['Studi Islam', 'Ilmu Al-Quran dan Tafsir'],
    'Tarbiyah': ['Manajemen Pendidikan Islam']
  };

  // File upload states
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [existingMainImage, setExistingMainImage] = useState('');
  const [gallery, setGallery] = useState<(File | null)[]>([]);
  const [existingGallery, setExistingGallery] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fetch categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await fetchNewsCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to default categories
        setCategories(['Prestasi', 'Kegiatan', 'Akademik', 'Pengumuman']);
      }
    };
    loadCategories();
  }, []);

  // Load existing news data
  useEffect(() => {
    const loadNews = async () => {
      try {
        setIsLoading(true);
        const news = await fetchNewsDetail(newsId.toString());
        setTitle(news.title);
        setExcerpt(stripHtml(news.excerpt || extractCleanExcerpt(news.content)));
        setCategory(news.category as any);
        setLevel((news.level as any) || 'Nasional');
        setJenjang(news.jenjang);
        setFakultas(news.fakultas || '');
        setJurusan(news.jurusan || '');
        setLingkupKampus(news.fakultas ? 'Spesifik' : 'Umum');
        setContent(news.content);
        setExistingMainImage(news.main_image);
        setExistingGallery(news.gallery || []);
      } catch (error) {
        console.error('Error loading news:', error);
        toast.error('Gagal memuat data berita');
      } finally {
        setIsLoading(false);
      }
    };

    if (newsId) {
      loadNews();
    }
  }, [newsId]);

    const handleSmartAIWrite = async () => {
    const validGallery = gallery.filter((f): f is File => f !== null && f !== undefined);
    const allImages: (File | string)[] = [];
    if (mainImage) {
      allImages.push(mainImage);
    } else if (existingMainImage) {
      allImages.push(existingMainImage);
    }
    allImages.push(...validGallery);
    if (existingGallery && Array.isArray(existingGallery)) {
      allImages.push(...existingGallery.filter(Boolean));
    }

    if (!briefSketch.trim() && !title.trim() && !excerpt.trim() && allImages.length === 0) {
      toast.warning("Masukkan judul, ringkasan, unggah foto, atau ketik poin kegiatan untuk AI.");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateNewsArticle({
        briefDescription: briefSketch.trim(),
        title: title.trim(),
        category: category,
        excerpt: excerpt.trim(),
        jenjang: jenjang || (typeof DEFAULT_JENJANG !== 'undefined' ? DEFAULT_JENJANG : undefined),
        fakultas: typeof fakultas !== 'undefined' ? fakultas : undefined,
        jurusan: typeof jurusan !== 'undefined' ? jurusan : undefined,
        images: allImages,
      });

      if (result.startsWith("Gagal") || result.startsWith("Maaf")) {
        toast.error(result);
        return;
      }

      setContent(result);

      // Auto-extract title if title is empty or default
      const match = result.match(/<h3>(.*?)<\/h3>/i);
      if (match && match[1] && (!title.trim() || title === 'Judul Baru')) {
        setTitle(stripHtml(match[1]));
      }

      // Auto-generate clean excerpt from content body
      const cleanExcerpt = extractCleanExcerpt(result);
      if (!excerpt.trim() || excerpt.includes('<')) {
        setExcerpt(cleanExcerpt);
      }

      toast.success(
        allImages.length > 0
          ? `Berhasil membuat berita berdasarkan analisis ${allImages.length} foto & konteks kegiatan!`
          : "Berita berhasil dibuat oleh AI!"
      );
    } catch (error: any) {
      toast.error("Maaf, AI gagal menghasilkan berita: " + (error?.message || "Silakan coba lagi"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMainImage(e.target.files[0]);
    }
  };

  const handleGalleryChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newGallery = [...gallery];
      newGallery[index] = e.target.files[0];
      setGallery(newGallery);
    }
  };

  const addGalleryField = () => {
    setGallery([...gallery, null]);
  };

  const removeGalleryField = (index: number) => {
    const newGallery = gallery.filter((_, i) => i !== index);
    setGallery(newGallery);
  };

  const handleDeleteExistingGalleryImage = async (imageUrl: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus gambar ini dari galeri?')) return;

    try {
      await deleteNewsGalleryImage(newsId, imageUrl);
      // Remove from state
      setExistingGallery(prev => prev.filter(img => img !== imageUrl));
      toast.success('Gambar berhasil dihapus dari galeri');
    } catch (error: any) {
      console.error('Error deleting gallery image:', error);
      toast.error(error.message || 'Gagal menghapus gambar');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      toast.warning('Judul harus diisi');
      return;
    }
    if (!content.trim()) {
      toast.warning('Konten harus diisi');
      return;
    }

    // Auto-generate excerpt if empty
    let finalExcerpt = stripHtml(excerpt);
    if (!finalExcerpt) {
      const strippedContent = content.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#[0-9]+;/g, ' ').replace(/\s+/g, ' ').trim();
      finalExcerpt = strippedContent.substring(0, 150) + (strippedContent.length > 150 ? '...' : '');
      setExcerpt(finalExcerpt);
    }

    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      // Filter out null/empty gallery items
      const validGallery = gallery.filter(file => file !== null && file !== undefined);

      // If no main image selected and no existing image, use default logosmp.png
      let finalMainImage: File | undefined = mainImage || undefined;
      if (!finalMainImage && !existingMainImage) {
        try {
          const res = await fetch('/logosmp.png');
          const blob = await res.blob();
          finalMainImage = new File([blob], 'logosmp.png', { type: blob.type || 'image/png' });
        } catch {
          finalMainImage = undefined;
        }
      }

      const response = await updateNews({
        id: newsId,
        title,
        excerpt: finalExcerpt,
        content,
        date: today,
        category,
        jenjang: jenjang,
        fakultas: jenjang === 'KAMPUS' && lingkupKampus === 'Spesifik' ? fakultas : undefined,
        jurusan: jenjang === 'KAMPUS' && lingkupKampus === 'Spesifik' ? jurusan : undefined,
        level: category === 'Prestasi' ? level : undefined,
        main_image: finalMainImage,
        gallery: validGallery.length > 0 ? validGallery : undefined,
      });

      // Clear cache to force reload on ManageNews
      sessionStorage.removeItem('admin_news_data');
      sessionStorage.removeItem('admin_news_cats');
      sessionStorage.removeItem('admin_news_timestamp');

      toast.success(response.message || 'Berita berhasil diperbarui!');
      navigate('/admin/news');
    } catch (error: any) {
      toast.error(error.message || 'Gagal memperbarui berita');
      console.error('Error updating news:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto w-full flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-islamic-green-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Memuat data berita...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <Link to="/admin/news" className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-islamic-green-600 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Edit Warta</h1>
            <p className="text-slate-500 font-medium">Perbarui informasi artikel Anda.</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-islamic-green-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-islamic-green-800 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-islamic-gold-500" /> Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 text-islamic-gold-500" /> Simpan Perubahan
            </>
          )}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
            <div className="space-y-8">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">Judul Artikel <span className="text-red-500 text-sm">*</span></label>
                <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xl" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

                            <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Ringkasan</label>
                  <button
                    type="button"
                    onClick={() => {
                      const sourceText = content || excerpt;
                      if (!sourceText.trim()) {
                        toast.warning("Konten masih kosong.");
                        return;
                      }
                      setExcerpt(extractCleanExcerpt(sourceText));
                      toast.success("Ringkasan berhasil dibersihkan / diekstrak!");
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 transition-colors bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-sm"
                    title="Bersihkan tag HTML dan ekstrak ringkasan dari konten"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Bersihkan / Ekstrak dari Konten
                  </button>
                </div>
                <textarea
                  rows={3}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Ringkasan singkat berita..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">Kategori Konten</label>
                  <select
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-700 appearance-none outline-none"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))
                    ) : (
                      <option value="">Loading...</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">Jenjang Pendidikan</label>
                  <select
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-700 appearance-none outline-none"
                    value={jenjang}
                    onChange={(e) => setJenjang(e.target.value as any)}
                  >
                    {isLocked ? (
                      // When locked, show only env jenjang and UMUM
                      <>
                        <option value={DEFAULT_JENJANG}>
                          {LEVEL_CONFIG[DEFAULT_JENJANG]?.name || DEFAULT_JENJANG}
                        </option>
                        <option value="UMUM">
                          {LEVEL_CONFIG['UMUM']?.name || 'Yayasan AL Mannan'}
                        </option>
                      </>
                    ) : (
                      // When not locked, show all jenjang
                      Object.keys(LEVEL_CONFIG).map(key => (
                        <option key={key} value={key}>
                          {LEVEL_CONFIG[key].name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                {jenjang === 'KAMPUS' && (
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">
                        Lingkup Kampus
                      </label>
                      <select
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-700 appearance-none outline-none"
                        value={lingkupKampus}
                        onChange={(e) => {
                          const val = e.target.value as 'Umum' | 'Spesifik';
                          setLingkupKampus(val);
                          if (val === 'Umum') {
                             setFakultas('');
                             setJurusan('');
                          } else {
                             setFakultas('Ushuluddin');
                             setJurusan(FAKULTAS_OPTIONS['Ushuluddin'][0]);
                          }
                        }}
                      >
                        <option value="Umum">Umum Kampus</option>
                        <option value="Spesifik">Spesifik Jurusan</option>
                      </select>
                    </div>
                    {lingkupKampus === 'Spesifik' && (
                      <>
                        <div>
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">
                            Fakultas
                          </label>
                          <select
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-700 appearance-none outline-none"
                            value={fakultas}
                            onChange={(e) => {
                              setFakultas(e.target.value);
                              setJurusan(FAKULTAS_OPTIONS[e.target.value][0] || '');
                            }}
                          >
                            {Object.keys(FAKULTAS_OPTIONS).map(f => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">
                            Jurusan
                          </label>
                          <select
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-700 appearance-none outline-none"
                            value={jurusan}
                            onChange={(e) => setJurusan(e.target.value)}
                          >
                            {fakultas && FAKULTAS_OPTIONS[fakultas]?.map(j => (
                              <option key={j} value={j}>{j}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                )}
                {category === 'Prestasi' && (
                  <div>
                    <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                      <Trophy className="w-4 h-4 text-islamic-gold-500" /> Tingkat Prestasi
                    </label>
                    <select
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-700 appearance-none outline-none"
                      value={level}
                      onChange={(e) => setLevel(e.target.value as any)}
                    >
                      <option value="Nasional">Nasional</option>
                      <option value="Internasional">Internasional</option>
                      <option value="Provinsi">Provinsi</option>
                      <option value="Kabupaten">Kabupaten</option>
                      <option value="Kecamatan">Kecamatan</option>
                      <option value="Kota">Kota</option>
                      <option value="Sekolah">Sekolah</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Main Image Upload */}
              <div>
                <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                  <ImageIcon className="w-4 h-4" /> Gambar Utama
                </label>
                {existingMainImage && !mainImage && (
                  <div className="mb-3 p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-4">
                    <div 
                      className="relative group cursor-pointer w-16 h-16 rounded-xl overflow-hidden border border-blue-300 shadow-sm flex-shrink-0"
                      onClick={() => setPreviewImage(existingMainImage)}
                      title="Klik untuk melihat foto ukuran penuh"
                    >
                      <img src={existingMainImage} alt="Gambar Utama" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Eye className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-blue-900 font-bold mb-0.5">📷 Gambar Utama Saat Ini</p>
                      <p className="text-[11px] text-blue-700 truncate max-w-xs">{existingMainImage.split('/').pop()}</p>
                      <button
                        type="button"
                        onClick={() => setPreviewImage(existingMainImage)}
                        className="mt-1 text-xs font-bold text-blue-800 hover:text-blue-950 underline flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Klik untuk melihat foto penuh
                      </button>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                  onChange={handleMainImageChange}
                />
                {mainImage && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                    <div 
                      className="relative group cursor-pointer w-14 h-14 rounded-xl overflow-hidden border border-emerald-300 shadow-sm flex-shrink-0"
                      onClick={() => setPreviewImage(URL.createObjectURL(mainImage))}
                      title="Klik untuk melihat foto ukuran penuh"
                    >
                      <img 
                        src={URL.createObjectURL(mainImage)} 
                        alt="Preview File Baru" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Eye className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-emerald-900 font-bold mb-0.5">📎 File Baru Dipilih:</p>
                      <p className="text-[11px] text-emerald-700 truncate max-w-xs">{mainImage.name}</p>
                      <button
                        type="button"
                        onClick={() => setPreviewImage(URL.createObjectURL(mainImage))}
                        className="mt-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Klik untuk melihat pratinjau
                      </button>
                    </div>
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-2">Upload gambar baru untuk mengganti gambar yang ada</p>
              </div>

              {/* Gallery Upload */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                    <ImageIcon className="w-4 h-4" /> Galeri Foto
                  </label>
                  <button
                    type="button"
                    onClick={addGalleryField}
                    className="flex items-center gap-1 text-xs font-black text-slate-900 hover:text-islamic-gold-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Tambah Foto
                  </button>
                </div>

                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-xs text-blue-700 font-medium mb-2">📷 Galeri saat ini ({existingGallery.length} foto):</p>
                  <div className="flex flex-wrap gap-3">
                    {existingGallery.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <div 
                          className="cursor-pointer w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative group/thumb"
                          onClick={() => setPreviewImage(url)}
                          title="Klik untuk melihat foto ukuran penuh"
                        >
                          <img src={url} alt="Gallery item" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white rounded-xl">
                            <Eye className="w-5 h-5" />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteExistingGalleryImage(url)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                          title="Hapus gambar ini"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {gallery.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4 text-center bg-slate-50 rounded-xl border border-slate-100">
                      Belum ada foto galeri baru. Klik "Tambah Foto" untuk menambahkan.
                    </p>
                  ) : (
                    gallery.map((file, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                            onChange={(e) => handleGalleryChange(index, e)}
                          />
                          {file && (
                            <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
                              <div
                                className="relative group cursor-pointer w-10 h-10 rounded-lg overflow-hidden border border-emerald-300 flex-shrink-0 shadow-sm"
                                onClick={() => setPreviewImage(URL.createObjectURL(file))}
                                title="Klik untuk melihat foto ukuran penuh"
                              >
                                <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <Eye className="w-3.5 h-3.5" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-emerald-900 truncate">{file.name}</p>
                                <button
                                  type="button"
                                  onClick={() => setPreviewImage(URL.createObjectURL(file))}
                                  className="text-[10px] text-emerald-800 font-bold hover:underline"
                                >
                                  Lihat foto
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeGalleryField(index)}
                          className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">Konten Berita <span className="text-red-500 text-sm">*</span></label>
                <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] overflow-hidden">
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                        ['link', 'image'],
                        ['clean']
                      ],
                    }}
                    formats={[
                      'header',
                      'bold', 'italic', 'underline', 'strike', 'blockquote',
                      'list', 'bullet', 'indent',
                      'link', 'image'
                    ]}
                    className="h-96 mb-12"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
                <div className="space-y-8">
          <section className="bg-islamic-green-900 rounded-[3rem] p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black flex items-center gap-2.5">
                <Sparkles className="w-6 h-6 text-islamic-gold-500 animate-pulse" /> AI News Assistant
              </h3>
              <span className="text-[10px] bg-white/10 text-islamic-gold-400 font-bold px-3 py-1 rounded-full border border-white/10 uppercase tracking-widest">
                Multimodal AI
              </span>
            </div>
            
            <p className="text-xs text-islamic-green-200 mb-6 leading-relaxed">
              AI otomatis membaca <strong>semua foto yang diunggah</strong>, judul, ringkasan, dan kategori sebagai <em>base prompt</em>.
            </p>

            {/* Base Prompt Status Indicator */}
            <div className="bg-black/20 rounded-2xl p-4 mb-6 border border-white/10 space-y-2 text-xs">
              <p className="font-bold text-islamic-gold-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" /> Konteks Dasar (Base Prompt)
              </p>
              <div className="space-y-1.5 text-slate-200">
                <p className="truncate"><span className="text-white/60">Judul:</span> {title.trim() ? title : <span className="text-white/40 italic">Otomatis dari AI</span>}</p>
                <p><span className="text-white/60">Kategori:</span> <span className="font-semibold text-emerald-300">{category || 'Kegiatan'}</span></p>
                <p className="flex items-center gap-2">
                  <span className="text-white/60">Foto Terdeteksi:</span>
                  {(() => {
                    const totalPhotos = (mainImage ? 1 : (existingMainImage ? 1 : 0)) +
                      gallery.filter(Boolean).length +
                      (existingGallery ? existingGallery.length : 0);
                    return (
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                        totalPhotos > 0
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white/10 text-white/50'
                      }`}>
                        📷 {totalPhotos} foto siap dianalisis
                      </span>
                    );
                  })()}
                </p>
                {excerpt.trim() && (
                  <p className="line-clamp-2 text-white/70 italic text-[11px]">
                    "{excerpt}"
                  </p>
                )}
              </div>
            </div>

            {/* Additional Prompt Input */}
            <label className="text-xs font-bold text-slate-300 block mb-2">
              Poin / Instruksi Tambahan (Opsional)
            </label>
            <textarea
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-islamic-gold-500 mb-6"
              placeholder="Tambahkan poin khusus jika ada (contoh: 'Tekankan pesan dari kepala sekolah', 'Sebutkan juara diraih oleh...'). Jika kosong, AI akan langsung menganalisis foto dan data di atas..."
              value={briefSketch}
              onChange={(e) => setBriefSketch(e.target.value)}
            ></textarea>

            <button
              onClick={handleSmartAIWrite}
              disabled={isGenerating}
              className="w-full bg-islamic-gold-500 text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-islamic-gold-400 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                  <span>AI Menganalisis Foto & Menulis...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 text-slate-950" />
                  <span>Buat Berita dengan AI</span>
                </>
              )}
            </button>

            <div className="mt-6 flex items-center justify-between text-[10px] font-bold text-islamic-green-300">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Analisis Visual Gambar</span>
              <span>Hasil dapat diedit</span>
            </div>
          </section>
        </div>
        </div>
{/* Modal Lightbox untuk Melihat Foto Penuh */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[92vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/20 p-3 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex justify-between items-center px-4 py-2 border-b border-white/10 text-white mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" /> Pratinjau Foto Penuh
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={previewImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
                  title="Buka ukuran asli di tab baru"
                >
                  <ExternalLink className="w-4 h-4" /> Buka Ukuran Asli
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="p-2 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-colors"
                  title="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="overflow-auto max-h-[80vh] w-full flex items-center justify-center p-2">
              <img
                src={previewImage}
                alt="Preview Foto"
                className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditNews;
