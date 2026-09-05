import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the API. The user MUST provide this in their .env file.
// For Vercel, they must add it in the Vercel Dashboard Environment Variables.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let model = null;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
  // We use flash for fast text generation
  model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    systemInstruction: "You are an expert AI veterinarian assistant inside the PetZone app. Provide helpful, concise advice for pet health, diet, and training. Always end your responses with a disclaimer to consult a real vet for serious medical emergencies. Keep your answers brief and easy to read."
  });
}

// Keep track of the chat history
let chatSession = null;

export const sendMessageToAI = async (message) => {
  if (!apiKey) {
    throw new Error('Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file or Vercel config.');
  }
  
  try {
    // Initialize session if it doesn't exist
    if (!chatSession) {
      chatSession = model.startChat({
        history: [],
      });
    }

    const result = await chatSession.sendMessage(message);
    return result.response.text();
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw new Error("Sorry, the AI Assistant is currently unavailable. Please try again later.");
  }
};
