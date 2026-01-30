import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, Plus, Search, Edit3, Trash2, ArrowLeft, User, Tag, ExternalLink, RotateCcw } from 'lucide-react';
import { fetchProjects, fetchProjectCategories, deleteProject } from '../../services/api';
import { ProjectItem } from '../../types';
import Pagination from '../../components/Pagination';

const ManageProjects: React.FC = () => {
   const [projects, setProjects] = useState<ProjectItem[]>([]);
   const [categories, setCategories] = useState<string[]>(['Semua Kategori']);
   const [activeCategory, setActiveCategory] = useState('Semua Kategori');
   const [searchTerm, setSearchTerm] = useState('');

   const [loading, setLoading] = useState(true);
   const [currentPage, setCurrentPage] = useState(1);
   const itemsPerPage = 6;

   const CACHE_KEY_PROJECTS = 'admin_projects_data';
   const CACHE_KEY_CATS = 'admin_projects_cats';
   const CACHE_TIMESTAMP = 'admin_projects_timestamp';
   const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

   useEffect(() => {
      const loadData = async () => {
         try {
            // Check cache
            const cachedProjects = sessionStorage.getItem(CACHE_KEY_PROJECTS);
            const cachedCats = sessionStorage.getItem(CACHE_KEY_CATS);
            const cachedTime = sessionStorage.getItem(CACHE_TIMESTAMP);

            const isCacheValid = cachedTime && (Date.now() - parseInt(cachedTime) < CACHE_DURATION);

            if (cachedProjects && cachedCats && isCacheValid) {
               setProjects(JSON.parse(cachedProjects));
               setCategories(JSON.parse(cachedCats));
               setLoading(false);
               return;
            }

            // Fetch new data
            const [data, cats] = await Promise.all([
               fetchProjects(),
               fetchProjectCategories()
            ]);

            const catsWithAll = ['Semua Kategori', ...cats];
            setProjects(data);
            setCategories(catsWithAll);

            // Save to cache
            sessionStorage.setItem(CACHE_KEY_PROJECTS, JSON.stringify(data));
            sessionStorage.setItem(CACHE_KEY_CATS, JSON.stringify(catsWithAll));
            sessionStorage.setItem(CACHE_TIMESTAMP, Date.now().toString());

         } catch (error) {
            console.error('Error fetching projects:', error);
         } finally {
            setLoading(false);
         }
      };
      loadData();
   }, []);

   const handleRefresh = () => {
      setLoading(true);
      sessionStorage.removeItem(CACHE_KEY_PROJECTS);
      sessionStorage.removeItem(CACHE_KEY_CATS);
      sessionStorage.removeItem(CACHE_TIMESTAMP);
      window.location.reload();
   };

   const handleDelete = async (id: string) => {
      if (!window.confirm('Apakah Anda yakin ingin menghapus projek ini?')) return;

      try {
         await deleteProject(id);

         const newProjects = projects.filter(item => item.id !== id);
         setProjects(newProjects);

         // Update cache
         sessionStorage.setItem(CACHE_KEY_PROJECTS, JSON.stringify(newProjects));

         alert('Projek berhasil dihapus');
      } catch (error) {
         console.error('Error deleting project:', error);
         alert('Gagal menghapus projek');
      }
   };

   const filteredProjects = projects.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'Semua Kategori' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
   });

   const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
   const paginatedProjects = filteredProjects.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
   );

   return (
      <div className="p-8">
         <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div className="flex items-center gap-4">
               <Link to="/admin" className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-islamic-green-600 transition-all">
                  <ArrowLeft className="w-5 h-5" />
               </Link>
               <div>
                  <h1 className="text-3xl font-black text-slate-900">Kelola Projek</h1>
                  <p className="text-slate-500 font-medium">Inovasi dan riset kreatif siswa.</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <button
                  onClick={handleRefresh}
                  className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-islamic-gold-600 hover:rotate-180 transition-all duration-500 shadow-sm"
                  title="Refresh Data"
               >
                  <RotateCcw className="w-5 h-5" />
               </button>
               <Link to="/admin/projects/create" className="flex items-center gap-2 bg-islamic-gold-500 text-white px-8 py-4 rounded-2xl font-black hover:bg-islamic-gold-600 transition-all shadow-xl">
                  <Plus className="w-5 h-5" /> Tambah Projek
               </Link>
            </div>
         </header>

         {/* Search & Filter Bar */}
         <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
               <input
                  type="text"
                  placeholder="Cari judul projek..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-islamic-gold-500"
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
               />
            </div>
            <select
               className="bg-slate-50 border border-slate-100 px-6 py-3 rounded-xl font-bold text-slate-600 outline-none"
               value={activeCategory}
               onChange={e => { setActiveCategory(e.target.value); setCurrentPage(1); }}
            >
               {categories.map((cat, index) => (
                  <option key={index} value={cat}>{cat}</option>
               ))}
            </select>
         </div>

         <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                     <tr>
                        <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Judul Projek</th>
                        <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Kategori</th>
                        <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Penulis</th>
                        <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {loading ? (
                        <tr>
                           <td colSpan={4} className="text-center py-10 text-slate-400">Loading...</td>
                        </tr>
                     ) : paginatedProjects.length > 0 ? (
                        paginatedProjects.map(item => (
                           <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-4">
                                    <img src={item.imageUrl} className="w-16 h-12 rounded-lg object-cover flex-shrink-0" alt="" />
                                    <p className="font-bold text-slate-800 line-clamp-1 group-hover:text-islamic-gold-600 transition-colors">{item.title}</p>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
                                    {item.category}
                                 </span>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-2 font-black text-slate-500 text-xs uppercase tracking-widest"><User className="w-3.5 h-3.5" /> {item.author}</div>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <div className="flex justify-end gap-2">
                                    <Link to={`/admin/projects/edit/${item.id}`} className="p-3 bg-slate-100 rounded-xl text-slate-400 hover:text-islamic-gold-600 hover:bg-islamic-gold-50">
                                       <Edit3 className="w-4 h-4" />
                                    </Link>
                                    <Link to={`/projek/${item.id}`} className="p-3 bg-slate-100 rounded-xl text-slate-400 hover:text-islamic-green-600 hover:bg-islamic-green-50 transition-all">
                                       <ExternalLink className="w-4 h-4" />
                                    </Link>
                                    <button
                                       onClick={() => handleDelete(item.id)}
                                       className="p-3 bg-slate-100 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50"
                                    >
                                       <Trash2 className="w-4 h-4" />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))
                     ) : (
                        <tr>
                           <td colSpan={4} className="text-center py-10 text-slate-400">Tidak ada projek.</td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
            <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
               <p className="text-xs font-bold text-slate-400">
                  Menampilkan {Math.min(itemsPerPage * currentPage, filteredProjects.length)} dari {filteredProjects.length} projek
               </p>
               <div className="-mt-16 md:mt-0">
                  <Pagination
                     currentPage={currentPage}
                     totalPages={totalPages}
                     onPageChange={setCurrentPage}
                     themeColor="bg-islamic-gold-500"
                  />
               </div>
            </div>
         </div>
      </div>
   );
};

export default ManageProjects;
