
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Newspaper, 
  Lightbulb, 
  BookOpen, 
  Settings, 
  MessageSquare,
  Clock,
  Sparkles
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const adminStats = [
    { label: 'Total Berita', value: '24', icon: Newspaper, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Projek Aktif', value: '12', icon: Lightbulb, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Jurnal Masuk', value: '8', icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pengaduan', value: '3', icon: MessageSquare, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="p-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Ahlan wa Sahlan, Admin</h2>
          <p className="text-slate-500 font-medium">Selamat bertugas mengelola informasi sekolah hari ini.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Waktu Server</p>
              <p className="font-bold text-islamic-green-900">{new Date().toLocaleDateString('id-ID')}</p>
           </div>
           <div className="w-12 h-12 rounded-2xl bg-islamic-green-100 flex items-center justify-center text-islamic-green-600 shadow-inner">
              <Settings className="w-6 h-6" />
           </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {adminStats.map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-xl transition-all">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">{stat.label}</p>
              <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
           <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-islamic-gold-500" /> Pintasan Admin
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/admin/news/create" className="p-6 bg-islamic-green-50 border border-islamic-green-100 rounded-[2rem] hover:bg-islamic-green-600 hover:text-white transition-all group">
                 <Newspaper className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
                 <p className="font-black">Buat Berita</p>
                 <p className="text-xs opacity-60">Gunakan Smart AI Reporter</p>
              </Link>
              <Link to="/admin/projects/create" className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-islamic-gold-500 hover:text-white transition-all group">
                 <Lightbulb className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform text-islamic-gold-600 group-hover:text-white" />
                 <p className="font-black">Input Projek Siswa</p>
                 <p className="text-xs opacity-60">Dokumentasikan inovasi</p>
              </Link>
           </div>
        </section>

        {/* Activity Logs */}
        <section className="bg-islamic-green-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
           <h3 className="text-xl font-black mb-8 flex items-center gap-2">
              <Clock className="w-5 h-5 text-islamic-gold-500" /> Log Aktivitas
           </h3>
           <div className="space-y-6 relative z-10">
              {[
                { user: 'Admin 1', action: 'Update Akreditasi', time: '1 jam yang lalu' },
                { user: 'Admin 2', action: 'Publish Berita OSN', time: '3 jam yang lalu' },
                { user: 'Admin 1', action: 'Update Struktur Organisasi', time: 'Kemarin' },
              ].map((log, idx) => (
                <div key={idx} className="flex gap-4 items-start border-l-2 border-islamic-green-700 pl-4 py-1">
                   <div>
                      <p className="text-sm font-black">{log.action}</p>
                      <p className="text-xs text-islamic-green-400 font-medium">Oleh {log.user} • {log.time}</p>
                   </div>
                </div>
              ))}
           </div>
           <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/islamic-art.png')]"></div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
