import { HomeData, CategoryData, LevelConfigData, NewsItem, ProjectItem, JournalItem, Facility } from '../types';

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/* ================= HELPERS ================= */

/**
 * Generic fetch wrapper with error handling and JSON parsing
 */
const fetchJson = async <T>(url: string, errorMessage: string): Promise<T> => {
    const response = await fetch(url);

    let data: any = null;
    try {
        data = await response.json();
    } catch {
        throw new Error(`${errorMessage}: Response bukan JSON`);
    }

    if (!response.ok) {
        throw new Error(data?.message || `${errorMessage}: (${response.status})`);
    }

    if (!data) {
        throw new Error(`${errorMessage}: Data kosong`);
    }

    return data as T;
};

/**
 * Mendapatkan default jenjang berdasarkan Environment Variable atau Subdomain
 */
export const getDefaultLevel = (): string => {
    // 1. Cek Environment Variable (VITE_DEFAULT_JENJANG)
    const envLevel = import.meta.env.VITE_DEFAULT_JENJANG;
    if (envLevel) {
        return envLevel.toUpperCase();
    }

    // 2. Cek Subdomain
    try {
        const hostname = window.location.hostname;
        const parts = hostname.split('.');

        if (parts.length > 0) {
            const subdomain = parts[0].toUpperCase();

            // Check if subdomain matches valid levels directly
            const validLevels = ['TK', 'MI', 'SMPT', 'MA', 'KAMPUS'];
            if (validLevels.includes(subdomain)) {
                return subdomain;
            }

            // Mapping alternatif
            const altMapping: Record<string, string> = {
                'MA': 'MA',
                'MI': 'MI',
                'SMPT': 'SMPT',
                'KAMPUS': 'KAMPUS',
            };

            if (altMapping[subdomain]) {
                return altMapping[subdomain];
            }
        }
    } catch (e) {
        console.error("Error parsing hostname for level detection", e);
    }

    return 'UMUM';
};

/* ================= GLOBAL & CONFIG ================= */



export const fetchLevelConfig = async (): Promise<LevelConfigData> => {
    const data = await fetchJson<LevelConfigData>(`${API_BASE_URL}/jenjang`, 'Gagal mengambil konfigurasi jenjang');
    if (Object.keys(data).length === 0) throw new Error('Konfigurasi jenjang kosong');
    return data;
};

// --- Categories ---

export const fetchCategories = async (): Promise<CategoryData> => {
    const data = await fetchJson<CategoryData>(`${API_BASE_URL}/categories`, 'Gagal mengambil data kategori');
    if (!data.project_categories || !data.journal_categories || !data.news_categories) {
        throw new Error('Data kategori tidak lengkap');
    }
    return data;
};

export const fetchProjectCategories = async (): Promise<string[]> => {
    const data = await fetchCategories();
    return data.project_categories;
};

export const fetchJournalCategories = async (): Promise<string[]> => {
    const data = await fetchCategories();
    return data.journal_categories;
};

export const fetchNewsCategories = async (): Promise<string[]> => {
    const data = await fetchCategories();
    return data.news_categories;
};

// --- Contact & Complaints ---

export interface ContactUsPayload {
    name: string;
    contact_info: string;
    message: string;
    jenjang: string;
}

