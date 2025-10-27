import { GoogleGenAI } from "@google/genai";

// Singleton instance
let ai: GoogleGenAI | null = null;

/**
 * Initializes and returns the singleton instance of the GoogleGenAI client.
 * This function ensures the client is instantiated only once.
 * @throws Will throw a specific 'API_KEY_MISSING' error if the environment variable is not set.
 */
const getAiInstance = (): GoogleGenAI => {
  // Return existing instance if it's already created
  if (ai) {
    return ai;
  }

  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    console.error("API_KEY environment variable not set.");
    // This specific error is caught by the UI to show a persistent warning
    throw new Error("API_KEY_MISSING");
  }
  
  // Create, store, and return the new instance
  ai = new GoogleGenAI({ apiKey: API_KEY });
  return ai;
};

/**
 * Generates an inspirational reflection based on a user's gratitude entry.
 * @param entryText - The user's journal entry.
 * @returns A promise that resolves to the reflection string.
 * @throws Will throw an error if the API call fails, allowing the UI to handle the failure state.
 */
export const generateReflection = async (entryText: string): Promise<string> => {
  try {
    const aiInstance = getAiInstance();
    const systemInstruction = "Você é um assistente gentil e inspirador. Com base na entrada do diário de gratidão do usuário, escreva um pensamento, citação ou reflexão curta, edificante e positiva. Mantenha-a com uma ou duas frases. Responda em português.";

    const response = await aiInstance.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: entryText,
        config: {
          systemInstruction: systemInstruction,
        }
    });

    const reflectionText = response.text;
    
    if (!reflectionText) {
      throw new Error("Received an empty reflection from the API.");
    }

    return reflectionText.trim();
  } catch (error) {
    console.error("Error in generateReflection:", error);
    // Propagate the error up to the caller (UI component)
    throw error;
  }
};

/**
 * Fetches an inspirational daily quote about gratitude.
 * @returns A promise that resolves to the quote string.
 * @throws Will throw an error if the API call fails, allowing the UI to handle the failure state.
 */
export const getDailyQuote = async (): Promise<string> => {
  try {
    const aiInstance = getAiInstance();
    const systemInstruction = "Você é um gerador de citações inspiradoras. Forneça uma citação curta e impactante sobre gratidão. Apenas a citação, sem texto introdutório. Responda em português.";

    const response = await aiInstance.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "Gerar uma citação sobre gratidão.",
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.9,
        }
    });

    const quoteText = response.text;
    
    if (!quoteText) {
      throw new Error("Received an empty quote from the API.");
    }

    // Remove quotes from the beginning/end if they exist
    return quoteText.trim().replace(/^"|"$/g, '');
  } catch (error) {
    console.error("Error in getDailyQuote:", error);
    // Propagate the error up to the caller (UI component)
    throw error;
  }
};