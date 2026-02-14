
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Source, GroundingChunk } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
const TARGET_DOMAIN = "kosalnith.github.io";

export const conductResearch = async (query: string): Promise<{
  text: string;
  sources: Source[];
}> => {
  try {
    const restrictedQuery = `site:${TARGET_DOMAIN} ${query}`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: restrictedQuery,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: `You are the Research Assistant for Kosal Nith's official website. 
        Your primary directive is to answer questions strictly using information from https://${TARGET_DOMAIN}.
        
        Scope:
        - Research interests (Macroeconomics, Monetary Economics, Economic Growth, Economic Uncertainty).
        - Professional affiliations (CDRI, YSI, INET).
        - Published papers, press appearances, and teaching history.
        - Personal background provided on the site.

        Tone: Professional, academic, and humble. 
        Format: Use clear headings. If the site doesn't mention something, state "Based on Kosal Nith's official site, no specific information is available on this topic."`
      },
    });

    const text = response.text || "Information not found on the official site.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources: Source[] = chunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }))
      .filter(s => s.uri.includes(TARGET_DOMAIN));

    const uniqueSources = Array.from(new Set(sources.map(s => s.uri)))
      .map(uri => sources.find(s => s.uri === uri)!)
      .slice(0, 8);

    return { text, sources: uniqueSources };
  } catch (error) {
    console.error("Research failed:", error);
    throw error;
  }
};

export const getFollowUpQuestions = async (query: string, context: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Context: "${context.substring(0, 1000)}". Generate 3 academic follow-up questions to help a visitor learn more about Kosal Nith's research or career. Return ONLY a JSON array of strings.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return ["Tell me more about his research in macroeconomics", "What are his recent publications?", "How can I contact him?"];
  }
};
