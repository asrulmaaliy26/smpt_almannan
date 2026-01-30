
import { GoogleGenAI } from "@google/genai";

// Always initialize GoogleGenAI with the apiKey named parameter as per the guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSchoolAssistantResponse = async (userPrompt: string) => {
  if (!process.env.API_KEY) return "Maaf, asisten AI sedang tidak tersedia (API Key missing).";

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: userPrompt,
    config: {
      systemInstruction: "Anda adalah asisten virtual LPI Al Hidayah yang bernuansa Islami dan Qurani. Jawablah pertanyaan seputar sekolah dengan sopan, ramah, dan informatif. Gunakan sapaan islami yang sesuai.",
      temperature: 0.7,
    },
  });

  // Access the text property directly on the GenerateContentResponse object
  return response.text || "Maaf, saya tidak dapat memproses permintaan Anda saat ini.";
};

export const generateNewsArticle = async (briefDescription: string) => {
  if (!process.env.API_KEY) return "Gagal generate berita: API Key tidak ditemukan.";

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Buatkan artikel berita sekolah yang lengkap, inspiratif, dan formal berdasarkan deskripsi kegiatan berikut: "${briefDescription}". 
    Artikel harus memiliki judul yang menarik, paragraf pembuka (lead), isi berita yang detail (minimal 3-4 paragraf), dan penutup yang memberikan kesan positif/quurani. 
    Gunakan gaya bahasa jurnalistik namun tetap bernuansa sekolah islam unggul.`,
    config: {
      temperature: 0.8,
    },
  });

  // Access the text property directly on the GenerateContentResponse object
  return response.text || "Gagal generate konten berita.";
};
