
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchNewsDetail, fetchNews, incrementNewsViews } from '../services/api';
import { useCache } from '../context/CacheContext';
import { NewsItem } from '../types';
import { ArrowLeft, Calendar, Eye, ZoomIn, X, User, Share2, Bookmark, Clock } from 'lucide-react';
import { LevelContext } from '../App';
import { useLevelConfig } from '../hooks/useLevelConfig';
import 'react-quill-new/dist/quill.snow.css';

// Helper to format date and time in Indonesian locale with hours, minutes, seconds
const formatNewsDateTime = (dateStr?: string, createdAtStr?: string) => {
    if (!dateStr && !createdAtStr) {
        return {
            dateText: '-',
            timeText: '00:00:00 WIB',
            fullText: '-'
        };
    }

    let dateObj: Date = new Date();
    const d = dateStr ? new Date(dateStr) : null;
    const c = createdAtStr ? new Date(createdAtStr) : null;

    // Check if created_at has valid non-zero time
    if (c && !isNaN(c.getTime()) && (c.getHours() !== 0 || c.getMinutes() !== 0 || c.getSeconds() !== 0)) {
        if (d && !isNaN(d.getTime())) {
            dateObj = new Date(d.getFullYear(), d.getMonth(), d.getDate(), c.getHours(), c.getMinutes(), c.getSeconds());
        } else {
            dateObj = c;
        }
    } else if (d && !isNaN(d.getTime())) {
        dateObj = d;
    } else if (c && !isNaN(c.getTime())) {
        dateObj = c;
    }

    try {
        const dateText = dateObj.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const timeText = dateObj.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).replace(/\./g, ':') + ' WIB';

        return {
            dateText,
            timeText,
            fullText: `${dateText} • ${timeText}`
        };
    } catch {
        return {
            dateText: dateStr || '-',
            timeText: '00:00:00 WIB',
            fullText: dateStr || '-'
        };
    }
};

const formatShortDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    } catch {
        return dateStr;
    }
};

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


    // Separate effect for view incrementing to avoid dupes when cache updates
    // Using ref to track the last incremented ID to prevent double-fire in StrictMode
    const lastIncrementedId = React.useRef<string | null>(null);

    useEffect(() => {
        if (!id) return;

        // If we already incremented for this ID, skip
        if (lastIncrementedId.current === id) return;

        // Mark this ID as incremented
        lastIncrementedId.current = id;

        const inc = async () => {
            try {
                const viewRes = await incrementNewsViews(id);
                setNews(prev => prev ? { ...prev, views: viewRes.views } : prev);
            } catch (e) {
                console.error("Failed to increment views", e);
            }
        };
        inc();
    }, [id]);

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
    const dateTimeInfo = formatNewsDateTime(news.date, news.created_at);

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-islamic-green-200 selection:text-islamic-green-900 overflow-x-hidden">
            {/* Ambient Background Elements */}
            <div className={`fixed top-0 left-0 w-[500px] h-[500px] ${newsTheme.bg} opacity-5 blur-[120px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0`}></div>
            <div className="fixed bottom-0 right-0 w-[800px] h-[800px] bg-slate-200 opacity-20 blur-[150px] rounded-full pointer-events-none translate-x-1/3 translate-y-1/3 z-0"></div>

            <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
                {/* Navigation Bar */}
                <div className="flex justify-between items-center mb-8">
                    <Link to="/berita" className="group inline-flex items-center text-slate-500 hover:text-slate-900 font-bold gap-3 transition-all px-5 py-3 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-slate-200/50">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Kembali ke Warta</span>
                    </Link>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({ title: news.title, url: window.location.href }).catch(() => {});
                                } else {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Tautan berita berhasil disalin ke clipboard!');
                                }
                            }}
                            title="Bagikan Berita"
                            className="p-3 bg-white rounded-xl text-slate-400 hover:text-islamic-green-600 hover:shadow-lg transition-all border border-slate-100 hover:border-islamic-green-100"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button 
                            title="Simpan"
                            className="p-3 bg-white rounded-xl text-slate-400 hover:text-islamic-gold-500 hover:shadow-lg transition-all border border-slate-100 hover:border-islamic-gold-100"
                        >
                            <Bookmark className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 xl:gap-16">
                    {/* Main Content Area */}
                    <div className="lg:w-2/3">
                        {/* 1. Kategori & Jenjang di Bagian Paling Atas Sebelum Judul */}
                        <div className="flex flex-wrap items-center gap-2 mb-3.5">
                            <span className={`${newsTheme.bg} text-white px-3.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-sm`}>
                                {news.jenjang}
                            </span>
                            {news.category && (
                                <span className="bg-slate-200/70 hover:bg-slate-200 text-slate-700 border border-slate-300/60 px-3.5 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors">
                                    {news.category}
                                </span>
                            )}
                        </div>

                        {/* 2. Judul Berita (Di Atas Gambar) */}
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.6rem] font-black text-slate-900 leading-[1.25] tracking-tight mb-4">
                            {news.title}
                        </h1>

                        {/* 3. Tanggal Upload & Jam Upload Lengkap (Kecil di Atas Gambar) */}
                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-slate-500 font-medium mb-6 pb-6 border-b border-slate-200/80">
                            <div className="flex items-center gap-1.5 text-slate-600">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span>{dateTimeInfo.dateText}</span>
                            </div>
                            <span className="hidden sm:inline text-slate-300">•</span>
                            <div className="flex items-center gap-1.5 bg-slate-100/90 text-slate-700 px-2.5 py-1 rounded-lg font-semibold text-xs border border-slate-200/60">
                                <Clock className="w-3.5 h-3.5 text-islamic-green-600" />
                                <span>{dateTimeInfo.timeText}</span>
                            </div>
                            <span className="hidden sm:inline text-slate-300">•</span>
                            <div className="flex items-center gap-1.5 text-slate-500">
                                <User className="w-4 h-4 text-slate-400" />
                                <span>Administrator</span>
                            </div>
                        </div>

                        {/* 4. Banner Dokumentasi Gambar (Jelas Tanpa Ketutupan Judul, Views di Sudut Atas Gambar) */}
                        <div className="relative mb-10 group perspective-1000">
                            {/* Main Image Container */}
                            <div 
                                className="rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/80 relative z-10 aspect-video transform transition-all duration-700 hover:scale-[1.01] cursor-pointer bg-slate-900"
                                onClick={() => setSelectedImage(news.main_image)}
                            >
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
                                    className={`w-full h-full object-cover transition-opacity duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                                    onLoad={() => setImgLoaded(true)}
                                />

                                {/* Subtle ambient tint on hover, documentation remains clean & visible */}
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300 pointer-events-none"></div>

                                {/* Floating Views Badge (Di Atas Gambar / Masuk Dalam Gambar) */}
                                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 pointer-events-none">
                                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md text-white text-xs sm:text-sm font-bold px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/25 shadow-xl">
                                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                                        <span>{news.views || 0} Dilihat</span>
                                    </div>
                                </div>

                                {/* Zoom hover indicator */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="bg-black/50 backdrop-blur-md p-3.5 rounded-full opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 border border-white/30 hidden md:flex items-center gap-2 text-white text-xs font-semibold px-4 shadow-xl">
                                        <ZoomIn className="text-white w-4 h-4" />
                                        <span>Klik untuk memperbesar</span>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative blur behind image */}
                            <div className={`absolute -inset-4 ${newsTheme.bg} opacity-20 blur-[50px] rounded-[3rem] -z-10 group-hover:opacity-30 transition-opacity duration-700`}></div>
                        </div>

                        <article className="bg-white/80 backdrop-blur-sm rounded-[3rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-white relative overflow-hidden">
                            {/* Content Background Decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

                            {/* Content with HTML processing */}
                            <div className="ql-snow">
                                <div
                                    className="ql-editor font-sans text-lg text-slate-700 leading-relaxed !p-0 !overflow-visible
                                    [&_p]:!mb-4
                                    [&_h1]:font-black [&_h1]:text-slate-900 [&_h1]:!mb-3 [&_h1]:!mt-6
                                    [&_h2]:font-black [&_h2]:text-slate-900 [&_h2]:!mb-3 [&_h2]:!mt-6
                                    [&_h3]:font-black [&_h3]:text-slate-900 [&_h3]:!mb-3 [&_h3]:!mt-6
                                    [&_ul]:!mb-4 [&_ol]:!mb-4 [&_li]:!mb-1
                                    [&_a]:text-islamic-green-600 [&_a]:underline hover:[&_a]:text-islamic-green-700 [&_a]:transition-colors
                                    [&_strong]:font-bold [&_strong]:text-slate-900
                                    [&_img]:rounded-3xl [&_img]:shadow-lg [&_img]:w-full [&_img]:!my-8 [&_img]:border [&_img]:border-slate-100"
                                    dangerouslySetInnerHTML={{ 
                                        __html: (news.content || '')
                                            .replace(/&nbsp;/g, ' ')
                                            .replace(/\u00A0/g, ' ')
                                            .replace(/\n/g, '</p><p>')
                                            .replace(/<p><\/p>/g, '<p><br></p>')
                                            .replace(/<p>\s*<\/p>/g, '<p><br></p>')
                                    }}
                                />
                            </div>

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
                                            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 relative box-border shadow-sm bg-slate-200">
                                                <img 
                                                    src={item.main_image} 
                                                    alt={item.title} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=400&auto=format&fit=crop';
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest text-white mb-1.5 ${LEVEL_CONFIG[item.jenjang]?.bg || 'bg-slate-400'}`}>
                                                    {item.jenjang}
                                                </span>
                                                <h4 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-islamic-green-600 transition-colors line-clamp-2 mb-1.5">
                                                    {item.title}
                                                </h4>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatShortDate(item.date)}</span>
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
