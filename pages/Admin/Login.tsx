
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';

const AdminLogin: React.FC = () => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Get secret from environment variable
        // IMPORTANT: In Vite, env variables must be prefixed with VITE_ to be exposed to the client
        const secretCode = (import.meta as any).env.VITE_ADMIN_SECRET;

        // Fallback for development if not set, or ensuring it's not empty
        // Warning: It's safer to always have it set in .env
        const validSecret = secretCode || 'admin123';

        if (code === validSecret) {
            sessionStorage.setItem('admin_auth_token', 'authenticated');
            navigate('/admin');
        } else {
            setError('Kode akses salah. Silakan coba lagi.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-100">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-islamic-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-islamic-green-200">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Akses Admin</h1>
                    <p className="text-slate-500 text-sm">Masukkan kode rahasia untuk melanjutkan</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full bg-slate-50 px-6 py-4 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-islamic-green-500 transition-all border border-slate-200 placeholder:text-slate-400"
                            placeholder="Kode Rahasia..."
                            autoFocus
                        />
                        {error && (
                            <p className="text-red-500 text-xs font-bold mt-2 ml-2 animate-pulse">{error}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-islamic-green-600 text-white py-4 rounded-xl font-black shadow-xl shadow-islamic-green-200 hover:bg-islamic-green-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                        Masuk Dashboard <ArrowRight className="w-5 h-5" />
                    </button>

                    <div className="text-center pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors"
                        >
                            Kembali ke Beranda
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
