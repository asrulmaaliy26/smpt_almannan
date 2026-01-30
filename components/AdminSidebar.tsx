
import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Newspaper,
  Lightbulb,
  BookOpen,
  ArrowLeft,
  LayoutDashboard,
  TrendingUp,
  Layers
} from 'lucide-react';
import { SCHOOL_NAME } from '../constants';
import { LevelContext } from '../App';
import { useLevelConfig } from '../hooks/useLevelConfig';
import { EducationLevel } from '../types';

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { activeLevel, setActiveLevel } = useContext(LevelContext);
  const LEVEL_CONFIG = useLevelConfig();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: TrendingUp },
    { name: 'Kelola Berita', path: '/admin/news', icon: Newspaper },
    { name: 'Kelola Projek', path: '/admin/projects', icon: Lightbulb },
    { name: 'Kelola Jurnal', path: '/admin/journals', icon: BookOpen },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-slate-900 text-white fixed h-full hidden lg:flex flex-col overflow-y-auto z-40">
      <div className="p-8 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <LayoutDashboard className="text-islamic-gold-500" />
          <h1 className="font-black text-xl tracking-tight">Admin CMS</h1>
        </div>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-tight">
          {SCHOOL_NAME}
        </p>
      </div>

      <div className="p-6 border-b border-white/5">
        <p className="text-[10px] font-black text-slate-500 uppercase mb-4 flex items-center gap-2">
          <Layers className="w-3 h-3" /> Scope Wilayah
        </p>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(LEVEL_CONFIG).map(l => (
            <button
              key={l}
              onClick={() => setActiveLevel(l as any)}
              className={`py-2 rounded-lg text-[10px] font-black border transition-all ${activeLevel === l ? 'bg-islamic-gold-500 border-islamic-gold-500 text-white' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <nav className="p-6 space-y-2 flex-grow">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${isActive(item.path)
                ? 'bg-white text-slate-900 shadow-lg'
                : 'text-slate-400 hover:bg-white/5'
              }`}
          >
            <item.icon className="w-4 h-4" /> {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5 flex-shrink-0">
        <Link to="/" className="flex items-center gap-3 px-4 py-3 hover:text-islamic-gold-500 text-sm font-bold transition-all text-slate-400">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Web
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
