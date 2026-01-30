
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Layers, User, Image as ImageIcon, AlignLeft, Tag, FileText, Trash2, Plus, Loader2 } from 'lucide-react';
import { EducationLevel, ProjectDocument } from '../../types';
import { fetchProjectCategories, fetchProjectDetail, updateProject, deleteProjectDocument } from '../../services/api';
import { useLevelConfig } from '../../hooks/useLevelConfig';

interface NewDocument {
   file: File | null;
   type: string;
   title: string;
}

const EditProject: React.FC = () => {
   const { id } = useParams<{ id: string }>();
   const navigate = useNavigate();
   const LEVEL_CONFIG = useLevelConfig();
   const projectId = parseInt(id || '0');

   const [isLoading, setIsLoading] = useState(true);
   const [isSubmitting, setIsSubmitting] = useState(false);

   const [categories, setCategories] = useState<string[]>([]);

   // Form State
   const [title, setTitle] = useState('');
   const [author, setAuthor] = useState('');
   const [category, setCategory] = useState('');
   const [description, setDescription] = useState('');
   const DEFAULT_JENJANG = import.meta.env.VITE_DEFAULT_JENJANG || 'UMUM';
   const isLocked = DEFAULT_JENJANG !== 'UMUM';

   const [jenjang, setJenjang] = useState<EducationLevel>('SMA');

   // Images
   const [imageFile, setImageFile] = useState<File | null>(null);
   const [existingImageUrl, setExistingImageUrl] = useState('');

   // Documents
   const [existingDocuments, setExistingDocuments] = useState<ProjectDocument[]>([]);
   const [newDocuments, setNewDocuments] = useState<NewDocument[]>([]);

   useEffect(() => {
      const loadData = async () => {
         try {
            const [cats, project] = await Promise.all([
               fetchProjectCategories(),
               fetchProjectDetail(projectId.toString())
            ]);

            setCategories(cats.filter(c => c !== 'Semua'));

            // Populate form
            setTitle(project.title);
            setAuthor(project.author);
            setCategory(project.category);
            setDescription(project.description);
            setJenjang(project.jenjang);
            setExistingImageUrl(project.imageUrl);

            if (project.documents) {
               setExistingDocuments(project.documents);
            }
         } catch (error) {
            console.error('Error loading project data:', error);
            alert('Gagal memuat data proyek');
         } finally {
            setIsLoading(false);
         }
      };

      if (projectId) {
         loadData();
      }
   }, [projectId]);

   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
         setImageFile(e.target.files[0]);
      }
   };

   // New Documents Handling
   const handleNewDocumentFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
         const newDocs = [...newDocuments];
         const file = e.target.files[0];
         const fileName = file.name.replace(/\.[^/.]+$/, "");

         newDocs[index] = {
            ...newDocs[index],
            file: file,
            title: newDocs[index].title || fileName
         };
         setNewDocuments(newDocs);
      }
   };

   const handleNewDocumentMetadataChange = (index: number, field: 'type' | 'title', value: string) => {
      const newDocs = [...newDocuments];
      newDocs[index] = { ...newDocs[index], [field]: value };
      setNewDocuments(newDocs);
   };

   const addNewDocumentField = () => {
      setNewDocuments([...newDocuments, { file: null, type: 'document', title: '' }]);
   };

   const removeNewDocumentField = (index: number) => {
      const newDocs = newDocuments.filter((_, i) => i !== index);
      setNewDocuments(newDocs);
   };

   const handleDeleteExistingDocument = async (doc: ProjectDocument) => {
      if (!confirm(`Apakah Anda yakin ingin menghapus dokumen "${doc.title}"?`)) return;

      try {
         await deleteProjectDocument(projectId, doc.url);
         // Remove from state
         setExistingDocuments(prev => prev.filter(d => d.url !== doc.url));
         alert('Dokumen berhasil dihapus');
      } catch (error: any) {
         console.error('Error deleting document:', error);
         alert(error.message || 'Gagal menghapus dokumen');
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!title.trim()) { alert('Judul harus diisi'); return; }
      if (!description.trim()) { alert('Deskripsi harus diisi'); return; }
      if (!author.trim()) { alert('Penulis harus diisi'); return; }

      setIsSubmitting(true);
      try {
         const today = new Date().toISOString().split('T')[0];
         const validNewDocs = newDocuments.filter(doc => doc.file !== null);

         const response = await updateProject({
            id: projectId,
            title,
            category,
            description,
            author,
            date: today,
            jenjang: jenjang.toLowerCase(),
            imageUrl: imageFile || undefined,
            documents: validNewDocs.length > 0 ? validNewDocs.map(d => d.file!) : undefined,
            document_types: validNewDocs.length > 0 ? validNewDocs.map(d => d.type) : undefined,
            document_titles: validNewDocs.length > 0 ? validNewDocs.map(d => d.title) : undefined,
         });

         // Clear cache
         sessionStorage.removeItem('admin_projects_data');
         sessionStorage.removeItem('admin_projects_cats');
         sessionStorage.removeItem('admin_projects_timestamp');

         alert(response.message || 'Proyek berhasil diperbarui!');
         navigate('/admin/projects');
      } catch (error: any) {
         alert(error.message || 'Gagal memperbarui proyek');
         console.error('Error updating project:', error);
      } finally {
         setIsSubmitting(false);
      }
   };

   if (isLoading) {
      return (
         <div className="p-8 max-w-5xl mx-auto w-full flex items-center justify-center min-h-screen">
            <Loader2 className="w-12 h-12 animate-spin text-islamic-gold-500" />
         </div>
      );
   }

   return (
      <div className="p-8 max-w-5xl mx-auto w-full">
         <header className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-4">
               <Link to="/admin/projects" className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-islamic-gold-600 transition-all">
                  <ArrowLeft className="w-5 h-5" />
               </Link>
               <div>
                  <h1 className="text-3xl font-black text-slate-900">Edit Projek</h1>
                  <p className="text-slate-500 font-medium">Perbarui informasi inovasi siswa.</p>
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
                     <Save className="w-5 h-5" /> Simpan Perubahan
                  </>
               )}
            </button>
         </header>

         <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="md:col-span-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                     <FileText className="w-4 h-4" /> Judul Projek
                  </label>
                  <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xl" value={title} onChange={(e) => setTitle(e.target.value)} />
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
                     <User className="w-4 h-4" /> Penulis / Nama Tim
                  </label>
                  <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium" value={author} onChange={(e) => setAuthor(e.target.value)} />
               </div>

               <div className="md:col-span-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                     <AlignLeft className="w-4 h-4" /> Deskripsi Projek
                  </label>
                  <textarea rows={8} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
               </div>

               <div className="md:col-span-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                     <ImageIcon className="w-4 h-4" /> Gambar Sampul Proyek
                  </label>
                  {existingImageUrl && !imageFile && (
                     <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-xs text-blue-700 font-medium">📷 Gambar saat ini: {existingImageUrl.split('/').pop()}</p>
                     </div>
                  )}
                  <input
                     type="file"
                     accept="image/*"
                     className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                     onChange={handleImageChange}
                  />
                  {imageFile && (
                     <p className="text-xs text-slate-500 mt-2">📎 File baru: {imageFile.name}</p>
                  )}
               </div>

               <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-4">
                     <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Dokumen Pendukung
                     </label>
                     <button
                        type="button"
                        onClick={addNewDocumentField}
                        className="flex items-center gap-1 text-xs font-black text-slate-900 hover:text-islamic-gold-600 transition-colors"
                     >
                        <Plus className="w-4 h-4" /> Tambah Dokumen
                     </button>
                  </div>

                  {/* Existing Documents List */}
                  {existingDocuments.length > 0 && (
                     <div className="mb-6 space-y-3">
                        <p className="text-xs font-bold text-slate-500">Dokumen Saat Ini:</p>
                        {existingDocuments.map((doc, idx) => (
                           <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                 <FileText className="w-4 h-4 text-slate-400" />
                                 <div>
                                    <p className="text-sm font-bold text-slate-700">{doc.title}</p>
                                    <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                                       Lihat File
                                    </a>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3">
                                 <span className="text-[10px] bg-slate-200 px-2 py-1 rounded uppercase font-bold text-slate-500">{doc.type}</span>
                                 <button
                                    type="button"
                                    onClick={() => handleDeleteExistingDocument(doc)}
                                    className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                    title="Hapus Dokumen"
                                 >
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}

                  <div className="space-y-4">
                     {newDocuments.map((doc, index) => (
                        <div key={index} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                           <div className="flex gap-2 items-start">
                              <div className="flex-1 space-y-3">
                                 <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                                    onChange={(e) => handleNewDocumentFileChange(index, e)}
                                 />
                                 {doc.file && (
                                    <p className="text-xs text-slate-500 ml-1">📎 {doc.file.name}</p>
                                 )}
                                 <div className="grid grid-cols-2 gap-3">
                                    <input
                                       type="text"
                                       className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold"
                                       value={doc.title}
                                       onChange={(e) => handleNewDocumentMetadataChange(index, 'title', e.target.value)}
                                       placeholder="Judul Dokumen"
                                    />
                                    <select
                                       className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold"
                                       value={doc.type}
                                       onChange={(e) => handleNewDocumentMetadataChange(index, 'type', e.target.value)}
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
                                 onClick={() => removeNewDocumentField(index)}
                                 className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                              >
                                 <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </section>
      </div>
   );
};

export default EditProject;
