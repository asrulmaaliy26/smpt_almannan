import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Plus, Search, Edit3, Trash2, ArrowLeft, ExternalLink, RotateCcw } from 'lucide-react';
import { fetchNews, fetchNewsCategories, deleteNews } from '../../services/api';
import { NewsItem } from '../../types';
import Pagination from '../../components/Pagination';

const ManageNews: React.FC = () => {
   const [news, setNews] = useState<NewsItem[]>([]);
   const [categories, setCategories] = useState<string[]>(['Semua']);
   const [loading, setLoading] = useState(true);
   const [currentPage, setCurrentPage] = useState(1);
   const itemsPerPage = 6;
   const [activeCategory, setActiveCategory] = useState('Semua');
   const [searchTerm, setSearchTerm] = useState('');

   const CACHE_KEY_NEWS = 'admin_news_data';
   const CACHE_KEY_CATS = 'admin_news_cats';
   const CACHE_TIMESTAMP = 'admin_news_timestamp';
   const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

   useEffect(() => {
      const loadData = async () => {
         try {
            // Check cache
            const cachedNews = sessionStorage.getItem(CACHE_KEY_NEWS);
            const cachedCats = sessionStorage.getItem(CACHE_KEY_CATS);
            const cachedTime = sessionStorage.getItem(CACHE_TIMESTAMP);

            const isCacheValid = cachedTime && (Date.now() - parseInt(cachedTime) < CACHE_DURATION);

            if (cachedNews && cachedCats && isCacheValid) {
               setNews(JSON.parse(cachedNews));
               setCategories(JSON.parse(cachedCats));
               setLoading(false);
               return;
            }

            // Fetch new data
            const [newsData, catsData] = await Promise.all([
               fetchNews(),
               fetchNewsCategories()
            ]);

            const catsWithAll = ['Semua', ...catsData];
            setNews(newsData);
            setCategories(catsWithAll);

            // Save to cache
            sessionStorage.setItem(CACHE_KEY_NEWS, JSON.stringify(newsData));
            sessionStorage.setItem(CACHE_KEY_CATS, JSON.stringify(catsWithAll));
            sessionStorage.setItem(CACHE_TIMESTAMP, Date.now().toString());

         } catch (error) {
            console.error('Error fetching data:', error);
         } finally {
            setLoading(false);
         }
      };
      loadData();
   }, []);

   const handleRefresh = () => {
      setLoading(true);
      sessionStorage.removeItem(CACHE_KEY_NEWS);
      sessionStorage.removeItem(CACHE_KEY_CATS);
      sessionStorage.removeItem(CACHE_TIMESTAMP);
      window.location.reload();
   };

   const handleDelete = async (id: string) => {
      if (!window.confirm('Apakah Anda yakin ingin menghapus berita ini?')) return;

      try {
         await deleteNews(id);

         const newNews = news.filter(item => item.id !== id);
         setNews(newNews);

         // Update cache
         sessionStorage.setItem(CACHE_KEY_NEWS, JSON.stringify(newNews));

         alert('Berita berhasil dihapus');
      } catch (error) {
         console.error('Error deleting news:', error);
         alert('Gagal menghapus berita');
      }
   };

   const filteredNews = news.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'Semua' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
   });

   const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
   const paginatedNews = filteredNews.slice(
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
                  <h1 className="text-3xl font-black text-slate-900">Kelola Warta</h1>
                  <p className="text-slate-500 font-medium">Manajemen konten artikel dan berita sekolah.</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <button
                  onClick={handleRefresh}
                  className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-islamic-green-600 hover:rotate-180 transition-all duration-500 shadow-sm"
                  title="Refresh Data"
               >
                  <RotateCcw className="w-5 h-5" />
               </button>
               <Link to="/admin/news/create" className="flex items-center gap-2 bg-islamic-green-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-islamic-green-700 transition-all shadow-xl shadow-islamic-green-200">
                  <Plus className="w-5 h-5" /> Tambah Berita
               </Link>
            </div>
         </header>

         {/* Search & Filter Bar */}
         <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
               <input
                  type="text"
                  placeholder="Cari judul berita..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-islamic-green-500"
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

         {/* News Table */}
         <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                     <tr>
                        <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Informasi Berita</th>
                        <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Kategori</th>
                        <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Views</th>
                        <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {loading ? (
                        <tr>
                           <td colSpan={4} className="text-center py-10 text-slate-400">Loading...</td>
                        </tr>
                     ) : news.length > 0 ? (
                        paginatedNews.map(item => (
                           <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-4">
                                    <img src={item.main_image} className="w-16 h-12 rounded-lg object-cover flex-shrink-0" alt="" />
                                    <div>
                                       <p className="font-bold text-slate-800 line-clamp-1 group-hover:text-islamic-green-600 transition-colors">{item.title}</p>
                                       <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{item.date}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <span className="bg-islamic-green-50 text-islamic-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                                    {item.category}
                                 </span>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-1 text-slate-500 font-bold text-sm">
                                    {item.views.toLocaleString()}
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <div className="flex justify-end gap-2">
                                    <Link to={`/admin/news/edit/${item.id}`} className="p-3 bg-slate-100 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                                       <Edit3 className="w-4 h-4" />
                                    </Link>
                                    <Link to={`/berita/${item.id}`} className="p-3 bg-slate-100 rounded-xl text-slate-400 hover:text-islamic-green-600 hover:bg-islamic-green-50 transition-all">
                                       <ExternalLink className="w-4 h-4" />
                                    </Link>
                                    <button
                                       onClick={() => handleDelete(item.id)}
                                       className="p-3 bg-slate-100 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                    >
                                       <Trash2 className="w-4 h-4" />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))
                     ) : (
                        <tr>
                           <td colSpan={4} className="text-center py-10 text-slate-400">Tidak ada berita.</td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
            <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
               <p className="text-xs font-bold text-slate-400">
                  Menampilkan {Math.min(itemsPerPage * currentPage, filteredNews.length)} dari {filteredNews.length} warta sekolah
               </p>
               <div className="-mt-16 md:mt-0">
                  <Pagination
                     currentPage={currentPage}
                     totalPages={totalPages}
                     onPageChange={setCurrentPage}
                     themeColor="bg-islamic-green-600"
                  />
               </div>
            </div>
         </div>
      </div>
   );
};

export default ManageNews;
