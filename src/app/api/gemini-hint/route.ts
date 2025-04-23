import fetch from 'node-fetch'; // If you're in a Node.js environment
import dotenv from "dotenv";
import path from "path";

// Load the .env file
dotenv.config({ path: path.resolve(__dirname, "../../../.env") }); // Adjust the path to the .env file

// Use the API key from the environment variable
const apiKey = process.env.GOOGLE_GENAI_API_KEY;

console.log("API Key in route.ts:", apiKey); // Log the API key in route.ts

if (!apiKey) {
  throw new Error("GOOGLE_GENAI_API_KEY is not set.");
}

async function getGeminiHint(word: string) {
  const prompt = `Provide a short hint for the word "${word}". The hint should be one sentence.`;

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey as string, // Ensure the API key is passed correctly
      },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: prompt }],
        }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status} ${response.statusText}`);
    }

    interface GeminiResponse {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    }

    const data = await response.json() as GeminiResponse;

    const hintText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return hintText; // Return the hint
  } catch (error: any) {
    console.error("Error fetching hint:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

// Example usage:
async function main() {
  try {
    const wordToHint = "serendipity";
    const hint = await getGeminiHint(wordToHint);
    console.log(`Hint for "${wordToHint}": ${hint}`);
  } catch (error: any) {
    console.error("Error in main:", error);
  }
}

// Don't forget to call main()
main();