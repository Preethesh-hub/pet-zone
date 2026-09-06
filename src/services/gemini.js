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
    model: 'gemini-3.6-flash',
    systemInstruction: "You are an expert AI veterinarian assistant inside the PetZone app. Provide helpful, concise advice for pet health, diet, and training. Always end your responses with a disclaimer to consult a real vet for serious medical emergencies. Keep your answers brief and easy to read."
  });
}

// Keep track of the chat history
let chatSession = null;

export const sendMessageToAI = async (message) => {
  if (!apiKey) {
    return "It looks like the Gemini API key is missing. Please add `VITE_GEMINI_API_KEY` to your `.env` file to enable the AI Vet Assistant. For now, I'm just a mock response! 🐾";
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
    return "I'm currently unable to connect to my AI brain. Please check your Gemini API key in the `.env` file, ensure it is valid, and verify you haven't exceeded your quota. 🐾";
  }
};
