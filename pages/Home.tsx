import React, { useContext, useEffect, useState } from 'react';
import Carousel from '../components/Carousel';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination as SwiperPagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

import { ArrowRight, BookOpen, Newspaper, Lightbulb, Star, Users, GraduationCap, Building, CheckCircle2, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LevelContext } from '../App';
import { Slide, Stat, NewsItem, JournalItem, InstitutionProfile, ProjectItem, Testimonial } from '../types';
import SkeletonHomeNewsCard from '../components/SkeletonHomeNewsCard';
import SkeletonBestJournal from '../components/SkeletonBestJournal';
import SkeletonProjectCard from '../components/SkeletonProjectCard';
import { fetchLatestNews, fetchJournals, fetchBestJournals, fetchNewsWithLimitAndLevel, fetchProjectsWithLimit } from '../services/api';
import { useLevelConfig } from '../hooks/useLevelConfig';
import { useCache } from '../context/CacheContext';

const Home: React.FC = () => {
  const { activeLevel } = useContext(LevelContext);
  const LEVEL_CONFIG = useLevelConfig();
  const theme = LEVEL_CONFIG[activeLevel];
  // Use Cache
  const { homeCache, setHomeCache } = useCache();

  // State initialization from cache if available, otherwise defaults
  const [allStats, setAllStats] = useState<Record<string, Stat[]>>(homeCache.stats || {});
  const [slides, setSlides] = useState<Slide[]>(homeCache.slides || []);
  const [profile, setProfile] = useState<InstitutionProfile | null>(homeCache.profile || null);
  const [news, setNews] = useState<NewsItem[]>(homeCache.news || []);
  const [projects, setProjects] = useState<ProjectItem[]>(homeCache.projects || []);
  const [journals, setJournals] = useState<JournalItem[]>(homeCache.journals || []);
  const [bestJournals, setBestJournals] = useState<JournalItem[]>(homeCache.bestJournals || []);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(homeCache.testimonials || []);
  const [loading, setLoading] = useState(!homeCache.isLoaded);
  const [loadingNews, setLoadingNews] = useState(!homeCache.isLoaded);

  useEffect(() => {
    // If cache is loaded, we don't need to refetch global data
    if (homeCache.isLoaded) {
      setLoading(false);
      setLoadingNews(false);
      return;
    }

    const loadGlobalData = async () => {
      try {
        const [journalsData, bestJournalsData, projectsData] = await Promise.all([
          fetchJournals(),
          fetchBestJournals(),
          fetchProjectsWithLimit(2)
        ]);

        // Load Testimonials from ENV locally
        let loadedTestimonials: Testimonial[] = [];
        const envTestimonials = import.meta.env.VITE_HOME_TESTIMONIALS;
        if (envTestimonials) {
          try {
            const parsed = JSON.parse(envTestimonials);
            if (Array.isArray(parsed)) loadedTestimonials = parsed;
          } catch (e) {
            console.error("Invalid VITE_HOME_TESTIMONIALS", e);
          }
        }

        // Load Slides from ENV locally
        let loadedSlides: Slide[] = [];
        const envSlides = import.meta.env.VITE_HOME_SLIDES;
        if (envSlides) {
          try {
            const parsed = JSON.parse(envSlides);
            if (Array.isArray(parsed)) loadedSlides = parsed;
          } catch (e) {
            console.error("Invalid VITE_HOME_SLIDES", e);
          }
        }

        // Load Profile from ENV locally
        let loadedProfile: InstitutionProfile | null = null;
        const envProfile: InstitutionProfile = {
          title: import.meta.env.VITE_PROFILE_TITLE || '',
          description: import.meta.env.VITE_PROFILE_DESC || '',
          imageUrl: import.meta.env.VITE_PROFILE_IMAGE || ''
        };
        if (envProfile.title || envProfile.description) {
          loadedProfile = envProfile;
        }

        // Load Stats from ENV locally
        let loadedStats: Record<string, Stat[]> = {};
        const envStats = import.meta.env.VITE_HOME_STATS;
        if (envStats) {
          try {
            const parsedStats = JSON.parse(envStats);
            if (Array.isArray(parsedStats)) {
              loadedStats = { 'UMUM': parsedStats, 'MA': parsedStats, 'SMA': parsedStats, 'SMP': parsedStats, 'SD': parsedStats, 'TK': parsedStats, 'KAMPUS': parsedStats, 'STAI': parsedStats };
            }
          } catch (e) {
            console.error("Invalid VITE_HOME_STATS", e);
          }
        }

        // Update Local State
        setJournals(journalsData);
        setBestJournals(bestJournalsData);
        setProjects(projectsData);
        setSlides(loadedSlides);
        if (loadedProfile) setProfile(loadedProfile);
        setAllStats(loadedStats);
        setTestimonials(loadedTestimonials);

        // Update Cache
        setHomeCache({
          journals: journalsData,
          bestJournals: bestJournalsData,
          projects: projectsData,
          slides: loadedSlides,
          profile: loadedProfile,
          stats: loadedStats,
          testimonials: loadedTestimonials,
          // We mark as loaded but news is fetched separately per level usually, 
          // but here we can just say global data is loaded.
          isLoaded: true
        });

      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadGlobalData();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadNewsData = async () => {
      setLoadingNews(true);
      try {
        let newsData: NewsItem[];
        if (activeLevel === 'UMUM') {
          newsData = await fetchLatestNews();
        } else {
          newsData = await fetchNewsWithLimitAndLevel(3, activeLevel);
        }
        if (isMounted) {
          setNews(newsData);
        }
      } catch (error) {
        console.error('Error loading news data:', error);
      } finally {
        if (isMounted) setLoadingNews(false);
      }
    };
    loadNewsData();

    return () => {
      isMounted = false;
    };
  }, [activeLevel]);

  // Filtering data berdasarkan level
  // News fetching is now handled per level, so we rely on API response directly.
  const newsList = news;

  // Filter projects by activeLevel if needed, though we fetched global 2 limit.
  // The user requested "2 projek terakhir di bagian home". Usually this means global latest, 
  // but let's filter if not UMUM to be safe, or just show top 2 regardless if it's "Showcase".
  // If we filter client side from a fetch(2), we might get 0. 
  // Ideally we should have fetchProjectsWithLimitAndLevel, but api.ts only has fetchProjectsWithLimit.
  // For now, let's assume specific level filtering isn't strictly enforced for the "Latest" showcase unless requested.
  // However, consistent with other sections, let's try to filter if we had more data.
  // Since we only fetched 2, let's just show them. 
  // NOTE: If strictly per level, we should update the API call in future. For now, matching general request.
  const projectList = projects;

  const journalList = activeLevel === 'UMUM' ? journals : journals.filter(j => j.jenjang === activeLevel);

  // Logic untuk memilih stats berdasarkan activeLevel
  const currentStats = React.useMemo(() => {
    // Mapping level aplikasi ke key API stats
    let key = activeLevel as string;
    if (activeLevel === 'SMA') key = 'MA';

    return allStats[key] || [];
  }, [allStats, activeLevel]);

  // Use best journals from API if available and match level
  const filteredBestJournals = activeLevel === 'UMUM' ? bestJournals : bestJournals.filter(j => j.jenjang.toLowerCase() === activeLevel.toLowerCase());
  const topJournal = filteredBestJournals.length > 0 ? filteredBestJournals[0] : (journalList.find(j => j.is_best || j.isBest) || journalList[0]);

  const getStatIcon = (label: string) => {
    if (label.includes('Murid')) return <Users className={`w-6 h-6 ${theme.text}`} />;
    if (label.includes('Guru')) return <GraduationCap className={`w-6 h-6 ${theme.text}`} />;
    if (label.includes('Kelas') || label.includes('Gedung')) return <Building className={`w-6 h-6 ${theme.text}`} />;
    return <CheckCircle2 className={`w-6 h-6 ${theme.text}`} />;
  };

  return (
    <div className="space-y-20 pb-20">
      <Carousel slides={slides} />

      {/* Islamic Welcome & Statistics */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-6 md:p-10 border border-slate-50">
          <div className="text-center mb-8 md:mb-12">
            <p className={`arabic-text text-2xl md:text-3xl ${theme.text} mb-2`}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Ahlan wa Sahlan di {theme.name}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {loading ? (
              <div className="col-span-4 text-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
              </div>
            ) : (
              currentStats.map((stat, idx) => (
                <div key={idx} className="flex flex-col items-center text-center group">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                    {getStatIcon(stat.label)}
                  </div>
                  <p className={`text-2xl md:text-3xl font-black ${theme.text} mb-1`}>{stat.value}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Profile Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="md:w-1/2">
            <div className={`inline-flex items-center gap-2 bg-slate-50 ${theme.text} px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider mb-6`}>
              <Star className={`w-4 h-4 fill-current`} /> {profile?.subtitle || 'Profil Institusi'}
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 md:mb-8 leading-[1.1]">
              {profile ? profile.title : (
                <>Membangun Peradaban dari <span className={theme.text}>Pendidikan Qurani</span>.</>
              )}
            </h2>
            <p className="text-slate-600 leading-relaxed text-base md:text-lg mb-8 md:mb-10">
              {profile ? profile.description : 'Integrasi kurikulum modern dengan nilai-nilai luhur keislaman untuk mencetak generasi yang cerdas akal dan mulia akhlak.'}
            </p>

            <Link to="/tentang/profil" className={`inline-flex items-center gap-3 ${theme.bg} text-white px-6 py-3 md:px-8 md:py-4 rounded-2xl font-bold hover:brightness-110 transition-all shadow-xl group`}>
              Detail Profil <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="md:w-1/2 relative w-full">
            <div className="relative z-10 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl border-4 md:border-8 border-white aspect-[4/3] md:aspect-auto md:h-[500px]">
              <img
                src={profile ? profile.imageUrl : "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9"}
                alt="Pendidikan"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className={`${theme.bg} py-16 md:py-24 relative overflow-hidden transition-colors duration-700`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 md:mb-16 gap-6">
            <div>
              <h3 className="text-white/60 font-black uppercase tracking-[0.3em] text-xs mb-4">Warta Terkini</h3>
              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">Berita & Agenda {activeLevel}</h2>
            </div>
            <Link to="/berita" className="bg-white/10 text-white px-6 py-3 md:px-8 md:py-3 rounded-full font-bold hover:bg-white/20 transition-all border border-white/20 flex items-center gap-2 text-sm md:text-base">
              Buka Semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {loadingNews ? (
              Array(3).fill(0).map((_, i) => <SkeletonHomeNewsCard key={i} />)
            ) : newsList.length > 0 ? (
              newsList.slice(0, 3).map(news => (
                <Link to={`/berita/${news.id}`} key={news.id} className="bg-white rounded-[2rem] md:rounded-[2.5rem] overflow-hidden hover:-translate-y-3 transition-all duration-500 group border border-white/5">
                  <div className="relative h-56 md:h-64 overflow-hidden">
                    <img src={news.main_image} alt={news.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className={`absolute top-4 left-4 md:top-6 md:left-6 ${theme.bg} text-white px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-lg`}>
                      {news.jenjang}
                    </div>
                  </div>
                  <div className="p-6 md:p-8">
                    <h4 className="text-lg md:text-xl font-black text-slate-900 mb-4 line-clamp-2 hover:text-islamic-gold-500 transition-colors">
                      {news.title}
                    </h4>
                    <p className="text-slate-500 text-sm mb-6 md:mb-8 line-clamp-2 leading-relaxed">
                      {news.excerpt}
                    </p>
                    <span className={`${theme.text} font-bold text-sm flex items-center gap-2`}>
                      Selengkapnya <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center py-20 bg-white/5 rounded-[2.5rem] border border-white/10">
                <Newspaper className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/40 font-bold">Belum ada berita terkini.</p>
              </div>
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/islamic-art.png')]"></div>
      </section>

      {/* Best Journal Section */}
      {loading ? (
        <SkeletonBestJournal />
      ) : topJournal && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 mt-16 md:mt-20">
          <div className="bg-slate-50 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-16 border border-slate-100 flex flex-col lg:flex-row gap-10 md:gap-16 items-center">
            <div className="lg:w-1/2">
              <div className="bg-islamic-gold-500 text-white px-4 py-1.5 md:px-5 rounded-full text-[9px] md:text-[10px] font-black uppercase mb-6 md:mb-8 w-fit shadow-xl shadow-islamic-gold-100">Jurnal Akademik Terbaik ({topJournal.jenjang})</div>
              <h2 className="text-2xl md:text-5xl font-black text-slate-900 mb-6 md:mb-8 leading-tight">{topJournal.title}</h2>
              <p className="text-slate-500 italic text-lg md:text-xl mb-8 md:mb-10">"{topJournal.abstract}"</p>
              <Link to={`/jurnal/${topJournal.id}`} className={`${theme.bg} text-white px-8 py-4 md:px-10 md:py-5 rounded-2xl font-black shadow-2xl shadow-black/10 inline-block text-sm md:text-base`}>Baca Hasil Riset</Link>
            </div>
            <div className="lg:w-1/2 w-full">
              <div className="aspect-video bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl p-6 md:p-10 border border-slate-50 flex flex-col justify-center">
                <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8">
                  <div className={`w-12 h-12 md:w-16 md:h-16 ${theme.bg} rounded-2xl md:rounded-3xl flex items-center justify-center text-white text-xl md:text-2xl font-black shadow-xl shadow-black/10`}>{topJournal.score}</div>
                  <div>
                    <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Skor Penilaian</p>
                    <p className="text-lg md:text-xl font-black text-slate-800">Excellent Research</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-4 border-b border-slate-50">
                    <span className="text-xs md:text-sm font-bold text-slate-400">Penulis Utama</span>
                    <span className="text-xs md:text-sm font-black text-slate-800 text-right">{topJournal.author}</span>
                  </div>
                  <div className="flex justify-between items-center py-4">
                    <span className="text-xs md:text-sm font-bold text-slate-400">Dosen/Guru Pembimbing</span>
                    <span className="text-xs md:text-sm font-black text-slate-800 text-right">{topJournal.mentor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials / Kata Mutiara Section */}
      {testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 mt-16 md:mt-24 mb-10 md:mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-islamic-green-50/50 via-white to-islamic-gold-50/50 rounded-full blur-3xl -z-10 opacity-60"></div>

          <div className="text-center mb-10 md:mb-16 relative z-10">
            <span className={`text-xs font-black uppercase tracking-[0.3em] ${theme.text} mb-3 block`}>Inspirasi Harian</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">Kata Mutiara</h2>
          </div>

          <Swiper
            modules={[Autoplay, SwiperPagination]}
            spaceBetween={40}
            slidesPerView={1}
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            pagination={{ clickable: true, dynamicBullets: true }}
            className="pb-16"
          >
            {testimonials.map((item, idx) => (
              <SwiperSlide key={idx} className="px-2 md:px-4">
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-14 border border-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] relative max-w-4xl mx-auto text-center overflow-hidden group hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] transition-all duration-500">
                  {/* Decorative Elements */}
                  <div className={`absolute top-0 left-0 w-full h-2 ${theme.bg}`}></div>
                  <Quote className="absolute top-10 left-10 w-16 h-16 md:w-24 md:h-24 text-slate-100 -z-10 rotate-12 group-hover:rotate-0 transition-all duration-700" />
                  <Quote className="absolute bottom-10 right-10 w-16 h-16 md:w-24 md:h-24 text-slate-100 -z-10 rotate-180 group-hover:rotate-12 transition-all duration-700 delay-100" />

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full p-1.5 bg-gradient-to-br from-islamic-gold-300 to-islamic-green-300 shadow-xl mb-6 md:mb-8 group-hover:scale-110 transition-transform duration-500">
                      <div className="w-full h-full rounded-full overflow-hidden border-4 border-white">
                        <img src={item.image} alt={item.author} className="w-full h-full object-cover" />
                      </div>
                    </div>

                    <p className="text-lg md:text-3xl font-bold text-slate-800 leading-relaxed mb-8 md:mb-10 max-w-2xl font-serif italic">
                      "{item.text}"
                    </p>

                    <div className="flex flex-col items-center">
                      <h4 className={`text-lg md:text-xl font-black ${theme.text} mb-1`}>{item.author}</h4>
                      <div className="h-1 w-12 bg-slate-200 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )}

      {/* Latest Projects Section */}
      <section className="bg-slate-900 py-16 md:py-24 relative overflow-hidden my-16 md:my-20 rounded-[3rem] md:rounded-[4rem] mx-4 md:mx-8">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 md:mb-20 gap-6">
            <div>
              <h3 className="text-islamic-gold-500 font-black uppercase tracking-[0.3em] text-xs mb-4">Inovasi Santri</h3>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">Karya & Projek Terbaru</h2>
            </div>
            <Link to="/projek" className="bg-white/10 backdrop-blur-md text-white px-6 py-3 md:px-8 md:py-3 rounded-full font-bold hover:bg-white/20 transition-all border border-white/10 flex items-center gap-2 shadow-2xl text-sm md:text-base">
              Lihat Galeri <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            {loading ? (
              Array(2).fill(0).map((_, i) => <SkeletonProjectCard key={i} />)
            ) : projectList.length > 0 ? (
              projectList.map(project => (
                <Link to={`/projek/${project.id}`} key={project.id} className="bg-white rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border border-slate-100 shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 group flex flex-col h-full relative">
                  <div className="relative h-60 md:h-72 overflow-hidden">
                    <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                    <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-white/95 backdrop-blur-md text-slate-900 px-4 py-1.5 md:px-5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl">
                      {project.category}
                    </div>
                  </div>
                  <div className="p-8 md:p-10 flex flex-col flex-1 relative bg-white">
                    <div className="-mt-14 md:-mt-16 mb-4 md:mb-6 relative z-10 flex justify-between items-end">
                      <span className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl ${LEVEL_CONFIG[project.jenjang]?.bg || 'bg-slate-800'} text-white text-[9px] md:text-[10px] font-black shadow-lg uppercase tracking-widest`}>{project.jenjang}</span>
                      <div className="bg-white p-2.5 md:p-3 rounded-2xl text-slate-900 shadow-xl group-hover:bg-islamic-gold-500 group-hover:text-white transition-colors duration-500">
                        <Lightbulb className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 md:mb-6 leading-tight group-hover:text-islamic-gold-600 transition-colors">{project.title}</h3>
                    <p className="text-slate-500 leading-relaxed mb-8 md:mb-10 line-clamp-2 text-base md:text-lg">{project.description}</p>

                    <div className="mt-auto pt-6 md:pt-8 border-t border-slate-100 flex items-center gap-4">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl ${LEVEL_CONFIG[project.jenjang]?.bg || 'bg-slate-200'} flex items-center justify-center text-white font-black text-base md:text-lg shadow-lg`}>
                        {project.author.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1">{project.author}</p>
                        <p className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md inline-block">{project.date}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-2 text-center py-32 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                <Lightbulb className="w-16 h-16 text-white/20 mx-auto mb-6" />
                <p className="text-white/40 font-bold">Belum ada projek terbaru.</p>
              </div>
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/islamic-art.png')]"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-islamic-gold-500 rounded-full blur-[128px] opacity-20 pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-islamic-green-500 rounded-full blur-[128px] opacity-20 pointer-events-none"></div>
      </section>
    </div>
  );
};

export default Home;
