import React, { useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import { Facility, LevelConfigData } from '../types';

interface FacilityModalProps {
    facility: Facility | null;
    isOpen: boolean;
    onClose: () => void;
    levelConfig: LevelConfigData;
}

const FacilityModal: React.FC<FacilityModalProps> = ({ facility, isOpen, onClose, levelConfig }) => {
    // Prevent background scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    if (!isOpen || !facility) return null;

    const facilityTheme = levelConfig[facility.jenjang];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-[2.5rem] overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="relative h-64 md:h-96 shrink-0">
                    <img
                        src={facility.imageUrl}
                        alt={facility.name}
                        className="w-full h-full object-cover"
                    />
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white transition-all transform hover:rotate-90 hover:scale-110 z-10"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="absolute top-6 left-6 flex gap-2">
                        <div className={`${facilityTheme.bg} text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg`}>
                            {facility.jenjang}
                        </div>
                        <div className="bg-black/50 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-white/20">
                            {facility.type}
                        </div>
                    </div>
                </div>

                <div className="p-8 md:p-12 overflow-y-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">{facility.name}</h2>

                    <div className="flex items-center gap-2 text-islamic-gold-500 font-black text-xs uppercase tracking-[0.3em] mb-8">
                        <MapPin className="w-4 h-4" /> Lokasi: Area Kampus {facility.jenjang}
                    </div>

                    <div className="prose prose-slate max-w-none">
                        <p className="text-slate-600 text-lg leading-relaxed">
                            {facility.description}
                        </p>
                        <p className="mt-4 text-slate-500">
                            Fasilitas ini dapat digunakan oleh seluruh civitas akademika {facility.jenjang === 'UMUM' ? 'Yayasan' : `SMA Unggul Bangsa level ${facility.jenjang}`} sesuai dengan jadwal operasional yang berlaku. Didukung dengan peralatan modern dan standar keamanan yang tinggi.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacilityModal;
