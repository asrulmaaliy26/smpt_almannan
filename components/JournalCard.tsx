import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { User, GraduationCap, Star, Download, BookOpen } from 'lucide-react';
import { JournalItem, LevelConfigData } from '../types';

interface JournalCardProps {
    journal: JournalItem;
    levelConfig: LevelConfigData;
}

const JournalCard: React.FC<JournalCardProps> = memo(({ journal, levelConfig }) => {
    const journalTheme = levelConfig[journal.jenjang];
    const bgClass = journalTheme?.bg;

    return (
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group">
            <div className="flex flex-col md:flex-row gap-12">
                <div className="md:w-3/4">
                    <div className="flex flex-wrap items-center gap-3 mb-8">
                        <div className={`${bgClass} text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg`}>
                            {journal.jenjang}
                        </div>
                        <div className="bg-slate-100 text-slate-500 px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
                            {journal.category}
                        </div>
                        {journal.isBest && (
                            <div className="flex items-center bg-islamic-gold-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase shadow-lg shadow-islamic-gold-500/20">
                                <Star className="w-3 h-3 mr-2 fill-white" /> Jurnal Terbaik
                            </div>
                        )}
                        <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest ml-auto">{journal.date}</span>
                    </div>
                    <Link to={`/jurnal/${journal.id}`}>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-6 leading-tight group-hover:text-islamic-green-700 transition-colors">{journal.title}</h2>
                    </Link>
                    <div className="bg-slate-50 p-8 rounded-[2rem] mb-10 border border-slate-100/50">
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-4">Abstrak Penelitian</p>
                        <p className="text-slate-600 leading-relaxed text-sm italic line-clamp-2">
                            "{journal.abstract}"
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-8 text-sm">
                        <div className="flex items-center gap-4">
                            <div className={`w-11 h-11 rounded-2xl ${bgClass} text-white flex items-center justify-center shadow-lg shadow-black/5`}><User className="w-5 h-5" /></div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Peneliti</p>
                                <p className="font-black text-slate-900 text-xs">{journal.author}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center"><GraduationCap className="w-5 h-5" /></div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mentor</p>
                                <p className="font-bold text-slate-600 text-xs">{journal.mentor}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="md:w-1/4 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-10 md:pt-0">
                    <div className="text-center mb-8">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mb-3">Nilai Riset</p>
                        <div className={`text-6xl font-black ${bgClass}`}>{journal.score}</div>
                    </div>
                    <button className={`flex items-center gap-3 ${bgClass} text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all w-full justify-center shadow-xl shadow-black/5`}>
                        <Download className="w-4 h-4" /> Download PDF
                    </button>
                    <Link to={`/jurnal/${journal.id}`} className="mt-6 text-slate-400 font-black text-[10px] hover:text-slate-900 flex items-center gap-2 uppercase tracking-[0.2em]">
                        <BookOpen className="w-4 h-4" /> Detail
                    </Link>
                </div>
            </div>
        </div>
    );
});

export default JournalCard;
