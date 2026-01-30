

import React, { useState, useContext, useEffect, useMemo } from 'react';
import { fetchNewsCategories, fetchNewsWithLimit } from '../services/api';
import { Search, TrendingUp, Filter, Check, Loader2 } from 'lucide-react';
import { LevelContext } from '../App';
import { Link } from 'react-router-dom';
import { useLevelConfig } from '../hooks/useLevelConfig';
import { NewsItem } from '../types';
import NewsCard from '../components/NewsCard';
import SkeletonNewsCard from '../components/SkeletonNewsCard';
import { useCache } from '../context/CacheContext';

const News: React.FC = () => {
  const { homeCache, setHomeCache } = useCache();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Semua');

  // Init data from cache
  const [categories, setCategories] = useState<string[]>(homeCache.newsCategories && homeCache.newsCategories.length > 0 ? homeCache.newsCategories : ['Semua']);
  const [news, setNews] = useState<NewsItem[]>(homeCache.allNews || []);

  const [catLoading, setCatLoading] = useState(homeCache.newsCategories && homeCache.newsCategories.length > 0 ? false : true);
  const [newsLoading, setNewsLoading] = useState(!homeCache.isNewsLoaded);

  const [limit, setLimit] = useState(homeCache.allNews?.length || 6);
  const [hasMore, setHasMore] = useState(true);

  const { activeLevel } = useContext(LevelContext);
  const LEVEL_CONFIG = useLevelConfig();

  // Initial Data Load (Categories)
  useEffect(() => {
    if (homeCache.newsCategories && homeCache.newsCategories.length > 0) return;

    const loadCategories = async () => {
      try {
        const catsData = await fetchNewsCategories();
        setCategories(catsData);
        setHomeCache({ newsCategories: catsData });
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setCatLoading(false);
      }
    };
    loadCategories();
  }, []);

  // News Data Load (with limit)
  useEffect(() => {
    // If loaded from cache and we have enough data for current limit, skip fetch
    if (homeCache.isNewsLoaded && news.length >= limit) {
      setNewsLoading(false);
      return;
    }

    const loadNews = async () => {
      setNewsLoading(true);
      try {
        const newsData = await fetchNewsWithLimit(limit);
        setNews(newsData);
        setHomeCache({ allNews: newsData, isNewsLoaded: true });

        // If we received fewer items than requested limit, we've reached the end
        if (newsData.length < limit) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } catch (error) {
        console.error('Error loading news:', error);
      } finally {
        setNewsLoading(false);
      }
    };
    loadNews();
  }, [limit]);

  const filteredNews = useMemo(() => {
    return news.filter(n => {
      const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = activeLevel === 'UMUM' ? true : n.jenjang === activeLevel;
      const matchesCategory = activeCategory === 'Semua' ? true : n.category === activeCategory;

      return matchesSearch && matchesLevel && matchesCategory;
    });
  }, [news, searchTerm, activeLevel, activeCategory]);

  const loadMore = () => {
    setLimit(prev => prev + 6);
  };

  const trendingNews = useMemo(() => {
    return [...news]
      .filter(n => activeLevel === 'UMUM' ? true : n.jenjang === activeLevel)
      .sort((a, b) => b.views - a.views)
      .slice(0, 4);
  }, [news, activeLevel]);

  const theme = LEVEL_CONFIG[activeLevel];

  const renderedNews = useMemo(() => {
    return filteredNews.map(news => (
      <NewsCard
        key={news.id}
        news={news}
        levelConfig={LEVEL_CONFIG}
        theme={theme}
      />
    ));
  }, [filteredNews, LEVEL_CONFIG, theme]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 md:py-20">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Main Feed */}
        <div className="md:w-2/3 space-y-12">
          {/* ... content ... */}
          <header>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-1 bg-islamic-gold-500 rounded-full`}></div>
              <span className={`text-xs font-black uppercase tracking-[0.3em] ${theme.text}`}>Update Terkini</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">Warta & Berita</h1>
            <p className="text-slate-500 mb-10 max-w-xl leading-relaxed">
              Ikuti perkembangan terbaru, prestasi santri, dan pengumuman resmi di lingkungan {activeLevel === 'UMUM' ? 'Yayasan Unggul Bangsa' : theme.name}.
            </p>

            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative group max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-islamic-green-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Cari berita..."
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm focus:ring-4 focus:ring-islamic-green-500/10 focus:border-islamic-green-500 transition-all outline-none font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 mr-2 text-slate-400">
                  <Filter className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Filter:</span>
                </div>
                {catLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900 mx-4"></div>
                ) : (
                  categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-6 py-2.5 rounded-full text-xs font-black transition-all duration-300 border ${activeCategory === cat
                        ? `${theme.bg} text-white border-transparent shadow-lg shadow-black/5`
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                        }`}
                    >
                      {cat}
                    </button>
                  ))
                )}
              </div>
            </div>
          </header>
          <div className="space-y-10">
            {newsLoading && limit === 6 ? (
              <div className="space-y-10">
                {Array(3).fill(0).map((_, i) => <SkeletonNewsCard key={i} />)}
              </div>
            ) : filteredNews.length > 0 ? (
              <>
                <div className="space-y-10">
                  {renderedNews}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center pt-8">
                    <button
                      onClick={loadMore}
                      disabled={newsLoading}
                      className={`px-8 py-3 rounded-full font-bold text-white transition-all shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 ${theme.bg}`}
                    >
                      {newsLoading ? (
                        <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Memuat...</span>
                      ) : (
                        "Muat Lebih Banyak"
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-32 bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Search className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-slate-400 font-black uppercase tracking-widest">Tidak ada warta ditemukan</p>
                <button
                  onClick={() => { setSearchTerm(''); setActiveCategory('Semua'); }}
                  className="mt-6 text-islamic-green-600 font-bold text-sm underline"
                >
                  Reset Pencarian
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}

        <aside className="md:w-1/3">
          <div className="sticky top-28 space-y-10">
            <div className="bg-white p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-6 md:mb-10 flex items-center">
                <TrendingUp className="text-islamic-gold-500 mr-4 w-7 h-7" /> Populer
              </h3>
              <div className="space-y-6 md:space-y-10">
                {trendingNews.map((news, index) => (
                  <Link to={`/berita/${news.id}`} key={news.id} className="flex gap-5 group">
                    <span className="text-5xl font-black text-slate-50 group-hover:text-islamic-green-100 transition-colors leading-none">{(index + 1).toString().padStart(2, '0')}</span>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-islamic-green-600 transition-colors line-clamp-2">{news.title}</h4>
                      <div className="flex items-center gap-3 mt-3">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${theme.bg} text-white uppercase tracking-widest`}>{news.jenjang}</span>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{news.views} views</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-islamic-green-900 p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/10">
                  <Check className="w-8 h-8 text-islamic-gold-500" />
                </div>
                <h4 className="text-2xl font-black mb-4">Newsletter</h4>
                <p className="text-islamic-green-200 text-sm mb-10 leading-relaxed font-medium">Berlangganan untuk mendapatkan ringkasan kegiatan mingguan sekolah.</p>
                <div className="space-y-4">
                  <input type="email" placeholder="Email Anda..." className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 placeholder-islamic-green-600 outline-none focus:bg-white/10 focus:border-white/20 text-sm transition-all" />
                  <button className="w-full bg-islamic-gold-500 text-white font-black py-5 rounded-2xl hover:bg-islamic-gold-600 transition-all shadow-xl shadow-black/30">Daftar Sekarang</button>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/islamic-art.png')]"></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default News;
