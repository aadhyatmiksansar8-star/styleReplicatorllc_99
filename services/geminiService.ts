
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResult, ImageData } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeReferenceImage = async (image: ImageData): Promise<AnalysisResult> => {
  const ai = getAI();
  const prompt = `Analyze this fashion/style image and provide a detailed breakdown for replication. 
  Include specific details about:
  - Outfit (garments, colors, materials, patterns)
  - Accessories (jewelry, hats, bags, footwear)
  - Pose (body position, limb placement, expression)
  - Camera Angle (eye-level, low, bird's eye, etc.)
  - Lighting (natural, cinematic, soft, harsh)
  - Aesthetic (vintage, futuristic, streetwear, high-fashion)
  
  Then, create a "cohesivePrompt" that is a single, dense descriptive paragraph that can be used to re-apply this entire style (clothing, pose, lighting, angle) to a DIFFERENT PERSON while keeping their facial identity if possible.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: image.base64.split(',')[1], mimeType: image.mimeType } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          outfit: { type: Type.STRING },
          accessories: { type: Type.STRING },
          pose: { type: Type.STRING },
          cameraAngle: { type: Type.STRING },
          lighting: { type: Type.STRING },
          aesthetic: { type: Type.STRING },
          cohesivePrompt: { type: Type.STRING }
        },
        required: ["outfit", "accessories", "pose", "cameraAngle", "lighting", "aesthetic", "cohesivePrompt"]
      }
    }
  });

  try {
    const text = response.text || '{}';
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Failed to parse analysis result:", error);
    throw new Error("Failed to analyze image style.");
  }
};

export const generateStyledImage = async (sourceImage: ImageData, prompt: string): Promise<string> => {
  const ai = getAI();
  const fullPrompt = `Modify this person's photo to match the following style description exactly. Maintain the person's facial features and identity, but change their outfit, pose, background, and camera angle to match this: ${prompt}`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: sourceImage.base64.split(',')[1], mimeType: sourceImage.mimeType } },
        { text: fullPrompt }
      ]
    }
  });

  if (!response.candidates?.[0]?.content?.parts) {
    throw new Error("No image generated.");
  }

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("AI responded but no image was found in the output.");
};
