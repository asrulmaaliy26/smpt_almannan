import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye, TrendingUp } from 'lucide-react';
import { NewsItem, LevelConfigData } from '../types';

interface NewsCardProps {
    news: NewsItem;
    theme: LevelConfigData[keyof LevelConfigData]; // Or specific theme type
    levelConfig: LevelConfigData;
}

const NewsCard: React.FC<NewsCardProps> = memo(({ news, levelConfig }) => {
    // Determine theme based on news level
    const newsTheme =
        news.jenjang === 'SMA'
            ? levelConfig['MA']
            : levelConfig[news.jenjang];

    return (
        <article className="bg-white rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border border-slate-100 flex flex-col sm:flex-row group h-full">
            <div className="sm:w-2/5 h-64 sm:h-auto overflow-hidden relative">
                <img
                    src={news.main_image}
                    alt={news.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className={`absolute top-6 left-6 ${newsTheme.bg} text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl`}>
                    {news.jenjang}
                </div>
            </div>
            <div className="sm:w-3/5 p-10 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-4 mb-6">
                        <span className="bg-slate-50 text-slate-400 border border-slate-100 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">{news.category}</span>
                        <span className="text-slate-400 text-[10px] font-bold flex items-center uppercase tracking-widest gap-2">
                            <Calendar className="w-4 h-4 text-islamic-gold-500" /> {news.date}
                        </span>
                    </div>
                    <Link to={`/berita/${news.id}`}>
                        <h2 className="text-2xl font-black text-slate-900 mb-4 leading-tight group-hover:text-islamic-green-700 transition-colors">{news.title}</h2>
                    </Link>
                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-8">{news.excerpt}</p>
                </div>
                <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                    <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        <Eye className="w-4 h-4 mr-2 text-islamic-green-600" /> {news.views.toLocaleString()} Pembaca
                    </div>
                    <Link to={`/berita/${news.id}`} className="text-islamic-green-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                        Baca Berita <TrendingUp className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </article>
    );
});

export default NewsCard;
