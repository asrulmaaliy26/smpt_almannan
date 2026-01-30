
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { fetchJournalCategories, fetchJournalsWithLimit } from '../services/api';
import { FileText, Layers, BookOpen, Tag, ChevronRight, Loader2 } from 'lucide-react';
import { LevelContext } from '../App';
import { EducationLevel, JournalItem } from '../types';
import { Link } from 'react-router-dom';
import { useLevelConfig } from '../hooks/useLevelConfig';
import JournalCard from '../components/JournalCard';
import SkeletonJournalCard from '../components/SkeletonJournalCard';
import { useCache } from '../context/CacheContext';

const Journals: React.FC = () => {
  const { homeCache, setHomeCache } = useCache();
  const { activeLevel } = useContext(LevelContext);
  const LEVEL_CONFIG = useLevelConfig();
  const [subFilter, setSubFilter] = useState<EducationLevel | 'SEMUA'>('SEMUA');
  const [activeCategory, setActiveCategory] = useState<string>('Semua');

  const [categories, setCategories] = useState<string[]>(homeCache.journalCategories && homeCache.journalCategories.length > 0 ? homeCache.journalCategories : ['Semua']);
  const [journals, setJournals] = useState<JournalItem[]>(homeCache.allJournals || []);

  const [catLoading, setCatLoading] = useState(homeCache.journalCategories && homeCache.journalCategories.length > 0 ? false : true);
  const [loading, setLoading] = useState(!homeCache.isJournalsLoaded);

  const [limit, setLimit] = useState(homeCache.allJournals?.length || 6);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (homeCache.journalCategories && homeCache.journalCategories.length > 0) return;

    const loadCategories = async () => {
      try {
        const catsData = await fetchJournalCategories();
        setCategories(catsData);
        setHomeCache({ journalCategories: catsData });
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setCatLoading(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (homeCache.isJournalsLoaded && journals.length >= limit) {
      setLoading(false);
      return;
    }

    const loadJournals = async () => {
      setLoading(true);
      try {
        const journalsData = await fetchJournalsWithLimit(limit);
        setJournals(journalsData);
        setHomeCache({ allJournals: journalsData, isJournalsLoaded: true });

        if (journalsData.length < limit) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadJournals();
  }, [limit]);

  const effectiveLevelFilter = activeLevel !== 'UMUM' ? activeLevel : subFilter;

  // Generate filter options dynamically from API config
  const filterOptions = React.useMemo(() => {
    const levels = Object.keys(LEVEL_CONFIG).filter(key => key !== 'UMUM') as EducationLevel[];
    return ['SEMUA', ...levels] as (EducationLevel | 'SEMUA')[];
  }, [LEVEL_CONFIG]);

  const filteredJournals = useMemo(() => {
    return journals.filter(journal => {
      const matchesLevel = effectiveLevelFilter === 'SEMUA' || journal.jenjang === effectiveLevelFilter;
      const matchesCategory = activeCategory === 'Semua' || journal.category === activeCategory;
      return matchesLevel && matchesCategory;
    });
  }, [journals, effectiveLevelFilter, activeCategory]);

  const renderedJournals = useMemo(() => {
    return filteredJournals.map(journal => (
      <JournalCard key={journal.id} journal={journal} levelConfig={LEVEL_CONFIG} />
    ));
  }, [filteredJournals, LEVEL_CONFIG]);

  const loadMore = () => {
    setLimit(prev => prev + 6);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 md:py-20">
      <header className="mb-10 md:mb-20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-1 bg-islamic-gold-500 rounded-full"></div>
          <span className="text-xs font-black uppercase tracking-[0.3em] text-islamic-green-600">Publikasi Akademik</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">Jurnal Ilmiah</h1>
        <p className="text-slate-500 max-w-2xl leading-relaxed font-medium">
          Media publikasi hasil riset mandiri dan karya tulis ilmiah civitas akademika Unggul Bangsa.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Kategori */}
        <aside className="lg:w-72 flex-shrink-0 space-y-8">
          {activeLevel === 'UMUM' && (
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Layers className="w-3 h-3" /> Jenjang Institusi
              </h3>
              <div className="space-y-1">
                {filterOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSubFilter(opt)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black transition-all flex justify-between items-center ${subFilter === opt ? 'bg-islamic-green-700 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
                      }`}
                  >
                    {opt === 'SEMUA' ? 'Semua Jenjang' : LEVEL_CONFIG[opt]?.name || opt}
                    {subFilter === opt && <ChevronRight className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 sticky top-28">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Tag className="w-3 h-3" /> Bidang Kajian
            </h3>
            <div className="space-y-2">
              {catLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-islamic-green-800"></div>
                </div>
              ) : (
                categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full text-left px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-between border ${activeCategory === cat
                      ? 'bg-islamic-green-800 text-white border-transparent shadow-2xl shadow-islamic-green-100'
                      : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-50 hover:border-slate-100'
                      }`}
                  >
                    {cat}
                    {activeCategory === cat && <BookOpen className="w-4 h-4" />}
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* List Jurnal */}
        <div className="flex-1">
          {loading && limit === 6 ? (
            <div className="space-y-10">
              {Array(3).fill(0).map((_, i) => <SkeletonJournalCard key={i} />)}
            </div>
          ) : filteredJournals.length > 0 ? (
            <>
              <div className="space-y-10">
                {renderedJournals}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center pt-8">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="px-8 py-3 rounded-full font-bold text-white transition-all shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 bg-islamic-green-700"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Memuat...</span>
                    ) : (
                      "Muat Lebih Banyak"
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-40 bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
              <FileText className="w-16 h-16 text-slate-200 mx-auto mb-6" />
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Jurnal tidak ditemukan</p>
              <button onClick={() => { setActiveCategory('Semua'); setSubFilter('SEMUA'); }} className="mt-8 text-islamic-green-600 font-black text-xs uppercase tracking-widest hover:underline">Reset Filter</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Journals;
