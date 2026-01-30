

import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Journals from './pages/Journals';
import JournalDetail from './pages/JournalDetail';
import Facilities from './pages/Facilities';
import Contact from './pages/Contact';
import AdminDashboard from './pages/Admin/Dashboard';
import ManageNews from './pages/Admin/ManageNews';
import CreateNews from './pages/Admin/CreateNews';
import EditNews from './pages/Admin/EditNews';
import ManageProjects from './pages/Admin/ManageProjects';
import CreateProject from './pages/Admin/CreateProject';
import EditProject from './pages/Admin/EditProject';
import ManageJournals from './pages/Admin/ManageJournals';
import CreateJournal from './pages/Admin/CreateJournal';
import EditJournal from './pages/Admin/EditJournal';
import AdminLogin from './pages/Admin/Login';
import AdminLayout from './components/AdminLayout';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { getSchoolAssistantResponse } from './services/gemini';
import { EducationLevel, LevelConfigData } from './types';
import { fetchLevelConfig, getDefaultLevel } from './services/api';

import { CacheProvider } from './context/CacheContext';

// Context untuk Level Pendidikan
export const LevelContext = createContext<{
  activeLevel: EducationLevel;
  setActiveLevel: (level: EducationLevel) => void;
}>({ activeLevel: 'UMUM', setActiveLevel: () => { } });

// Context untuk Level Config
export const LevelConfigContext = createContext<LevelConfigData | null>(null);

const App: React.FC = () => {
  const location = useLocation();
  const [activeLevel, setActiveLevel] = useState<EducationLevel>(getDefaultLevel() as EducationLevel);
  const [levelConfig, setLevelConfig] = useState<LevelConfigData | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const isAdminPath = location.pathname.startsWith('/admin');

  // Load level config on mount
  useEffect(() => {
    const loadLevelConfig = async () => {
      try {
        const config = await fetchLevelConfig();
        setLevelConfig(config);
      } catch (error) {
        console.error('Error loading level config:', error);
      }
    };
    loadLevelConfig();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const handleSendChat = async () => {
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatMessage('');
    setIsTyping(true);
    try {
      const botResponse = await getSchoolAssistantResponse(userMsg);
      setChatHistory(prev => [...prev, { role: 'bot', text: botResponse }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'bot', text: 'Maaf, sedang ada kendala teknis.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!levelConfig) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-islamic-green-600 mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold">Memuat Konfigurasi Sekolah...</p>
        </div>
      </div>
    );
  }

  return (
    <CacheProvider>
      <LevelContext.Provider value={{ activeLevel, setActiveLevel }}>
        <LevelConfigContext.Provider value={levelConfig}>
          <div className="flex flex-col min-h-screen">
            {!isAdminPath && <Navbar />}
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/tentang/:section" element={<About />} />
                <Route path="/berita" element={<News />} />
                <Route path="/berita/:id" element={<NewsDetail />} />
                <Route path="/projek" element={<Projects />} />
                <Route path="/projek/:id" element={<ProjectDetail />} />
                <Route path="/jurnal" element={<Journals />} />
                <Route path="/jurnal/:id" element={<JournalDetail />} />
                <Route path="/fasilitas" element={<Facilities />} />
                <Route path="/contact" element={<Contact />} />

                {/* Admin Routes with persistent Sidebar */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="news" element={<ManageNews />} />
                  <Route path="news/create" element={<CreateNews />} />
                  <Route path="news/edit/:id" element={<EditNews />} />
                  <Route path="projects" element={<ManageProjects />} />
                  <Route path="projects/create" element={<CreateProject />} />
                  <Route path="projects/edit/:id" element={<EditProject />} />
                  <Route path="journals" element={<ManageJournals />} />
                  <Route path="journals/create" element={<CreateJournal />} />
                  <Route path="journals/edit/:id" element={<EditJournal />} />
                </Route>
              </Routes>
            </main>
            {!isAdminPath && <Footer />}

            {!isAdminPath && (
              <div className="fixed bottom-6 right-6 z-[60]">
                {!isChatOpen ? (
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="bg-islamic-green-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center gap-2 group"
                  >
                    <Sparkles className="w-6 h-6 animate-pulse" />
                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-bold whitespace-nowrap px-0 group-hover:px-2">Asisten AI</span>
                  </button>
                ) : (
                  <div className="bg-white w-80 md:w-96 rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col h-[500px] animate-slideInUp">
                    <div className="bg-islamic-green-600 p-6 flex justify-between items-center text-white">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5" />
                        <p className="font-bold text-sm">Asisten Virtual</p>
                      </div>
                      <button onClick={() => setIsChatOpen(false)} className="hover:rotate-90 transition-transform">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50 hide-scrollbar">
                      {chatHistory.length === 0 && (
                        <div className="text-center py-10 px-4">
                          <div className="bg-islamic-green-100 p-4 rounded-full w-fit mx-auto mb-4">
                            <MessageCircle className="text-islamic-green-600 w-8 h-8" />
                          </div>
                          <p className="text-slate-800 font-bold mb-1">Assalamu'alaikum!</p>
                          <p className="text-slate-400 text-xs">Ada yang bisa saya bantu terkait Unggul Bangsa?</p>
                        </div>
                      )}
                      {chatHistory.map((chat, idx) => (
                        <div key={idx} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${chat.role === 'user' ? 'bg-islamic-green-600 text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none shadow-sm'
                            }`}>
                            {chat.text}
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-white border border-slate-100 p-3 rounded-2xl flex gap-1 items-center">
                            <div className="w-1.5 h-1.5 bg-islamic-green-300 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-islamic-green-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                            <div className="w-1.5 h-1.5 bg-islamic-green-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4 border-t border-slate-100 flex gap-2">
                      <input
                        type="text"
                        className="flex-grow bg-slate-100 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-islamic-green-500"
                        placeholder="Tanya asisten AI..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                      />
                      <button
                        onClick={handleSendChat}
                        className="bg-islamic-green-600 text-white p-3 rounded-xl hover:bg-islamic-green-700 transition-colors"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </LevelConfigContext.Provider>
      </LevelContext.Provider>
    </CacheProvider>
  );
};

export default App;
