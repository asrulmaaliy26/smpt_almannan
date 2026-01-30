
import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X, School, UserCog, Layers } from 'lucide-react';
import { SCHOOL_NAME } from '../constants';
import { LevelContext } from '../App';
import { EducationLevel } from '../types';
import { useLevelConfig } from '../hooks/useLevelConfig';

const Navbar: React.FC = () => {
  const { activeLevel, setActiveLevel } = useContext(LevelContext);
  const LEVEL_CONFIG = useLevelConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isMobileAboutOpen, setIsMobileAboutOpen] = useState(false);
  const [isLevelSelectorOpen, setIsLevelSelectorOpen] = useState(false);
  const location = useLocation();

  const currentTheme = LEVEL_CONFIG[activeLevel];

  const levels = React.useMemo(() => {
    const keys = Object.keys(LEVEL_CONFIG) as EducationLevel[];
    const umumIndex = keys.indexOf('UMUM');
    if (umumIndex > -1) {
      keys.splice(umumIndex, 1);
      keys.unshift('UMUM');
    }
    return keys;
  }, [LEVEL_CONFIG]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Berita', path: '/berita' },
    { name: 'Praktek', path: '/projek' },
    { name: 'Jurnal', path: '/jurnal' },
    { name: 'Fasilitas', path: '/fasilitas' },
  ];

  const aboutLinks = [
    { name: 'Visi & Misi', path: '/tentang/visi-misi' },
    { name: 'Profil Lengkap', path: '/tentang/profil' },
    { name: 'Struktur Organisasi', path: '/tentang/struktur' },
    { name: 'Prestasi', path: '/tentang/prestasi' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center space-x-3 group">
              <img src={import.meta.env.VITE_APP_LOGO} alt="Logo" className="w-10 h-10 object-contain rounded-full group-hover:rotate-6 transition-transform drop-shadow-md" />
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-slate-900 leading-none">{currentTheme.name}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Lembaga Pendidikan Islam</span>
              </div>
            </Link>

            {/* Jenjang Selector - Desktop */}
            <div className="hidden xl:relative xl:block" onMouseEnter={() => setIsLevelSelectorOpen(true)} onMouseLeave={() => setIsLevelSelectorOpen(false)}>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black text-slate-600 hover:bg-white transition-all">
                <Layers className="w-4 h-4 text-islamic-gold-500" />
                JENJANG: {activeLevel}
                <ChevronDown className="w-3 h-3" />
              </button>
              {isLevelSelectorOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden py-2 animate-fadeIn z-[60]">
                  {levels.map(l => (
                    <button
                      key={l}
                      onClick={() => { setActiveLevel(l); setIsLevelSelectorOpen(false); }}
                      className={`w-full text-left px-5 py-3 text-xs font-black hover:bg-slate-50 transition-colors ${activeLevel === l ? 'text-islamic-gold-500' : 'text-slate-600'}`}
                    >
                      {l === 'UMUM' ? 'Pusat (Umum)' : l}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${isActive(link.path)
                  ? `${currentTheme.bg} text-white shadow-md`
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                {link.name}
              </Link>
            ))}

            {/* About Dropdown */}
            <div className="relative" onMouseEnter={() => setIsAboutOpen(true)} onMouseLeave={() => setIsAboutOpen(false)}>
              <button
                className={`flex items-center px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${location.pathname.startsWith('/tentang')
                  ? `${currentTheme.bg} text-white shadow-md`
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                Tentang <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${isAboutOpen ? 'rotate-180' : ''}`} />
              </button>
              <div
                className={`${isAboutOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'} absolute left-0 mt-0 w-56 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden py-2 z-50 transition-all duration-300`}
              >
                {aboutLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="block px-5 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 hover:text-islamic-gold-500"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="h-8 w-px bg-slate-100 mx-4"></div>

            <Link to="/admin" className="p-2.5 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
              <UserCog className="w-5 h-5" />
            </Link>

            <a
              href="https://ppdb.almannan.id/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${currentTheme.bg} ml-4 text-white px-6 py-3 rounded-full font-bold text-sm hover:brightness-110 transition-all shadow-lg`}
            >
              PPDB
            </a>
            {/* Mobile menu button */}
            <Link to="/contact" className={`${currentTheme.bg} ml-2 text-white px-6 py-3 rounded-full font-bold text-sm hover:brightness-110 transition-all shadow-lg`}>
              Hubungi
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-900 bg-slate-50"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 py-6 px-4 space-y-4 animate-fadeIn">
          <div className="grid grid-cols-5 gap-2 px-2">
            {levels.map(l => (
              <button
                key={l}
                onClick={() => setActiveLevel(l)}
                className={`py-2 rounded-lg text-[10px] font-black border transition-all ${activeLevel === l ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
              >
                {l}
              </button>
            ))}
          </div>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`block px-4 py-3 text-sm font-black rounded-xl ${isActive(link.path) ? `${currentTheme.bg} text-white` : 'text-slate-700 bg-slate-50'
                }`}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          {/* Mobile About Dropdown */}
          <div className="rounded-xl overflow-hidden">
            <button
              onClick={() => setIsMobileAboutOpen(!isMobileAboutOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-black rounded-xl transition-all ${location.pathname.startsWith('/tentang') || isMobileAboutOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-700 bg-slate-50'}`}
            >
              Tentang
              <ChevronDown className={`w-4 h-4 transition-transform ${isMobileAboutOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`space-y-1 pl-4 pr-2 overflow-hidden transition-all duration-300 ease-in-out ${isMobileAboutOpen ? 'max-h-96 opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
              {aboutLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-2 text-xs font-bold rounded-lg transition-colors ${isActive(link.path) ? 'text-islamic-gold-600 bg-islamic-gold-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <a
            href="https://ppdb.almannan.id/"
            target="_blank"
            rel="noopener noreferrer"
            className={`block px-4 py-3 text-center text-sm font-black rounded-xl ${currentTheme.bg} text-white shadow-lg`}
            onClick={() => setIsOpen(false)}
          >
            PPDB Online
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
