
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Layers, User, Image as ImageIcon, AlignLeft, FileText, Trash2, Plus, Loader2 } from 'lucide-react';
import { LevelContext } from '../../App';
import { EducationLevel } from '../../types';
import { createProject, fetchProjectCategories } from '../../services/api';
import { useLevelConfig } from '../../hooks/useLevelConfig';

interface DocumentWithMetadata {
  file: File | null;
  type: string;
  title: string;
}

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const { activeLevel } = useContext(LevelContext);
  const LEVEL_CONFIG = useLevelConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<DocumentWithMetadata[]>([]);
  const DEFAULT_JENJANG = import.meta.env.VITE_DEFAULT_JENJANG || 'UMUM';
  const isLocked = DEFAULT_JENJANG !== 'UMUM';
  const [jenjang, setJenjang] = useState<EducationLevel>(isLocked ? (DEFAULT_JENJANG as EducationLevel) : (activeLevel === 'UMUM' ? 'SMA' : activeLevel));

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchProjectCategories();
        setCategories(data.filter(c => c !== 'Semua'));
        if (data.length > 1) {
          setCategory(data[1]);
        }
      } catch (error) {
        console.error('Error loading project categories:', error);
      }
    };
    loadCategories();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Judul harus diisi');
      return;
    }
    if (!description.trim()) {
      alert('Deskripsi harus diisi');
      return;
    }
    if (!author.trim()) {
      alert('Author harus diisi');
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

      // Clear cache
      sessionStorage.removeItem('admin_projects_data');
      sessionStorage.removeItem('admin_projects_cats');
      sessionStorage.removeItem('admin_projects_timestamp');

      alert(response.message || 'Proyek berhasil ditambahkan!');
      navigate('/admin/projects');
    } catch (error: any) {
      alert(error.message || 'Gagal menyimpan proyek');
      console.error('Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <Link to="/admin/projects" className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-islamic-gold-600 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Tambah Projek</h1>
            <p className="text-slate-500 font-medium">Publikasikan inovasi siswa terbaru.</p>
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
              <Save className="w-5 h-5" /> Simpan Projek
            </>
          )}
        </button>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4" /> Judul Projek
              </label>
              <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xl" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nama Projek Inovatif" />
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4" /> Kategori
              </label>
              <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={category} onChange={(e) => setCategory(e.target.value)}>
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
                <User className="w-4 h-4" /> Penulis / Nama Tim
              </label>
              <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Nama Siswa atau Kelompok" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                <AlignLeft className="w-4 h-4" /> Deskripsi Projek
              </label>
              <textarea rows={8} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Jelaskan detail projek, tujuan, dan hasil yang dicapai..."></textarea>
            </div>

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
          </div>
        </section>
      </div>
    </div>
  );
};

export default CreateProject;
