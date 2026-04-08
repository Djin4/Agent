import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function processPDF(file: File): Promise<{ summary: string; quiz: QuizQuestion[] }> {
  // Convert File to base64
  const base64Data = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.readAsDataURL(file);
  });

  const model = "gemini-3-flash-preview";

  const prompt = `
    Analyze the attached PDF document.
    1. Provide a comprehensive summary of the key concepts, main arguments, and important details. Use Markdown formatting for the summary.
    2. Generate 5-10 multiple-choice questions based on the content. Each question should have 4 options, one correct answer, and a brief explanation of why that answer is correct.
    
    Return the response in JSON format.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: base64Data,
            },
          },
          { text: prompt },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING,
            description: "The comprehensive summary in Markdown format.",
          },
          quiz: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                correctAnswer: { type: Type.INTEGER, description: "Index (0-3) of the correct option" },
                explanation: { type: Type.STRING },
              },
              required: ["id", "question", "options", "correctAnswer", "explanation"],
            },
          },
        },
        required: ["summary", "quiz"],
      },
    },
  });

  const result = JSON.parse(response.text || "{}");
  return result;
}
