
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, School } from 'lucide-react';
import { SCHOOL_NAME } from '../constants';

import { useContext } from 'react';
import { LevelContext } from '../App';
import { useLevelConfig } from '../hooks/useLevelConfig';

const Footer: React.FC = () => {
  const { activeLevel } = useContext(LevelContext);
  const LEVEL_CONFIG = useLevelConfig();
  const theme = LEVEL_CONFIG[activeLevel];
  const bgClass = `bg-${theme.color}-900`;
  return (
    <footer className={`${bgClass} text-white pt-24 pb-12 relative overflow-hidden transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
          {/* Brand Info */}
          <div className="space-y-8">
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 p-2 rounded-xl border border-white/20">
                <School className="text-islamic-gold-500 w-8 h-8" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl text-white tracking-tight leading-none">{SCHOOL_NAME}</span>
                <span className="text-[10px] font-bold text-islamic-gold-500 uppercase tracking-widest mt-1">Islami & Qurani</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/80 font-medium">
              Membentuk intelektual muslim yang unggul, berkarakter Qurani, dan berdaya saing global melalui pendidikan berkualitas terpadu.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/lpialhidayahkauman" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-2xl hover:bg-islamic-gold-500 hover:text-white transition-all border border-white/10">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-2xl hover:bg-islamic-gold-500 hover:text-white transition-all border border-white/10">
                <Facebook className="w-5 h-5" />
              </a>
              <button className="p-3 bg-white/5 rounded-2xl hover:bg-islamic-gold-500 hover:text-white transition-all border border-white/10">
                <Twitter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-black text-lg mb-8 relative inline-block">
              Navigasi Cepat
              <div className="absolute -bottom-2 left-0 h-1 w-10 bg-islamic-gold-500 rounded-full"></div>
            </h3>
            <ul className="space-y-4 text-sm font-semibold">
              <li><Link to="/berita" className="hover:text-islamic-gold-500 transition-colors flex items-center gap-2 group"><div className="w-1.5 h-1.5 rounded-full bg-islamic-gold-500 group-hover:scale-150 transition-transform"></div> Warta Sekolah</Link></li>
              <li><Link to="/projek" className="hover:text-islamic-gold-500 transition-colors flex items-center gap-2 group"><div className="w-1.5 h-1.5 rounded-full bg-islamic-gold-500 group-hover:scale-150 transition-transform"></div> Galeri Inovasi</Link></li>
              <li><Link to="/jurnal" className="hover:text-islamic-gold-500 transition-colors flex items-center gap-2 group"><div className="w-1.5 h-1.5 rounded-full bg-islamic-gold-500 group-hover:scale-150 transition-transform"></div> Jurnal Akademik</Link></li>
              <li><Link to="/fasilitas" className="hover:text-islamic-gold-500 transition-colors flex items-center gap-2 group"><div className="w-1.5 h-1.5 rounded-full bg-islamic-gold-500 group-hover:scale-150 transition-transform"></div> Fasilitas Santri</Link></li>
            </ul>
          </div>

          {/* Academic */}
          <div>
            <h3 className="text-white font-black text-lg mb-8 relative inline-block">
              Tentang Kami
              <div className="absolute -bottom-2 left-0 h-1 w-10 bg-islamic-gold-500 rounded-full"></div>
            </h3>
            <ul className="space-y-4 text-sm font-semibold">
              <li><Link to="/tentang/visi-misi" className="hover:text-islamic-gold-500 transition-colors flex items-center gap-2 group"><div className="w-1.5 h-1.5 rounded-full bg-islamic-gold-500 group-hover:scale-150 transition-transform"></div> Visi & Misi</Link></li>
              <li><Link to="/tentang/profil" className="hover:text-islamic-gold-500 transition-colors flex items-center gap-2 group"><div className="w-1.5 h-1.5 rounded-full bg-islamic-gold-500 group-hover:scale-150 transition-transform"></div> Profil Lengkap</Link></li>
              <li><Link to="/tentang/struktur" className="hover:text-islamic-gold-500 transition-colors flex items-center gap-2 group"><div className="w-1.5 h-1.5 rounded-full bg-islamic-gold-500 group-hover:scale-150 transition-transform"></div> Manajemen Sekolah</Link></li>
              <li><Link to="/tentang/prestasi" className="hover:text-islamic-gold-500 transition-colors flex items-center gap-2 group"><div className="w-1.5 h-1.5 rounded-full bg-islamic-gold-500 group-hover:scale-150 transition-transform"></div> Capaian Juara</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-black text-lg mb-8 relative inline-block">
              Kontak Resmi
              <div className="absolute -bottom-2 left-0 h-1 w-10 bg-islamic-gold-500 rounded-full"></div>
            </h3>
            <ul className="space-y-6 text-sm">
              <li className="flex items-start group">
                <div className="p-2 bg-white/5 rounded-xl mr-4 group-hover:bg-islamic-gold-500 group-hover:text-white transition-all"><MapPin className="w-5 h-5 text-islamic-gold-500 group-hover:text-inherit" /></div>
                <a href="https://share.google/6fpKEOeoZkTFmdUKS">
                  <span className="font-medium text-white/80 leading-relaxed">Jl. KH Hasyim Asyari No.27, Kauman, Kec. Kauman, Kabupaten Tulungagung, Jawa Timur 66261</span>
                </a>
              </li>
              <li className="flex items-center group">
                <div className="p-2 bg-white/5 rounded-xl mr-4 group-hover:bg-islamic-gold-500 group-hover:text-white transition-all"><Phone className="w-5 h-5 text-islamic-gold-500 group-hover:text-inherit" /></div>
                <a href="https://wa.me/6285749555505">
                  <span className="font-bold text-white">085749555505</span>
                </a>
              </li>
              <li className="flex items-center group">
                <div className="p-2 bg-white/5 rounded-xl mr-4 group-hover:bg-islamic-gold-500 group-hover:text-white transition-all"><Mail className="w-5 h-5 text-islamic-gold-500 group-hover:text-inherit" /></div>
                <span className="font-bold text-white">lpialhidayahkauman@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-24 pt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-white/60">
          <p>&copy; {new Date().getFullYear()} {SCHOOL_NAME}. Berkhidmat untuk pendidikan bangsa.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-islamic-gold-500">Kebijakan Privasi</a>
            <a href="#" className="hover:text-islamic-gold-500">Syarat & Ketentuan</a>
          </div>
        </div>
      </div>
      {/* Background Patterns */}
      <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/islamic-art.png')]"></div>
    </footer>
  );
};

export default Footer;
