
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

export interface SearchResult {
  text: string;
  sources: Array<{ title: string; uri: string }>;
}

export class SearchService {
  async search(query: string): Promise<SearchResult> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("API Key is missing. Please configure VITE_GEMINI_API_KEY in your deployment environment.");
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Research task: Provide a detailed answer to the following query by searching both https://kosalnith.github.io/ and https://kosalnith.substack.com/. 
        
        Query: ${query}`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
          temperature: 0.1,
        },
      });

      const text = response.text || "I couldn't retrieve specific information for that query across the verified sites.";
      
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = groundingChunks
        .map((chunk: any) => chunk.web)
        .filter((web: any) => web && web.uri && web.title)
        .map((web: any) => ({
          title: web.title,
          uri: web.uri
        }));

      const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

      return {
        text,
        sources: uniqueSources
      };
    } catch (error) {
      console.error("AI Search failed:", error);
      throw new Error("The AI search engine encountered an error. Please check your API key and quota.");
    }
  }
}

export const searchService = new SearchService();
