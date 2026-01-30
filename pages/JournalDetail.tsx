
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchJournalDetail, fetchJournals } from '../services/api';
import { useCache } from '../context/CacheContext';
import { JournalItem } from '../types';
import { ArrowLeft, ArrowRight, Download, FileText, User, GraduationCap, Star, BookOpen, Quote } from 'lucide-react';

const JournalDetail: React.FC = () => {
   const { id } = useParams<{ id: string }>();
   const { homeCache } = useCache();
   const [journal, setJournal] = useState<JournalItem | null>(null);
   const [recommendedJournals, setRecommendedJournals] = useState<JournalItem[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(false);

   useEffect(() => {
      const loadData = async () => {
         if (!id) return;

         // 1. Optimistic Cache Check
         const cachedItem = homeCache.allJournals.find(j => j.id === id)
            || homeCache.journals.find(j => j.id === id)
            || homeCache.bestJournals.find(j => j.id === id);

         if (cachedItem) {
            setJournal(cachedItem);
            setLoading(false);
         } else {
            setLoading(true);
         }

         // 2. Initial Recommended from Cache
         let sourceRecommended = homeCache.allJournals.length > 0 ? homeCache.allJournals : homeCache.journals;
         if (sourceRecommended.length > 0) {
            setRecommendedJournals(sourceRecommended.filter(j => j.id !== id).slice(0, 3));
         }

         setError(false);
         try {
            // 3. Background Fetch Detail
            const detail = await fetchJournalDetail(id);
            setJournal(detail);

            // 4. Background Fetch List (only if needed)
            if (homeCache.allJournals.length === 0) {
               const list = await fetchJournals();
               setRecommendedJournals(list.filter(j => j.id !== id).slice(0, 3));
            }
         } catch (err) {
            console.error(err);
            if (!cachedItem) setError(true);
         } finally {
            setLoading(false);
         }
      };
      loadData();
   }, [id, homeCache.allJournals, homeCache.journals, homeCache.bestJournals]);

   if (loading) return (
      <div className="flex justify-center py-40">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
   );

   if (error || !journal) return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
         <h2 className="text-2xl font-bold">Jurnal tidak ditemukan</h2>
         <Link to="/jurnal" className="text-blue-600 hover:underline mt-4 inline-block">Kembali ke Jurnal</Link>
      </div>
   );

   return (
      <div className="max-w-7xl mx-auto px-4 py-12">
         <Link to="/jurnal" className="inline-flex items-center text-slate-500 hover:text-blue-600 font-bold mb-8 gap-2 transition-all">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Katalog Jurnal
         </Link>

         <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-2/3">
               <article className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm p-8 md:p-12">
                  <div className="flex items-center gap-3 mb-6">
                     {journal.isBest && (
                        <div className="bg-yellow-400 text-slate-900 px-4 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                           <Star className="w-3 h-3 fill-slate-900" /> Jurnal Terbaik
                        </div>
                     )}
                     <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{journal.date}</span>
                  </div>

                  <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 leading-tight">{journal.title}</h1>

                  <div className="flex flex-wrap gap-8 mb-12 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><User className="w-5 h-5" /></div>
                        <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase">Penulis</p>
                           <p className="text-sm font-bold text-slate-800">{journal.author}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600"><GraduationCap className="w-5 h-5" /></div>
                        <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase">Pembimbing</p>
                           <p className="text-sm font-bold text-slate-800">{journal.mentor}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">{journal.score}</div>
                        <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase">Skor Review</p>
                           <p className="text-sm font-bold text-slate-800">Sangat Baik</p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-8 text-slate-700">
                     <div className="relative">
                        <Quote className="absolute -top-6 -left-6 w-12 h-12 text-blue-50 -z-10" />
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Abstrak</h3>
                        <p className="leading-relaxed italic text-lg bg-blue-50/30 p-8 rounded-3xl border border-blue-50">
                           {journal.abstract}
                        </p>
                     </div>

                     <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Ringkasan Eksekutif</h3>
                        <p className="leading-relaxed">
                           Penelitian ini dilakukan dalam kurun waktu semester genap dengan fokus pada metodologi deskriptif analitis. Berdasarkan data yang dikumpulkan melalui observasi lapangan di lingkungan LPI Al Hidayah, didapatkan temuan menarik yang membuktikan hipotesis awal mengenai variabel yang diteliti.
                        </p>
                        <p className="mt-4 leading-relaxed">
                           Hasil analisis menunjukkan korelasi positif yang signifikan antara dukungan sistem bimbingan sekolah dengan kualitas keluaran riset siswa. Jurnal ini direkomendasikan sebagai referensi dasar bagi penelitian lanjutan di bidang serupa.
                        </p>
                     </div>

                     <div className="p-8 bg-slate-900 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                           <h4 className="text-xl font-bold mb-2">Akses Dokumen Lengkap</h4>
                           <p className="text-slate-400 text-sm">Tersedia dalam format PDF (2.4 MB)</p>
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-xl shadow-blue-900/40 w-full md:w-auto justify-center">
                           <Download className="w-5 h-5" /> Download Jurnal
                        </button>
                     </div>
                  </div>
               </article>
            </div>

            <aside className="lg:w-1/3 space-y-8">
               <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
                  <h3 className="text-2xl font-bold mb-8 relative z-10">Jurnal Akademik Lainnya</h3>
                  <div className="space-y-8 relative z-10">
                     {recommendedJournals.map(j => (
                        <Link to={`/jurnal/${j.id}`} key={j.id} className="block group/item">
                           <div className="flex gap-4">
                              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover/item:bg-white group-hover/item:text-blue-600 transition-all">
                                 <BookOpen className="w-8 h-8" />
                              </div>
                              <div>
                                 <h4 className="font-bold text-sm leading-snug group-hover/item:text-blue-100 transition-colors line-clamp-2">{j.title}</h4>
                                 <p className="text-xs text-blue-200 mt-2">Penulis: {j.author}</p>
                              </div>
                           </div>
                        </Link>
                     ))}
                  </div>
                  <Link to="/jurnal" className="mt-10 inline-flex items-center gap-2 text-blue-600 font-bold text-sm bg-white px-6 py-4 rounded-2xl hover:bg-slate-50 transition-all w-full justify-center">
                     Katalog Lengkap Jurnal <ArrowRight className="w-4 h-4" />
                  </Link>
               </div>

               <div className="bg-yellow-50 border border-yellow-100 rounded-[2.5rem] p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="bg-yellow-400 p-2 rounded-xl text-slate-900"><Star className="w-6 h-6" /></div>
                     <h3 className="text-xl font-bold text-slate-900">Publikasi Riset</h3>
                  </div>
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                     Karya ilmiah terbaik berkesempatan dipublikasikan di majalah sekolah dan diikutkan dalam lomba karya tulis nasional.
                  </p>
                  <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all">Panduan Penulisan</button>
               </div>
            </aside>
         </div>
      </div>
   );
};

export default JournalDetail;
