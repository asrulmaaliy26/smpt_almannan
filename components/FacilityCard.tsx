import React, { memo } from 'react';
import { MapPin } from 'lucide-react';
import { Facility, LevelConfigData } from '../types';

interface FacilityCardProps {
    facility: Facility;
    levelConfig: LevelConfigData;
    onClick: (facility: Facility) => void;
}

const FacilityCard: React.FC<FacilityCardProps> = memo(({ facility, levelConfig, onClick }) => {
    const facilityTheme = levelConfig[facility.jenjang];

    return (
        <div
            onClick={() => onClick(facility)}
            className="group relative rounded-[3.5rem] overflow-hidden bg-white shadow-sm border border-slate-100 h-[500px] cursor-pointer"
        >
            <img
                src={facility.imageUrl}
                alt={facility.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent p-12 flex flex-col justify-end opacity-95 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-3 mb-6">
                    <div className={`${facilityTheme.bg} text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg`}>
                        {facility.jenjang}
                    </div>
                    <div className="bg-white/10 backdrop-blur-md text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                        {facility.type}
                    </div>
                </div>
                <h3 className="text-3xl font-black text-white mb-4 leading-tight">{facility.name}</h3>
                <p className="text-slate-200 font-medium max-w-md text-sm leading-relaxed mb-8 line-clamp-3">
                    {facility.description}
                </p>
                <div className="flex items-center gap-2 text-islamic-gold-500 font-black text-[10px] uppercase tracking-[0.3em]">
                    <MapPin className="w-4 h-4" /> Area Kampus Terintegrasi
                </div>
            </div>
        </div>
    );
});

export default FacilityCard;
