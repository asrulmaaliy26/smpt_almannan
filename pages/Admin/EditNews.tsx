
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Sparkles, Wand2, Loader2,
  CheckCircle, Trophy, Plus, Trash2, Image as ImageIcon
} from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { generateNewsArticle } from '../../services/gemini';
import { updateNews, fetchNewsDetail, deleteNewsGalleryImage } from '../../services/api';
import { useLevelConfig } from '../../hooks/useLevelConfig';
import { EducationLevel } from '../../types';

const EditNews: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const LEVEL_CONFIG = useLevelConfig();
  const newsId = parseInt(id || '0');

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [briefSketch, setBriefSketch] = useState('');

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState<'Prestasi' | 'Kegiatan' | 'Akademik' | 'Pengumuman'>('Kegiatan');
  const [level, setLevel] = useState<'Nasional' | 'Internasional' | 'Provinsi' | 'Kabupaten' | 'Kecamatan' | 'Kota' | 'Sekolah'>('Sekolah');
  const DEFAULT_JENJANG = import.meta.env.VITE_DEFAULT_JENJANG || 'UMUM';
  const isLocked = DEFAULT_JENJANG !== 'UMUM';

  const [jenjang, setJenjang] = useState<EducationLevel>('SMA');
  const [content, setContent] = useState('');

  // File upload states
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [existingMainImage, setExistingMainImage] = useState('');
  const [gallery, setGallery] = useState<(File | null)[]>([]);
  const [existingGallery, setExistingGallery] = useState<string[]>([]);

  // Load existing news data
  useEffect(() => {
    const loadNews = async () => {
      try {
        setIsLoading(true);
        const news = await fetchNewsDetail(newsId.toString());
        setTitle(news.title);
        setExcerpt(news.excerpt);
        setCategory(news.category as any);
        setLevel((news.level as any) || 'Nasional');
        setJenjang(news.jenjang);
        setContent(news.content);
        setExistingMainImage(news.main_image);
        setExistingGallery(news.gallery || []);
      } catch (error) {
        console.error('Error loading news:', error);
        alert('Gagal memuat data berita');
      } finally {
        setIsLoading(false);
      }
    };

    if (newsId) {
      loadNews();
    }
  }, [newsId]);

  const handleSmartAIWrite = async () => {
    if (!briefSketch.trim()) {
      alert("Masukkan poin-poin kegiatan terlebih dahulu.");
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateNewsArticle(briefSketch);
      setContent(result);
      // Auto-generate excerpt from first 150 characters
      const autoExcerpt = result.substring(0, 150).trim() + '...';
      setExcerpt(autoExcerpt);
    } catch (error) {
      alert("Maaf, AI gagal menghasilkan berita.");
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
      alert('Gambar berhasil dihapus dari galeri');
    } catch (error: any) {
      console.error('Error deleting gallery image:', error);
      alert(error.message || 'Gagal menghapus gambar');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      alert('Judul harus diisi');
      return;
    }
    if (!excerpt.trim()) {
      alert('Ringkasan harus diisi');
      return;
    }
    if (!content.trim()) {
      alert('Konten harus diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      // Filter out null/empty gallery items
      const validGallery = gallery.filter(file => file !== null && file !== undefined);

      const response = await updateNews({
        id: newsId,
        title,
        excerpt,
        content,
        date: today,
        category,
        jenjang: jenjang.toLowerCase(),
        level: category === 'Prestasi' ? level : undefined,
        main_image: mainImage || undefined,
        gallery: validGallery.length > 0 ? validGallery : undefined,
      });

      // Clear cache to force reload on ManageNews
      sessionStorage.removeItem('admin_news_data');
      sessionStorage.removeItem('admin_news_cats');
      sessionStorage.removeItem('admin_news_timestamp');

      alert(response.message || 'Berita berhasil diperbarui!');
      navigate('/admin/news');
    } catch (error: any) {
      alert(error.message || 'Gagal memperbarui berita');
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
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">Judul Artikel</label>
                <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xl" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">Ringkasan</label>
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
                    onChange={(e) => setCategory(e.target.value as any)}
                  >
                    <option value="Prestasi">Prestasi</option>
                    <option value="Kegiatan">Kegiatan</option>
                    <option value="Akademik">Akademik</option>
                    <option value="Pengumuman">Pengumuman</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">Jenjang Pendidikan</label>
                  <select
                    className={`w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-700 appearance-none outline-none ${isLocked ? 'opacity-75 cursor-not-allowed' : ''}`}
                    value={jenjang}
                    onChange={(e) => setJenjang(e.target.value as any)}
                    disabled={isLocked}
                  >
                    {Object.keys(LEVEL_CONFIG)
                      .filter(key => key !== 'UMUM')
                      .map(key => (
                        <option key={key} value={key}>
                          {key} ({LEVEL_CONFIG[key].type})
                        </option>
                      ))}
                  </select>
                </div>
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
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-xs text-blue-700 font-medium">📷 Gambar saat ini: {existingMainImage.split('/').pop()}</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                  onChange={handleMainImageChange}
                />
                {mainImage && (
                  <p className="text-xs text-slate-500 mt-2">📎 File baru: {mainImage.name}</p>
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
                        <img src={url} alt="Gallery item" className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
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
                            <p className="text-xs text-slate-500 mt-1 ml-1">📎 {file.name}</p>
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
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">Konten Berita</label>
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
          <section className="bg-islamic-green-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2"><Sparkles className="w-6 h-6 text-islamic-gold-500" /> AI Helper</h3>
            <textarea rows={6} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm mb-6" placeholder="Masukkan poin-poin baru untuk rewrite artikel..." value={briefSketch} onChange={(e) => setBriefSketch(e.target.value)}></textarea>
            <button onClick={handleSmartAIWrite} disabled={isGenerating} className="w-full bg-islamic-gold-500 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-islamic-gold-600 transition-all disabled:opacity-50">
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />} Rewrite with AI
            </button>
            <div className="mt-8 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-islamic-green-400">
              <CheckCircle className="w-4 h-4" /> Hasil dapat diedit kembali
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default EditNews;
