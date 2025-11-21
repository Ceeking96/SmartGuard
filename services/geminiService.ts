import { GoogleGenAI } from "@google/genai";
import { PROFESSIONS } from "../constants";
import { ProfessionType } from "../types";

// Helper to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API Key not found");
    }
    this.ai = new GoogleGenAI({ apiKey: apiKey || '' });
  }

  async generateProfessionAvatar(originalImage: string, profession: ProfessionType): Promise<string> {
    // originalImage is expected to be a base64 data string (with or without prefix, we handle it)
    
    let cleanBase64 = originalImage;
    if (originalImage.includes('base64,')) {
      cleanBase64 = originalImage.split(',')[1];
    }

    const config = PROFESSIONS[profession];
    if (!config) throw new Error("Invalid profession");

    try {
      // Using gemini-2.5-flash-image for image-to-image editing/generation
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image', 
        contents: {
          parts: [
            {
              text: `Transform this person into a ${config.title}. They should be ${config.promptContext}. The face should strongly resemble the original person. Photorealistic, high quality, 4k, cinematic lighting.`,
            },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: cleanBase64
              }
            }
          ]
        }
      });

      // Extract image from response
      for (const part of response.candidates?.[0]?.content?.parts || []) {
         if (part.inlineData) {
             return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
         }
      }
      
      throw new Error("No image generated in response");
    } catch (error) {
      console.error("Gemini Image Gen Error:", error);
      throw error;
    }
  }

  async findNearbyPlaces(lat: number, lng: number, query: string): Promise<any[]> {
    try {
      const model = 'gemini-2.5-flash';
      const prompt = `Find the nearest 5 ${query}. Return their names, estimated distance, and address. Provide the result as a list.`;
      
      const response = await this.ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: lat,
                longitude: lng
              }
            }
          }
        }
      });

      // Extract grounding chunks
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      if (chunks && chunks.length > 0) {
        // Map chunks to a cleaner format
        return chunks
            .filter((c: any) => c.maps) // Ensure it's a map result
            .map((c: any) => ({
                title: c.maps.title,
                uri: c.maps.uri,
                address: c.maps.address 
            }));
      }
      
      return [];
    } catch (error) {
      console.error("Gemini Maps Error:", error);
      return [];
    }
  }

  async getConsultation(profession: ProfessionType, userQuery: string, imageBase64?: string | null): Promise<string> {
     try {
        // Global formatting instruction to prevent markdown
        const formattingInstruction = "STRICT FORMATTING RULE: Do NOT use markdown characters. Do NOT use asterisks (*), hashtags (#), or bold/italic syntax. Use simple dashes (-) for lists and plain text only. Keep the tone helpful and direct.";

        let systemPrompt = "";
        
        switch(profession) {
            case ProfessionType.DOCTOR:
                systemPrompt = `You are a medical doctor. Provide immediate first-aid or over-the-counter medication advice (e.g. Paracetamol for headache, Albendazole for worms). Be specific but concise. Always end with a recommendation to visit a hospital. ${formattingInstruction}`;
                break;
            case ProfessionType.LAWYER:
                systemPrompt = `You are a lawyer. Provide immediate legal advice for emergency situations (e.g. rights upon arrest). Be professional and protective. ${formattingInstruction}`;
                break;
            case ProfessionType.MECHANIC:
                systemPrompt = `You are a mechanic. Diagnose the car issue based on the description or image and suggest a temporary fix or safety measure. Focus on practical fixes like changing tires, refilling oil, or checking brakes. ${formattingInstruction}`;
                break;
            case ProfessionType.HANDYMAN:
                systemPrompt = `You are an expert handyman and survivalist. Your expertise covers: 
                1. Household repairs (fixing sinks, broken windows, doors).
                2. Vehicle maintenance (fixing tires, refilling oil for cars and generators).
                3. Bicycle maintenance (fixing brake pads, chains).
                4. Off-grid survival projects (water filtration, storage).
                
                If the user provides an image of a broken item, analyze it and provide a step-by-step guide to fix it. 
                List necessary tools (or improvisation alternatives) and safety warnings. 
                Refer to 'No Grid Survival Projects' principles where applicable (self-reliance, simple tools).
                ${formattingInstruction}`;
                break;
            default:
                systemPrompt = `You are an emergency response coordinator. Provide immediate safety advice. ${formattingInstruction}`;
        }

        const contentParts: any[] = [{ text: `User query: "${userQuery}". ${systemPrompt}` }];

        if (imageBase64) {
            // Remove header if present
            const cleanBase64 = imageBase64.includes('base64,') ? imageBase64.split(',')[1] : imageBase64;
            contentParts.push({
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: cleanBase64
                }
            });
        }

        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: contentParts },
        });

        let text = response.text || "I cannot provide advice right now. Please contact emergency services.";
        
        // Double check cleaning to remove any stubborn markdown
        text = text.replace(/\*\*/g, '') // Remove bold
                   .replace(/\*/g, '-')   // Replace bullets with dashes
                   .replace(/#/g, '')     // Remove headers
                   .replace(/__ /g, '');  // Remove underscores

        return text;
     } catch (error) {
         console.error(error);
         return "Connection error. Please use the emergency call button.";
     }
  }
}

export const geminiService = new GeminiService();