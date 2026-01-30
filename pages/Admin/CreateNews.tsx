
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Sparkles,
  Wand2,
  Loader2,
  Image as ImageIcon,
  Tag,
  AlignLeft,
  CheckCircle,
  FileText,
  Trophy,
  Plus,
  Trash2,
  Layers
} from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { generateNewsArticle } from '../../services/gemini';
import { createNews } from '../../services/api';
import { EducationLevel } from '../../types';
import { LevelContext } from '../../App';
import { useLevelConfig } from '../../hooks/useLevelConfig';

const CreateNews: React.FC = () => {
  const navigate = useNavigate();
  const { activeLevel } = useContext(LevelContext);
  const LEVEL_CONFIG = useLevelConfig();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [briefSketch, setBriefSketch] = useState('');

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState<'Prestasi' | 'Kegiatan' | 'Akademik' | 'Pengumuman'>('Kegiatan');
  const [level, setLevel] = useState<'Nasional' | 'Internasional' | 'Provinsi' | 'Kabupaten' | 'Kecamatan' | 'Kota' | 'Sekolah'>('Sekolah');
  const DEFAULT_JENJANG = import.meta.env.VITE_DEFAULT_JENJANG || 'UMUM';
  const isLocked = DEFAULT_JENJANG !== 'UMUM';
  const [jenjang, setJenjang] = useState<EducationLevel>(isLocked ? (DEFAULT_JENJANG as EducationLevel) : (activeLevel === 'UMUM' ? 'SMA' : activeLevel));
  const [content, setContent] = useState('');
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);

  const handleSmartAIWrite = async () => {
    if (!briefSketch.trim()) {
      alert("Masukkan poin-poin kegiatan terlebih dahulu.");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateNewsArticle(briefSketch);
      setContent(result);
      if (!title) {
        const titleSuggest = result.split('\n')[0].substring(0, 100).replace(/judul[:\s]*/i, '');
        setTitle(titleSuggest || title);
      }
      // Generate excerpt from first 150 characters of content
      if (!excerpt) {
        const excerptText = result.substring(0, 150).replace(/\n/g, ' ') + '...';
        setExcerpt(excerptText);
      }
    } catch (error) {
      alert("Maaf, AI gagal menghasilkan berita. Silakan coba lagi.");
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
    // Add a placeholder - will be filled when user selects file
    setGallery([...gallery, null as any]);
  };

  const removeGalleryField = (index: number) => {
    const newGallery = gallery.filter((_, i) => i !== index);
    setGallery(newGallery);
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

      const response = await createNews({
        title,
        excerpt,
        content,
        date: today,
        category,
        jenjang: jenjang.toLowerCase(), // Convert to lowercase for API
        level: category === 'Prestasi' ? level : undefined,
        main_image: mainImage || undefined,
        gallery: validGallery.length > 0 ? validGallery : undefined,
      });

      // Clear cache to force reload on ManageNews
      sessionStorage.removeItem('admin_news_data');
      sessionStorage.removeItem('admin_news_cats');
      sessionStorage.removeItem('admin_news_timestamp');

      alert(response.message || 'Berita berhasil ditambahkan!');
      navigate('/admin/news');
    } catch (error: any) {
      alert(error.message || 'Gagal menyimpan berita');
      console.error('Error creating news:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <Link to="/admin/news" className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-slate-900 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Buat Warta Baru</h1>
            <p className="text-slate-500 font-medium">Lengkapi form atau gunakan asisten AI.</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 text-islamic-gold-500 animate-spin" /> Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 text-islamic-gold-500" /> Simpan Publikasi
            </>
          )}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
            <div className="space-y-8">
              <div>
                <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                  <Tag className="w-4 h-4 text-slate-400" /> Judul Artikel
                </label>
                <input
                  type="text"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 font-black text-xl text-slate-800"
                  placeholder="Judul yang menarik..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                  <AlignLeft className="w-4 h-4 text-slate-400" /> Ringkasan Singkat
                </label>
                <textarea
                  rows={3}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 font-medium text-slate-700"
                  placeholder="Ringkasan berita dalam 1-2 kalimat..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                    Kategori Konten
                  </label>
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
                  <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                    <Layers className="w-4 h-4" /> Jenjang Pendidikan
                  </label>
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

              <div>
                <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                  <ImageIcon className="w-4 h-4" /> Gambar Utama
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                  onChange={handleMainImageChange}
                />
                {mainImage && (
                  <p className="text-xs text-slate-500 mt-2">File: {mainImage.name}</p>
                )}
              </div>

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
                <div className="space-y-3">
                  {gallery.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4 text-center bg-slate-50 rounded-xl border border-slate-100">
                      Belum ada foto galeri. Klik "Tambah Foto" untuk menambahkan.
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
                <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                  <AlignLeft className="w-4 h-4" /> Konten Berita
                </label>
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
          <section className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-islamic-gold-500" />
                <h3 className="text-xl font-black">AI Auto-Write</h3>
              </div>
              <p className="text-xs text-slate-400 mb-8 leading-relaxed">
                Masukkan poin-poin kegiatan, AI akan memprosesnya menjadi artikel formal sesuai jenjang pendidikan yang dipilih.
              </p>
              <textarea
                rows={6}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs outline-none focus:bg-white/10 transition-all mb-6"
                placeholder="Contoh: Santri MI juara lomba kaligrafi tingkat kota..."
                value={briefSketch}
                onChange={(e) => setBriefSketch(e.target.value)}
              ></textarea>
              <button
                onClick={handleSmartAIWrite}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 py-4 rounded-2xl font-black hover:bg-slate-100 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />} Generate Konten
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CreateNews;
