import React, { useState, useContext, useEffect, useMemo } from 'react';
import { SCHOOL_NAME } from '../constants'; // Fallback
import { fetchProjectCategories, fetchProjectsWithLimit } from '../services/api';
import { Layers, Tag, LayoutGrid, ChevronRight, Loader2 } from 'lucide-react';
import { LevelContext } from '../App';
import { EducationLevel, ProjectItem } from '../types';
import { Link } from 'react-router-dom';
import { useLevelConfig } from '../hooks/useLevelConfig';
import ProjectCard from '../components/ProjectCard';
import SkeletonProjectCard from '../components/SkeletonProjectCard';
import { useCache } from '../context/CacheContext';

const Projects: React.FC = () => {
  const { homeCache, setHomeCache } = useCache();
  const { activeLevel } = useContext(LevelContext);
  const LEVEL_CONFIG = useLevelConfig();
  const [subFilter, setSubFilter] = useState<EducationLevel | 'SEMUA'>('SEMUA');
  const [activeCategory, setActiveCategory] = useState<string>('Semua');

  const [categories, setCategories] = useState<string[]>(homeCache.projectCategories && homeCache.projectCategories.length > 0 ? homeCache.projectCategories : ['Semua']);
  const [projects, setProjects] = useState<ProjectItem[]>(homeCache.allProjects || []);

  const [catLoading, setCatLoading] = useState(homeCache.projectCategories && homeCache.projectCategories.length > 0 ? false : true);
  const [projLoading, setProjLoading] = useState(!homeCache.isProjectsLoaded);

  const [limit, setLimit] = useState(homeCache.allProjects?.length || 6);
  const [hasMore, setHasMore] = useState(true);
  const theme = LEVEL_CONFIG[activeLevel];

  useEffect(() => {
    if (homeCache.projectCategories && homeCache.projectCategories.length > 0) return;

    const loadCategories = async () => {
      try {
        const catsData = await fetchProjectCategories();
        setCategories(catsData);
        setHomeCache({ projectCategories: catsData });
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setCatLoading(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (homeCache.isProjectsLoaded && projects.length >= limit) {
      setProjLoading(false);
      return;
    }

    const loadProjects = async () => {
      setProjLoading(true);
      try {
        const projectsData = await fetchProjectsWithLimit(limit);
        setProjects(projectsData);
        setHomeCache({ allProjects: projectsData, isProjectsLoaded: true });

        if (projectsData.length < limit) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } catch (error) {
        console.error('Error loading project data:', error);
      } finally {
        setProjLoading(false);
      }
    };
    loadProjects();
  }, [limit]);

  const effectiveLevelFilter = activeLevel !== 'UMUM' ? activeLevel : subFilter;

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesLevel = effectiveLevelFilter === 'SEMUA' || project.jenjang === effectiveLevelFilter;
      const matchesCategory = activeCategory === 'Semua' || project.category === activeCategory;
      return matchesLevel && matchesCategory;
    });
  }, [projects, effectiveLevelFilter, activeCategory]);

  const renderedProjects = useMemo(() => {
    return filteredProjects.map(project => (
      <ProjectCard key={project.id} project={project} levelConfig={LEVEL_CONFIG} />
    ));
  }, [filteredProjects, LEVEL_CONFIG]);

  const loadMore = () => {
    setLimit(prev => prev + 6);
  };

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
          <span className={`text-xs font-black uppercase tracking-[0.3em] ${theme.text}`}>Inovasi & Riset</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4">Galeri Projek</h1>
        <p className="text-slate-500 max-w-2xl leading-relaxed font-medium">
          Kumpulan inovasi kreatif santri {activeLevel === 'UMUM' ? SCHOOL_NAME : theme.name} dalam menjawab tantangan masa depan.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Kategori */}
        <aside className="lg:w-72 flex-shrink-0 space-y-8">
          {/* Level Filter (Hanya di mode UMUM) */}
          {activeLevel === 'UMUM' && (
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Layers className="w-3 h-3" /> Filter Jenjang
              </h3>
              <div className="flex flex-col gap-1">
                {filterOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSubFilter(opt)}
                    className={`text-left px-4 py-3 rounded-xl text-xs font-black transition-all flex justify-between items-center ${subFilter === opt ? 'bg-slate-900 text-white shadow-lg shadow-black/10' : 'text-slate-500 hover:bg-slate-50'
                      }`}
                  >
                    {opt === 'SEMUA' ? 'Semua Jenjang' : LEVEL_CONFIG[opt]?.name || opt}
                    {subFilter === opt && <ChevronRight className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Kategori Sidebar */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 sticky top-28">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Tag className="w-3 h-3" /> Kategori Bidang
            </h3>
            <div className="space-y-2">
              {catLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
                </div>
              ) : (
                categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full text-left px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-between border ${activeCategory === cat
                      ? 'bg-islamic-gold-500 text-white border-transparent shadow-xl shadow-islamic-gold-100'
                      : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-50 hover:border-slate-100'
                      }`}
                  >
                    {cat}
                    {activeCategory === cat && <LayoutGrid className="w-4 h-4" />}
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Grid Konten */}
        <div className="flex-1">
          {projLoading && limit === 6 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Array(4).fill(0).map((_, i) => <SkeletonProjectCard key={i} />)}
            </div>
          ) : filteredProjects.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {renderedProjects}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center pt-8">
                  <button
                    onClick={loadMore}
                    disabled={projLoading}
                    className={`px-8 py-3 rounded-full font-bold text-white transition-all shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 ${theme.bg}`}
                  >
                    {projLoading ? (
                      <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Memuat...</span>
                    ) : (
                      "Muat Lebih Banyak"
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-40 bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
              <LayoutGrid className="w-16 h-16 text-slate-200 mx-auto mb-6" />
              <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Belum ada projek ditemukan</p>
              <button onClick={() => { setActiveCategory('Semua'); setSubFilter('SEMUA'); }} className="mt-8 text-islamic-gold-500 font-black text-xs uppercase tracking-widest hover:underline">Reset Semua Filter</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;
