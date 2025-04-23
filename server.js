import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Define __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the .env file
dotenv.config({ path: path.resolve(__dirname, ".env") }); // Load backend-specific .env file

const app = express();

const apiKey = process.env.GOOGLE_GENAI_API_KEY;
console.log("GOOGLE_GENAI_API_KEY:", apiKey);

if (!apiKey) {
  throw new Error("GOOGLE_GENAI_API_KEY is not set.");
}

app.use(cors({ origin: "http://localhost:5173" })); // Allow requests from the frontend
app.use(express.json());

app.post("/api/gemini-hint", async (req, res) => {
  const { question, userAnswer, correctAnswer } = req.body;

  const prompt = `
    Question: ${question}
    User's answer: ${userAnswer}
    Correct answer: ${correctAnswer}
    
    Can you provide a helpful hint that guides the user toward the correct answer without giving it away directly? 
    Keep your response under 100 words and focus on addressing misconceptions in their answer.
  `;

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey, // Use the API key from the .env file
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API Error:", errorData);
      return res.status(response.status).json({ error: "Failed to get hint from Gemini API", details: errorData });
    }

    const data = await response.json();
    const hint = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a hint at this time.";
    res.json({ hint });
  } catch (error) {
    console.error("Error fetching hint:", error);
    res.status(500).json({ error: "Failed to process request", details: String(error) });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});