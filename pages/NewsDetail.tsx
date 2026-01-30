
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchNewsDetail, fetchNews } from '../services/api';
import { useCache } from '../context/CacheContext';
import { NewsItem } from '../types';
import { ArrowLeft, Calendar, Eye, ZoomIn, X, User, Share2, Bookmark } from 'lucide-react';
import { LevelContext } from '../App';
import { useLevelConfig } from '../hooks/useLevelConfig';

const NewsDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [news, setNews] = useState<NewsItem | null>(null);
    const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [imgLoaded, setImgLoaded] = useState(false);
    const [error, setError] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const { homeCache } = useCache();
    const { activeLevel } = useContext(LevelContext);
    const LEVEL_CONFIG = useLevelConfig();
    const theme = LEVEL_CONFIG[activeLevel];

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;

            // 1. Optimistic Cache Check
            const cachedItem = homeCache.allNews.find(n => n.id === id) || homeCache.news.find(n => n.id === id);

            if (cachedItem) {
                setNews(cachedItem);
                setLoading(false);
            } else {
                setLoading(true);
            }

            // 2. Initial Related News from Cache
            let sourceForRelated = homeCache.allNews.length > 0 ? homeCache.allNews : homeCache.news;
            if (sourceForRelated.length > 0) {
                setRelatedNews(sourceForRelated.filter(n => n.id !== id).slice(0, 3));
            }

            setError(false);
            try {
                // 3. Background Fetch Detail
                const detail = await fetchNewsDetail(id);
                setNews(detail);

                // 4. Background Fetch Related (only if needed)
                if (homeCache.allNews.length === 0) {
                    const allNews = await fetchNews();
                    const related = allNews
                        .filter(n => n.id !== id)
                        .slice(0, 3);
                    setRelatedNews(related);
                }

            } catch (err) {
                console.error(err);
                if (!cachedItem) setError(true);
            } finally {
                setLoading(false);
            }
        };

        window.scrollTo(0, 0);
        loadData();
    }, [id, homeCache.allNews, homeCache.news]);

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-slate-50">
            <div className={`animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 ${theme.text} opacity-80`}></div>
        </div>
    );

    if (error || !news) return (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center min-h-screen flex flex-col items-center justify-center">
            <div className="bg-red-50 p-6 rounded-full mb-6 animate-bounce">
                <X className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">Berita Tidak Ditemukan</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">Mungkin tautan yang Anda tuju sudah kadaluarsa atau terjadi kesalahan teknis.</p>
            <Link to="/berita" className={`inline-flex items-center gap-2 ${theme.bg} text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
                <ArrowLeft className="w-5 h-5" /> Kembali ke Warta
            </Link>
        </div>
    );

    const newsTheme = LEVEL_CONFIG[news.jenjang] || LEVEL_CONFIG['UMUM'];

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-islamic-green-200 selection:text-islamic-green-900 overflow-x-hidden">
            {/* Ambient Background Elements */}
            <div className={`fixed top-0 left-0 w-[500px] h-[500px] ${newsTheme.bg} opacity-5 blur-[120px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0`}></div>
            <div className="fixed bottom-0 right-0 w-[800px] h-[800px] bg-slate-200 opacity-20 blur-[150px] rounded-full pointer-events-none translate-x-1/3 translate-y-1/3 z-0"></div>

            <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
                {/* Navigation Bar */}
                <div className="flex justify-between items-center mb-10">
                    <Link to="/berita" className="group inline-flex items-center text-slate-500 hover:text-slate-900 font-bold gap-3 transition-all px-5 py-3 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-slate-200/50">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Kembali ke Warta</span>
                    </Link>
                    <div className="flex gap-2">
                        <button className="p-3 bg-white rounded-xl text-slate-400 hover:text-islamic-green-600 hover:shadow-lg transition-all border border-slate-100 hover:border-islamic-green-100">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button className="p-3 bg-white rounded-xl text-slate-400 hover:text-islamic-gold-500 hover:shadow-lg transition-all border border-slate-100 hover:border-islamic-gold-100">
                            <Bookmark className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 xl:gap-16">
                    {/* Main Content Area */}
                    <div className="lg:w-2/3">
                        {/* Hero Article Header */}
                        <div className="relative mb-12 group perspective-1000">
                            {/* Main Image Container with 3D-ish Effect */}
                            <div className="rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200 relative z-10 aspect-video transform transition-all duration-700 hover:scale-[1.01]"
                                onClick={() => setSelectedImage(news.main_image)}>

                                {/* Image Placeholder / Skeleton */}
                                {!imgLoaded && (
                                    <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center z-20">
                                        <div className="flex flex-col items-center gap-3 opacity-50">
                                            <div className="w-12 h-12 border-4 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
                                        </div>
                                    </div>
                                )}

                                <img
                                    src={news.main_image}
                                    alt={news.title}
                                    className={`w-full h-full object-cover cursor-pointer transition-opacity duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                                    onLoad={() => setImgLoaded(true)}
                                />
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>

                                {/* Floating Badges */}
                                <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                                    <span className={`${newsTheme.bg} text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md border border-white/20`}>
                                        {news.jenjang}
                                    </span>
                                    <span className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg border border-white/20">
                                        {news.category}
                                    </span>
                                </div>

                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-full opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-500 border border-white/30 hidden md:block">
                                        <ZoomIn className="text-white w-8 h-8" />
                                    </div>
                                </div>

                                {/* Title Over Image (Futuristic Style) */}
                                <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    <div className="flex items-center gap-4 text-white/80 text-xs font-bold uppercase tracking-widest mb-4">
                                        <span className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/10"><Calendar className="w-3 h-3" /> {news.date}</span>
                                        <span className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/10"><Eye className="w-3 h-3" /> {news.views} views</span>
                                    </div>
                                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight drop-shadow-md">
                                        {news.title}
                                    </h1>
                                </div>
                            </div>

                            {/* Decorative blur behind image */}
                            <div className={`absolute -inset-4 ${newsTheme.bg} opacity-20 blur-[50px] rounded-[3rem] -z-10 group-hover:opacity-30 transition-opacity duration-700`}></div>
                        </div>

                        <article className="bg-white/80 backdrop-blur-sm rounded-[3rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-white relative overflow-hidden">
                            {/* Content Background Decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

                            {/* Content with HTML processing */}
                            <div
                                className="prose prose-lg prose-slate max-w-none
                                prose-headings:font-black prose-headings:text-slate-900 
                                prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-islamic-green-600 prose-a:no-underline prose-a:border-b-2 prose-a:border-islamic-green-200 hover:prose-a:border-islamic-green-500 prose-a:transition-colors
                                prose-img:rounded-3xl prose-img:shadow-lg prose-img:w-full prose-img:my-10 prose-img:border prose-img:border-slate-100
                                marker:text-slate-300"
                                dangerouslySetInnerHTML={{ __html: news.content }}
                            />

                            <div className="border-t border-slate-100 my-10 pt-8 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-slate-500 border border-slate-200 shadow-inner">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Penulis</p>
                                        <p className="text-sm font-bold text-slate-800">Administrator</p>
                                    </div>
                                </div>
                            </div>
                        </article>

                        {/* Gallery / Attachments */}
                        {news.gallery && news.gallery.length > 0 && (
                            <div className="mt-12">
                                <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
                                    <span className={`w-12 h-12 rounded-2xl ${newsTheme.bg} flex items-center justify-center text-white shadow-lg shadow-islamic-green-500/20`}>
                                        <ZoomIn className="w-6 h-6" />
                                    </span>
                                    <span>Galeri & Lampiran</span>
                                </h3>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                                    {news.gallery.map((img, idx) => (
                                        <div
                                            key={idx}
                                            className="group relative aspect-square rounded-[2rem] overflow-hidden cursor-pointer bg-white shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-white"
                                            onClick={() => setSelectedImage(img)}
                                        >
                                            <img
                                                src={img}
                                                alt={`Gallery ${idx + 1}`}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-6">
                                                <p className="text-white text-xs font-bold uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform duration-500">View Image</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:w-1/3 space-y-8">
                        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-white sticky top-28">
                            <div className="flex items-center gap-3 mb-8">
                                <div className={`w-2 h-10 ${theme.bg} rounded-full`}></div>
                                <h3 className="text-xl font-black text-slate-900">Berita Terkait</h3>
                            </div>

                            <div className="space-y-6">
                                {relatedNews.map(item => (
                                    <Link to={`/berita/${item.id}`} key={item.id} className="group block bg-slate-50 hover:bg-white p-4 rounded-3xl transition-all duration-300 border border-transparent hover:border-slate-100 hover:shadow-lg">
                                        <div className="flex gap-4 items-start">
                                            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 relative box-border shadow-sm">
                                                <img src={item.main_image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <div>
                                                <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest text-white mb-2 ${LEVEL_CONFIG[item.jenjang]?.bg || 'bg-slate-400'}`}>
                                                    {item.jenjang}
                                                </span>
                                                <h4 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-islamic-green-600 transition-colors line-clamp-2 mb-2">
                                                    {item.title}
                                                </h4>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.date}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                                <Link to="/berita" className="inline-block text-sm font-bold text-slate-500 hover:text-islamic-green-600 transition-colors uppercase tracking-widest">
                                    Lihat Semua Berita
                                </Link>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Lightbox Modal (Futuristic) */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
                        <span className="text-white/50 text-xs font-bold uppercase tracking-[0.2em] animate-slideDown">Preview Mode</span>
                        <button
                            className="text-white/50 hover:text-white hover:rotate-90 transition-all bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <img
                        src={selectedImage}
                        alt="Full size"
                        className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl shadow-black/50 animate-scaleIn object-contain ring-1 ring-white/10"
                        onClick={(e) => e.stopPropagation()}
                    />

                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 text-xs font-medium tracking-widest animate-pulse">
                        Klik di mana saja untuk menutup
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsDetail;
