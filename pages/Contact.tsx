
import React, { useState, useContext } from 'react';
import { Send, MessageSquare, AlertCircle, Phone, Mail, MapPin } from 'lucide-react';

import { submitContactUs, submitComplaint } from '../services/api';
import { Loader2 } from 'lucide-react';
import { LevelContext } from '../App';

const Contact: React.FC = () => {
   const { activeLevel } = useContext(LevelContext);
   const [formType, setFormType] = useState<'contact' | 'complaint'>('contact');

   const [name, setName] = useState('');
   const [contactInfo, setContactInfo] = useState('');
   const [message, setMessage] = useState('');
   const [category, setCategory] = useState('Sarana Prasarana');

   const [loading, setLoading] = useState(false);
   const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setStatus(null);

      try {
         if (formType === 'contact') {
            await submitContactUs({
               name,
               contact_info: contactInfo,
               message,
               jenjang: activeLevel
            });
            setStatus({ type: 'success', message: 'Pesan berhasil dikirim!' });
         } else {
            await submitComplaint({
               name,
               contact_info: contactInfo,
               category,
               message,
               jenjang: activeLevel
            });
            setStatus({ type: 'success', message: 'Pengaduan berhasil dikirim!' });
         }

         // Reset form
         setName('');
         setContactInfo('');
         setMessage('');
         setCategory('Sarana Prasarana');
      } catch (error: any) {
         setStatus({ type: 'error', message: error.message || 'Terjadi kesalahan.' });
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="max-w-7xl mx-auto px-4 py-10 md:py-20">
         <div className="flex flex-col lg:flex-row gap-10 md:gap-20">
            {/* Info Side */}
            <div className="lg:w-1/3">
               <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 md:mb-8">Hubungi Kami</h1>
               <p className="text-slate-500 mb-8 md:mb-12">
                  Punya pertanyaan atau ingin memberikan masukan? Kami siap mendengar suara Anda untuk pelayanan yang lebih baik.
               </p>

               <div className="space-y-6 md:space-y-8">
                  <div className="flex gap-4">
                     <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><Phone /></div>
                     <div>
                        <p className="font-bold text-slate-800">Telepon & WhatsApp</p>
                        <p className="text-slate-500">085749555505</p>
                        <p className="text-xs text-blue-600 mt-1">Hanya pada jam kerja (07:00 - 17:00)</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><Mail /></div>
                     <div>
                        <p className="font-bold text-slate-800">Email Resmi</p>
                        <p className="text-slate-500">lpialhidayahkauman@gmail.com</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><MapPin /></div>
                     <div>
                        <p className="font-bold text-slate-800">Alamat Sekolah</p>
                        <p className="text-slate-500 leading-relaxed">Jl. KH Hasyim Asyari No.27, Kauman, Kec. Kauman, Kabupaten Tulungagung, Jawa Timur 66261</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Form Side */}
            <div className="lg:w-2/3">
               <div className="bg-white p-6 md:p-12 rounded-[2.5rem] md:rounded-[3rem] shadow-xl border border-slate-50">
                  <div className="flex gap-4 mb-10">
                     <button
                        onClick={() => { setFormType('contact'); setStatus(null); }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${formType === 'contact' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                           }`}
                     >
                        <MessageSquare className="w-4 h-4" /> Hubungi Kami
                     </button>
                     <button
                        onClick={() => { setFormType('complaint'); setStatus(null); }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${formType === 'complaint' ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                           }`}
                     >
                        <AlertCircle className="w-4 h-4" /> Form Pengaduan
                     </button>
                  </div>

                  {status && (
                     <div className={`mb-6 p-4 rounded-xl ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {status.message}
                     </div>
                  )}

                  <form className="space-y-6" onSubmit={handleSubmit}>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap</label>
                           <input
                              required
                              type="text"
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                              placeholder="Masukkan nama Anda"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2">Email / No. HP</label>
                           <input
                              required
                              type="text"
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                              placeholder="Informasi kontak Anda"
                              value={contactInfo}
                              onChange={(e) => setContactInfo(e.target.value)}
                           />
                        </div>
                     </div>

                     {formType === 'complaint' && (
                        <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2">Kategori Pengaduan</label>
                           <select
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none transition-all appearance-none"
                              value={category}
                              onChange={(e) => setCategory(e.target.value)}
                           >
                              <option>Sarana Prasarana</option>
                              <option>Layanan Akademik</option>
                              <option>Keamanan & Ketertiban</option>
                              <option>Lainnya</option>
                           </select>
                        </div>
                     )}

                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Pesan atau Deskripsi</label>
                        <textarea
                           required
                           rows={5}
                           className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                           placeholder="Sampaikan pesan Anda secara rinci..."
                           value={message}
                           onChange={(e) => setMessage(e.target.value)}
                        ></textarea>
                     </div>

                     <button
                        disabled={loading}
                        type="submit"
                        className={`w-full py-5 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${formType === 'contact' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 shadow-xl' : 'bg-red-600 hover:bg-red-700 shadow-red-200 shadow-xl'
                           }`}>
                        {loading ? <Loader2 className="animate-spin" /> : <>Kirim Sekarang <Send className="w-5 h-5" /></>}
                     </button>
                  </form>
               </div>
            </div>
         </div>
      </div>
   );
};

export default Contact;
