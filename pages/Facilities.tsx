
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { SCHOOL_NAME } from '../constants'; // Fallback
import { fetchFacilities } from '../services/api';
import { Layout, Zap, Layers, MapPin, ChevronRight, Search } from 'lucide-react';
import { LevelContext } from '../App';
import { EducationLevel, Facility } from '../types';
import { useLevelConfig } from '../hooks/useLevelConfig';
import Pagination from '../components/Pagination';
import FacilityCard from '../components/FacilityCard';
import SkeletonFacilityCard from '../components/SkeletonFacilityCard';
import FacilityModal from '../components/FacilityModal';

import { getDefaultLevel } from '../services/api';
import { useCache } from '../context/CacheContext';

// ... (imports remain)

const Facilities: React.FC = () => {
  const { homeCache, setHomeCache } = useCache();
  const { activeLevel } = useContext(LevelContext);
  const LEVEL_CONFIG = useLevelConfig();

  // Initialize filter based on ENV default, respecting the "default saja dari env itu sendiri" rule.
  // We ignore activeLevel changes (navigation) for the default state of this page.
  const [subFilter, setSubFilter] = useState<EducationLevel | 'SEMUA'>(() => {
    const def = getDefaultLevel();
    return def === 'UMUM' ? 'SEMUA' : (def as EducationLevel);
  });

  const [typeFilter, setTypeFilter] = useState<'ALL' | 'fasilitas' | 'ekstra'>('ALL');

  const [facilities, setFacilities] = useState<Facility[]>(homeCache.allFacilities || []);
  const [loading, setLoading] = useState(!homeCache.isFacilitiesLoaded);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = React.useCallback((facility: Facility) => {
    setSelectedFacility(facility);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = React.useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const theme = LEVEL_CONFIG[activeLevel];

  useEffect(() => {
    if (homeCache.isFacilitiesLoaded && facilities.length > 0) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const data = await fetchFacilities();
        setFacilities(data);
        setHomeCache({ allFacilities: data, isFacilitiesLoaded: true });
      } catch (error) {
        console.error('Error loading facilities:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [subFilter, typeFilter]);

  // Purely use the subFilter state, decoupling from activeLevel context enforcement
  const effectiveJenjangFilter = subFilter;

  const filtered = useMemo(() => {
    return facilities.filter(f => {
      const matchesJenjang = effectiveJenjangFilter === 'SEMUA' || f.jenjang === effectiveJenjangFilter;
      const matchesType = typeFilter === 'ALL' || (f.type && f.type.toLowerCase() === typeFilter);
      return matchesJenjang && matchesType;
    });
  }, [facilities, effectiveJenjangFilter, typeFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginatedFacilities = useMemo(() => {
    return filtered.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filtered, currentPage]);

  const renderedFacilities = useMemo(() => {
    return paginatedFacilities.map(facility => (
      <FacilityCard
        key={facility.id}
        facility={facility}
        levelConfig={LEVEL_CONFIG}
        onClick={handleOpenModal}
      />
    ));
  }, [paginatedFacilities, LEVEL_CONFIG, handleOpenModal]);

  // Generate filter options dynamically from API config
  const filterOptions = React.useMemo(() => {
    const levels = Object.keys(LEVEL_CONFIG).filter(key => key !== 'UMUM') as EducationLevel[];
    return ['SEMUA', ...levels] as (EducationLevel | 'SEMUA')[];
  }, [LEVEL_CONFIG]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 md:py-20">
      <header className="mb-10 md:mb-16">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-1 bg-islamic-gold-500 rounded-full`}></div>
          <span className={`text-xs font-black uppercase tracking-[0.3em] ${theme.text}`}>Eksplorasi Kampus</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4">Sarana & Ekstra</h1>
        <p className="text-slate-500 max-w-2xl leading-relaxed font-medium">
          Dukungan fasilitas terbaik untuk menunjang kenyamanan belajar dan pengembangan bakat santri di lingkungan {activeLevel === 'UMUM' ? SCHOOL_NAME : theme.name}.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Kategori */}
        <aside className="lg:w-72 flex-shrink-0 space-y-8">
          {/* Level Filter - Always Visible */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Layers className="w-3 h-3" /> Jenjang Pendidikan
            </h3>
            <div className="space-y-1">
              {filterOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSubFilter(opt)}
                  className={`w-full text-left px-5 py-3 rounded-xl text-xs font-black transition-all flex justify-between items-center ${subFilter === opt ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                >
                  {opt === 'SEMUA' ? 'Semua Jenjang' : LEVEL_CONFIG[opt]?.name || opt}
                  {subFilter === opt && <ChevronRight className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Zap className="w-3 h-3" /> Jenis Fasilitas
            </h3>
            <div className="space-y-1">
              {[
                { id: 'ALL', label: 'Semua Jenis' },
                { id: 'fasilitas', label: 'Fasilitas Umum' },
                { id: 'ekstra', label: 'Ekstrakurikuler' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setTypeFilter(opt.id as any)}
                  className={`w-full text-left px-5 py-3 rounded-xl text-xs font-black transition-all flex justify-between items-center ${typeFilter === opt.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                >
                  {opt.label}
                  {typeFilter === opt.id && <ChevronRight className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Galeri Fasilitas */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Array(4).fill(0).map((_, i) => <SkeletonFacilityCard key={i} />)}
            </div>
          ) : filtered.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {renderedFacilities}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                themeColor={theme.bg}
              />
            </>
          ) : (
            <div className="text-center py-40 bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
              <Layout className="w-16 h-16 text-slate-200 mx-auto mb-6" />
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Belum ada data fasilitas ditemukan</p>
              <button onClick={() => { setSubFilter('SEMUA'); setTypeFilter('ALL'); }} className="mt-8 text-islamic-green-600 font-black text-xs uppercase tracking-widest hover:underline">Reset Semua Filter</button>
            </div>
          )}
        </div>
      </div>
      <FacilityModal
        facility={selectedFacility}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        levelConfig={LEVEL_CONFIG}
      />
    </div>
  );
};

export default Facilities;
