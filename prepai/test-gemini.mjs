import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

async function testWorkingModels() {
  const models = ["gemini-flash-latest", "gemini-pro-latest", "gemini-1.5-flash", "gemini-1.5-pro"];

  for (const m of models) {
    try {
      console.log(`Testing model: ${m}...`);
      const res = await ai.models.generateContent({
        model: m,
        contents: [{ role: "user", parts: [{ text: "Respond with JSON: {\"status\": \"ok\"}" }] }],
      });
      console.log(`SUCCESS with ${m}:`, res.text);
    } catch (err) {
      console.log(`FAILED with ${m}:`, err.message);
    }
  }
}

testWorkingModels();