export const submitContactUs = async (payload: ContactUsPayload): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/contact-us`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
    });
    return handleSimpleResponse(response, 'Gagal mengirim pesan');
};

export interface ComplaintPayload {
    name: string;
    contact_info: string;
    category: string;
    message: string;
    jenjang: string;
}

export const submitComplaint = async (payload: ComplaintPayload): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
    });
    return handleSimpleResponse(response, 'Gagal mengirim pengaduan');
};

// Helper for simple responses
async function handleSimpleResponse(response: Response, errorPrefix: string) {
    let data: any = null;
    try {
        data = await response.json();
    } catch {
        throw new Error(`${errorPrefix}: Response bukan JSON`);
    }
    if (!response.ok) {
        throw new Error(data?.message || `${errorPrefix}: (${response.status})`);
    }
    return data;
}


/* ================= NEWS ================= */

export const fetchNews = async (): Promise<NewsItem[]> => {
    const json = await fetchJson<{ data: NewsItem[] }>(`${API_BASE_URL}/news`, 'Gagal mengambil data Berita');
    return json.data;
};

export const fetchLatestNews = async (): Promise<NewsItem[]> => {
    return fetchNewsWithLimit(3);
};

export const fetchNewsWithLimit = async (limit: number): Promise<NewsItem[]> => {
    const json = await fetchJson<{ data: NewsItem[] }>(`${API_BASE_URL}/news/limit/${limit}`, `Gagal mengambil ${limit} berita`);
    return json.data;
};

export const fetchNewsWithLimitAndLevel = async (limit: number, level: string): Promise<NewsItem[]> => {
    const json = await fetchJson<{ data: NewsItem[] }>(`${API_BASE_URL}/news/limit/${limit}/${level}`, `Gagal mengambil ${limit} berita untuk jenjang ${level}`);
    return json.data;
};

export const fetchNewsByCategory = async (category: string): Promise<NewsItem[]> => {
    const json = await fetchJson<{ data: NewsItem[] }>(`${API_BASE_URL}/news/category/${category}`, `Gagal mengambil berita kategori ${category}`);
    return json.data;
};

export const fetchNewsDetail = async (id: string): Promise<NewsItem> => {
    const json = await fetchJson<{ data: NewsItem }>(`${API_BASE_URL}/news/${id}`, `Gagal mengambil detail Berita ${id}`);
    return json.data;
};

export interface CreateNewsPayload {
    title: string;
    excerpt: string;
    content: string;
    date: string;
    category: string;
    jenjang: string;
    level?: string;
    main_image?: File;
    gallery?: File[];
}

export interface CreateNewsResponse {
    message: string;
    data: NewsItem;
}

export const createNews = async (payload: CreateNewsPayload): Promise<CreateNewsResponse> => {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('excerpt', payload.excerpt);
    formData.append('content', payload.content);
    formData.append('date', payload.date);
    formData.append('category', payload.category);
    formData.append('jenjang', payload.jenjang);
    if (payload.level) formData.append('level', payload.level);
    if (payload.main_image) formData.append('main_image', payload.main_image);
    if (payload.gallery?.length) {
        payload.gallery.forEach(file => formData.append('gallery[]', file));
    }

    const response = await fetch(`${API_BASE_URL}/api/news`, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
    });

    return handleSimpleResponse(response, 'Gagal membuat berita');
};

export interface UpdateNewsPayload extends CreateNewsPayload {
    id: number;
}

export const updateNews = async (payload: UpdateNewsPayload): Promise<CreateNewsResponse> => {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('excerpt', payload.excerpt);
    formData.append('content', payload.content);
    formData.append('date', payload.date);
    formData.append('category', payload.category);
    formData.append('jenjang', payload.jenjang);
    if (payload.level) formData.append('level', payload.level);
    if (payload.main_image) formData.append('main_image', payload.main_image);
    if (payload.gallery?.length) {
        payload.gallery.forEach(file => formData.append('gallery[]', file));
    }
    formData.append('_method', 'PUT');

    const response = await fetch(`${API_BASE_URL}/api/news/${payload.id}`, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
    });

    return handleSimpleResponse(response, 'Gagal mengupdate berita');
};

export const deleteNews = async (id: string | number): Promise<DeleteResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/news/${id}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
    });
    return handleSimpleResponse(response, 'Gagal menghapus berita');
};

export const deleteNewsGalleryImage = async (newsId: string | number, imageUrl: string): Promise<DeleteResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/news/${newsId}/gallery`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ image_url: imageUrl })
    });
    return handleSimpleResponse(response, 'Gagal menghapus gambar galeri');
};


/* ================= PROJECTS ================= */

export const fetchProjects = async (): Promise<ProjectItem[]> => {
    const json = await fetchJson<{ data: ProjectItem[] }>(`${API_BASE_URL}/projects`, 'Gagal mengambil data Project');
    return json.data;
};

export const fetchProjectsWithLimit = async (limit: number): Promise<ProjectItem[]> => {
    const json = await fetchJson<{ data: ProjectItem[] }>(`${API_BASE_URL}/projects/limit/${limit}`, `Gagal mengambil ${limit} proyek`);
    return json.data;
};

export const fetchProjectDetail = async (id: string): Promise<ProjectItem> => {
    const json = await fetchJson<{ data: ProjectItem }>(`${API_BASE_URL}/projects/${id}`, `Gagal mengambil detail Project ${id}`);
    return json.data;
};

export interface CreateProjectPayload {
    title: string;
    category: string;
    description: string;
    author: string;
    date: string;
    jenjang: string;
    imageUrl?: File;
    documents?: File[];
    document_types?: string[];
    document_titles?: string[];
}

export interface CreateProjectResponse {
    message: string;
    data: ProjectItem;
}

export const createProject = async (payload: CreateProjectPayload): Promise<CreateProjectResponse> => {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('category', payload.category);
    formData.append('description', payload.description);
    formData.append('author', payload.author);
    formData.append('date', payload.date);
    formData.append('jenjang', payload.jenjang);
    if (payload.imageUrl) formData.append('imageUrl', payload.imageUrl);

    if (payload.documents?.length) {
        payload.documents.forEach(file => formData.append('documents[]', file));
        payload.document_types?.forEach(type => formData.append('document_types[]', type));
        payload.document_titles?.forEach(title => formData.append('document_titles[]', title));
    }

    const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
    });

    return handleSimpleResponse(response, 'Gagal membuat proyek');
};

export interface UpdateProjectPayload extends CreateProjectPayload {
    id: number;
}

