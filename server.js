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
  const { question, userAnswer, correctAnswer, scenario } = req.body;

  let prompt = "";


  if (scenario === "progress_completed") {
    // Congratulatory prompt when progress reaches 100%
    prompt = `
      Question: ${question}
      User's answer: ${userAnswer}
      Correct answer: ${correctAnswer}
  
     Congratulate the user briefly (1-2 sentences) for completing the question successfully. Be enthusiastic but concise. Encourage them to continue to the next challenge.
      `;
  } else if (scenario === "progress_increased") {
    // Motivational prompt when progress increases
    prompt = `
      Question: ${question}
      User's answer: ${userAnswer}
      Correct answer: ${correctAnswer}

      Give a short motivational message (1-2 sentences) to recognize their progress and encourage them to keep going.
    `;
  } else if (scenario === "progress_decreased") {
    // Hint prompt when progress decreases
    prompt = `
    Use this context to generate a hint for the user.
      Question: ${question}
      User's answer: ${userAnswer}
      Correct answer: ${correctAnswer}

      Compare the user's answer with the correct answer. In 1-2 sentences, 
      give short feedback about how close they are, then offer a brief hint. 
      Include a quick, similar example using different numbers but the same solution method. 
      Avoid directly referencing the original question.
    `;
  } else if (scenario === "no_progress") {
    // Prompt when there is no progress increase
    prompt = `
      Question: ${question}
      User's answer: ${userAnswer}
      Correct answer: ${correctAnswer}
  
        Give a short motivational boost (1 sentence). 
        Then provide a very brief hint (1-2 sentences) with a simple example using different values. 
        Keep the total response under 80 words.
      `;
  } 
 else if (scenario === "hint_requested") {
  // Prompt when the "Need a hint?" button is clicked
  prompt = `
    Question: ${question}
    User's answer: ${userAnswer}
    Correct answer: ${correctAnswer}

    Give a short and helpful hint without revealing the answer. 
    Use simple words. 
    Optionally include a short, similar example using different numbers. 
    Keep the hint under 80 words.
    `;
}
  else if (scenario === "character_limit") {
    // Prompt when the user exceeds the character limit
    prompt = `
      Provide a short one sentence indicating and scolding the students is guessing. 
    `;
  }
  else if (scenario === "manual_submit") {
    prompt = `
      Question: ${question}
      User's answer: ${userAnswer}
      Correct answer: ${correctAnswer}
    
      Briefly validate the user's answer. 
      If correct, congratulate them in 1 sentence.
      If incorrect, provide a short hint (1-2 sentences) without revealing the answer.
      `;
  }

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
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