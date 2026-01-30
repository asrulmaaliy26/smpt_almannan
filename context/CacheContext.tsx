
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { NewsItem, ProjectItem, JournalItem, Slide, Stat, InstitutionProfile, Facility, Testimonial } from '../types';

interface HomeCache {
    news: NewsItem[];
    projects: ProjectItem[];
    journals: JournalItem[];
    bestJournals: JournalItem[];
    slides: Slide[];
    profile: InstitutionProfile | null;
    stats: Record<string, Stat[]>;
    testimonials: Testimonial[];
    isLoaded: boolean;

    // News Page Cache
    allNews: NewsItem[];
    newsCategories: string[];
    isNewsLoaded: boolean;

    // Projects Page Cache
    allProjects: ProjectItem[];
    projectCategories: string[];
    isProjectsLoaded: boolean;

    // Journals Page Cache
    allJournals: JournalItem[];
    journalCategories: string[];
    isJournalsLoaded: boolean;

    // Facilities Page Cache
    allFacilities: Facility[];
    isFacilitiesLoaded: boolean;
}

interface CacheContextType {
    homeCache: HomeCache;
    setHomeCache: (cache: Partial<HomeCache>) => void;
}

const defaultCache: HomeCache = {
    news: [],
    projects: [],
    journals: [],
    bestJournals: [],
    slides: [],
    profile: null,
    stats: {},
    testimonials: [],
    isLoaded: false,

    allNews: [],
    newsCategories: [],
    isNewsLoaded: false,

    allProjects: [],
    projectCategories: [],
    isProjectsLoaded: false,

    allJournals: [],
    journalCategories: [],
    isJournalsLoaded: false,

    allFacilities: [],
    isFacilitiesLoaded: false,
};

const CacheContext = createContext<CacheContextType>({
    homeCache: defaultCache,
    setHomeCache: () => { },
});

export const CacheProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [homeCache, setHomeCacheState] = useState<HomeCache>(defaultCache);

    const setHomeCache = (cache: Partial<HomeCache>) => {
        setHomeCacheState(prev => ({ ...prev, ...cache }));
    };

    return (
        <CacheContext.Provider value={{ homeCache, setHomeCache }}>
            {children}
        </CacheContext.Provider>
    );
};

export const useCache = () => useContext(CacheContext);
