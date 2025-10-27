import { GoogleGenAI } from "@google/genai";

export const generateReflection = async (entryText: string): Promise<string> => {
  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    console.error("API_KEY environment variable not set");
    throw new Error("A variável de ambiente API_KEY não está definida.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const systemInstruction = "Você é um assistente gentil e inspirador. Com base na entrada do diário de gratidão do usuário, escreva um pensamento, citação ou reflexão curta, edificante e positiva. Mantenha-a com uma ou duas frases. Responda em português.";

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: entryText,
        config: {
          systemInstruction: systemInstruction,
        }
    });

    const reflectionText = response.text;
    
    if (!reflectionText) {
      return "Lembre-se de que cada momento de gratidão é um passo em direção à felicidade.";
    }

    return reflectionText.trim();
  } catch (error) {
    console.error("Error generating reflection from Gemini API:", error);
    throw new Error("Falha ao gerar reflexão.");
  }
};
