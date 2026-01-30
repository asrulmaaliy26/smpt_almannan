
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Star, Layers, User, GraduationCap, FileText, Loader2, Award } from 'lucide-react';
import { LevelContext } from '../../App';
import { EducationLevel } from '../../types';
import { createJournal, fetchJournalCategories } from '../../services/api';
import { useLevelConfig } from '../../hooks/useLevelConfig';

const CreateJournal: React.FC = () => {
  const navigate = useNavigate();
  const { activeLevel } = useContext(LevelContext);
  const LEVEL_CONFIG = useLevelConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [mentor, setMentor] = useState('');
  const [category, setCategory] = useState('');
  const [score, setScore] = useState(0);
  const [abstract, setAbstract] = useState('');
  const [isBest, setIsBest] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const DEFAULT_JENJANG = import.meta.env.VITE_DEFAULT_JENJANG || 'UMUM';
  const isLocked = DEFAULT_JENJANG !== 'UMUM';
  const [jenjang, setJenjang] = useState<EducationLevel>(isLocked ? (DEFAULT_JENJANG as EducationLevel) : (activeLevel === 'UMUM' ? 'SMA' : activeLevel));

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchJournalCategories();
        setCategories(data.filter(c => c !== 'Semua'));
        if (data.length > 1) {
          setCategory(data[1]);
        }
      } catch (error) {
        console.error('Error loading journal categories:', error);
      }
    };
    loadCategories();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      alert('Judul harus diisi');
      return;
    }
    if (!abstract.trim()) {
      alert('Abstrak harus diisi');
      return;
    }
    if (!author.trim()) {
      alert('Penulis harus diisi');
      return;
    }
    if (!mentor.trim()) {
      alert('Pembimbing harus diisi');
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

      // Clear cache
      sessionStorage.removeItem('admin_journals_data');
      sessionStorage.removeItem('admin_journals_cats');
      sessionStorage.removeItem('admin_journals_timestamp');

      alert(response.message || 'Jurnal berhasil ditambahkan!');
      navigate('/admin/journals');
    } catch (error: any) {
      alert(error.message || 'Gagal menyimpan jurnal');
      console.error('Error creating journal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <Link to="/admin/journals" className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-islamic-gold-600 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Tambah Jurnal</h1>
            <p className="text-slate-500 font-medium">Publikasikan karya ilmiah terbaru.</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-islamic-gold-500 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-islamic-gold-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" /> Simpan Jurnal
            </>
          )}
        </button>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4" /> Judul Jurnal
              </label>
              <input
                type="text"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xl"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul Karya Ilmiah"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4" /> Kategori
              </label>
              <select
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Pilih Kategori</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4" /> Jenjang
              </label>
              <select
                className={`w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold ${isLocked ? 'opacity-75 cursor-not-allowed' : ''}`}
                value={jenjang}
                onChange={(e) => setJenjang(e.target.value as EducationLevel)}
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

            <div className="md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4" /> Abstrak
              </label>
              <textarea
                rows={6}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none"
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                placeholder="Ringkasan atau abstrak jurnal..."
              ></textarea>
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                <User className="w-4 h-4" /> Penulis / Mahasiswa
              </label>
              <input
                type="text"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Nama Penulis"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                <GraduationCap className="w-4 h-4" /> Pembimbing / Mentor
              </label>
              <input
                type="text"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium"
                value={mentor}
                onChange={(e) => setMentor(e.target.value)}
                placeholder="Nama Pembimbing"
              />
            </div>

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
          </div>
        </section>
      </div>
    </div>
  );
};

export default CreateJournal;