export const updateProject = async (payload: UpdateProjectPayload): Promise<CreateProjectResponse> => {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('category', payload.category);
    formData.append('description', payload.description);
    formData.append('author', payload.author);
    formData.append('date', payload.date);
    formData.append('jenjang', payload.jenjang);
    if (payload.imageUrl) formData.append('imageUrl', payload.imageUrl);

    if (payload.documents?.length) {
        payload.documents.forEach(file => formData.append('documents[]', file));
        payload.document_types?.forEach(type => formData.append('document_types[]', type));
        payload.document_titles?.forEach(title => formData.append('document_titles[]', title));
    }
    formData.append('_method', 'PUT');

    const response = await fetch(`${API_BASE_URL}/api/projects/${payload.id}`, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
    });

    return handleSimpleResponse(response, 'Gagal mengupdate proyek');
};

export const deleteProject = async (id: string | number): Promise<DeleteResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
    });
    return handleSimpleResponse(response, 'Gagal menghapus proyek');
};

export const deleteProjectDocument = async (projectId: string | number, documentUrl: string): Promise<DeleteResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/document`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ document_url: documentUrl })
    });
    return handleSimpleResponse(response, 'Gagal menghapus dokumen');
};

export interface DeleteResponse {
    message: string;
}


/* ================= JOURNALS ================= */

export const fetchJournals = async (): Promise<JournalItem[]> => {
    const json = await fetchJson<{ data: JournalItem[] }>(`${API_BASE_URL}/journals`, 'Gagal mengambil data Jurnal');
    return json.data;
};

export const fetchJournalsWithLimit = async (limit: number): Promise<JournalItem[]> => {
    const json = await fetchJson<{ data: JournalItem[] }>(`${API_BASE_URL}/journals/limit/${limit}`, `Gagal mengambil ${limit} jurnal`);
    return json.data;
};

export const fetchBestJournals = async (): Promise<JournalItem[]> => {
    const json = await fetchJson<{ data: JournalItem[] }>(`${API_BASE_URL}/journals/best`, 'Gagal mengambil data Jurnal Terbaik');
    return json.data;
};

export const fetchJournalDetail = async (id: string): Promise<JournalItem> => {
    const json = await fetchJson<{ data: JournalItem }>(`${API_BASE_URL}/journals/${id}`, `Gagal mengambil detail Jurnal ${id}`);
    return json.data;
};

export interface CreateJournalPayload {
    title: string;
    category: string;
    abstract: string;
    author: string;
    mentor: string;
    score: number;
    date: string;
    jenjang: string;
    is_best: boolean;
    documentUrl?: File;
}

export interface CreateJournalResponse {
    message: string;
    data: JournalItem;
}

export const createJournal = async (payload: CreateJournalPayload): Promise<CreateJournalResponse> => {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('category', payload.category);
    formData.append('abstract', payload.abstract);
    formData.append('author', payload.author);
    formData.append('mentor', payload.mentor);
    formData.append('score', payload.score.toString());
    formData.append('date', payload.date);
    formData.append('jenjang', payload.jenjang);
    formData.append('is_best', payload.is_best ? '1' : '0');
    if (payload.documentUrl) formData.append('documentUrl', payload.documentUrl);

    const response = await fetch(`${API_BASE_URL}/api/journals`, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
    });

    return handleSimpleResponse(response, 'Gagal membuat jurnal');
};

export interface UpdateJournalPayload extends CreateJournalPayload {
    id: number;
}

export const updateJournal = async (payload: UpdateJournalPayload): Promise<CreateJournalResponse> => {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('category', payload.category);
    formData.append('abstract', payload.abstract);
    formData.append('author', payload.author);
    formData.append('mentor', payload.mentor);
    formData.append('score', payload.score.toString());
    formData.append('date', payload.date);
    formData.append('jenjang', payload.jenjang);
    formData.append('is_best', payload.is_best ? '1' : '0');
    if (payload.documentUrl) formData.append('documentUrl', payload.documentUrl);
    formData.append('_method', 'PUT');

    const response = await fetch(`${API_BASE_URL}/api/journals/${payload.id}`, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
    });

    return handleSimpleResponse(response, 'Gagal mengupdate jurnal');
};

export const deleteJournal = async (id: string | number): Promise<DeleteResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/journals/${id}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
    });
    return handleSimpleResponse(response, 'Gagal menghapus jurnal');
};


/* ================= FACILITIES ================= */

export const fetchFacilities = async (): Promise<Facility[]> => {
    const json = await fetchJson<{ data: Facility[] }>(`${API_BASE_URL}/facilities`, 'Gagal mengambil data Fasilitas');
    return json.data;
};

export const fetchFacilityDetail = async (id: string): Promise<Facility> => {
    const json = await fetchJson<{ data: Facility }>(`${API_BASE_URL}/facilities/${id}`, `Gagal mengambil detail Fasilitas ${id}`);
    return json.data;
};
