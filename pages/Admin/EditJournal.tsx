import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Layers, User, GraduationCap, FileText, Star, Eye, ExternalLink, Tag, Loader2, Award } from 'lucide-react';
import { EducationLevel } from '../../types';
import { fetchJournalCategories, fetchJournalDetail, updateJournal } from '../../services/api';
import { useLevelConfig } from '../../hooks/useLevelConfig';

const EditJournal: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const LEVEL_CONFIG = useLevelConfig();
  const journalId = parseInt(id || '0');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [categories, setCategories] = useState<string[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [mentor, setMentor] = useState('');
  const [category, setCategory] = useState('');
  const [score, setScore] = useState(0);
  const [abstract, setAbstract] = useState('');
  const [isBest, setIsBest] = useState(false);
  const DEFAULT_JENJANG = import.meta.env.VITE_DEFAULT_JENJANG || 'UMUM';
  const isLocked = DEFAULT_JENJANG !== 'UMUM';
  const [jenjang, setJenjang] = useState<EducationLevel>('SMA');

  // File
  const [existingFileUrl, setExistingFileUrl] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, journal] = await Promise.all([
          fetchJournalCategories(),
          fetchJournalDetail(journalId.toString())
        ]);

        setCategories(cats.filter(c => c !== 'Semua'));

        // Populate form
        setTitle(journal.title);
        setAuthor(journal.author);
        setMentor(journal.mentor);
        setCategory(journal.category);
        setScore(journal.score);
        setAbstract(journal.abstract);
        setIsBest(journal.isBest || journal.is_best || false);
        setJenjang(journal.jenjang);
        setExistingFileUrl(journal.fileUrl || '');

      } catch (error) {
        console.error('Error loading journal categories:', error);
        alert('Gagal memuat data jurnal');
      } finally {
        setIsLoading(false);
      }
    };

    if (journalId) {
      loadData();
    }
  }, [journalId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileSizeMB = file.size / (1024 * 1024);

      if (fileSizeMB > 10) {
        alert('File terlalu besar! Maksimal 10MB');
        e.target.value = '';
        return;
      }

      setNewFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) { alert('Judul harus diisi'); return; }
    if (!abstract.trim()) { alert('Abstrak harus diisi'); return; }
    if (!author.trim()) { alert('Penulis harus diisi'); return; }
    if (score < 0 || score > 100) { alert('Nilai harus antara 0-100'); return; }

    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      const response = await updateJournal({
        id: journalId,
        title,
        category,
        abstract,
        author,
        mentor,
        score,
        date: today,
        jenjang: jenjang.toLowerCase(),
        is_best: isBest,
        documentUrl: newFile || undefined,
      });

      // Clear cache
      sessionStorage.removeItem('admin_journals_data');
      sessionStorage.removeItem('admin_journals_cats');
      sessionStorage.removeItem('admin_journals_timestamp');

      alert(response.message || 'Jurnal berhasil diperbarui!');
      navigate('/admin/journals');
    } catch (error: any) {
      alert(error.message || 'Gagal memperbarui jurnal');
      console.error('Error updating journal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto w-full flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-islamic-green-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <Link to="/admin/journals" className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-islamic-green-600 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Edit Jurnal</h1>
            <p className="text-slate-500 font-medium">Perbarui karya ilmiah siswa.</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-islamic-green-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-islamic-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" /> Simpan Perubahan
            </>
          )}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">Judul Jurnal</label>
                <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-lg" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Tag className="w-4 h-4" /> Kategori
                </label>
                <select
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 appearance-none outline-none focus:ring-2 focus:ring-islamic-green-500"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Layers className="w-4 h-4" /> Jenjang Pendidikan
                </label>
                <select
                  className={`w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 appearance-none outline-none focus:ring-2 focus:ring-islamic-green-500 ${isLocked ? 'opacity-75 cursor-not-allowed' : ''}`}
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

              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <User className="w-4 h-4" /> Penulis / Mahasiswa
                </label>
                <input
                  type="text"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
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
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">Abstrak Jurnal</label>
                <textarea rows={8} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[2.5rem] italic font-medium" value={abstract} onChange={(e) => setAbstract(e.target.value)}></textarea>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-1 space-y-8">
          {/* Score & Status */}
          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-islamic-gold-500" /> Penilaian
            </h3>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4" /> Nilai Akhir
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-3xl text-center text-islamic-green-600"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                />
              </div>

              <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <input
                  type="checkbox"
                  id="isBest"
                  checked={isBest}
                  onChange={(e) => setIsBest(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 accent-islamic-gold-500"
                />
                <label htmlFor="isBest" className="font-bold text-slate-700 cursor-pointer">
                  🏆 Jurnal Terbaik
                </label>
              </div>
            </div>
          </section>

          {/* Document */}
          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-islamic-green-600" /> Dokumen
            </h3>

            {existingFileUrl && !newFile && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                <p className="text-xs font-bold text-blue-400 uppercase mb-2">File Saat Ini</p>
                <div className="flex items-center gap-2 text-blue-700 font-bold text-sm break-all">
                  <FileText className="w-4 h-4 shrink-0" />
                  <a href={existingFileUrl} target="_blank" rel="noreferrer" className="hover:underline line-clamp-2">
                    {existingFileUrl.split('/').pop()}
                  </a>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 block">Upload File Baru (PDF)</label>
              <input
                type="file"
                accept=".pdf"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                onChange={handleFileChange}
              />
              <p className="text-[10px] text-slate-400 mt-2">Max size: 10MB</p>

              {newFile && (
                <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-xl flex items-center gap-2 text-green-700 text-sm font-bold">
                  <FileText className="w-4 h-4" />
                  {newFile.name}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default EditJournal;
