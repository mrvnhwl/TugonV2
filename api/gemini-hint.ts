import type { VercelRequest, VercelResponse } from "@vercel/node";

function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// No app.listen — Vercel mounts this at /api/gemini-hint
export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🔥 NEW API CODE IS RUNNING!'); // Add this line
  setCors(res);
  
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const fallback = "I'm having trouble generating a personalized hint right now. Try breaking the problem down into smaller steps.";
  
  try {
    const raw = (req as any).body;
    const body = typeof raw === "string" ? JSON.parse(raw) : (raw ?? {});
    
    console.log('📥 Received payload:', body);
    
    // Extract the structured payload from hints.ts
    const { 
      model, 
      constraints, 
      context, 
      userAttempts, 
      prompt 
    } = body;

    if (!prompt || typeof prompt !== "string") {
      console.log('❌ No prompt found in payload');
      return res.status(200).json({ hint: fallback });
    }

    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      console.error("[api] GOOGLE_GENAI_API_KEY missing");
      return res.status(200).json({ hint: fallback });
    }

    // Enhanced prompt with context
    const enhancedPrompt = `You are a helpful math tutor specializing in ${context?.topicName || 'Mathematics'}.

PROBLEM CONTEXT:
- Topic: ${context?.topicName || 'General Math'}
- Question: ${context?.questionText || 'Math Problem'}
- Category: ${context?.categoryQuestion || 'Problem Solving'}
- Guide: ${context?.guideText || 'Work step by step'}
- Detected Behavior: ${context?.detectedBehavior || 'learning'}
- Current Step: ${context?.currentStepIndex + 1 || 1}

STUDENT'S RECENT ATTEMPTS:
${userAttempts?.map((attempt: any, index: number) => 
  `Attempt ${index + 1}: "${attempt.userInput}" - ${attempt.isCorrect ? 'Correct ✓' : 'Incorrect ✗'}`
).join('\n') || 'No attempts yet'}

INSTRUCTION:
${prompt}

Provide a concise, encouraging hint (1-2 sentences) that guides the student without giving away the complete answer. Focus on helping them understand the next step or correct their approach.`.trim();

    console.log('🚀 Enhanced prompt:', enhancedPrompt);

 

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    const requestBody = {
      contents: [{ 
        role: "user", 
        parts: [{ text: enhancedPrompt }] 
      }],
      generationConfig: {
        maxOutputTokens: constraints?.maxTokens || 150,
        temperature: constraints?.temperature || 0.7,
        topP: 0.8,
        topK: 40
      }
    };

    console.log('📤 Sending to Gemini:', JSON.stringify(requestBody, null, 2));

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!resp.ok) {
      const errorText = await resp.text().catch(() => "Unknown error");
      console.error("[dev-api] Gemini error", resp.status, errorText);
      
      // Parse error details if available
      try {
        const errorJson = JSON.parse(errorText);
        console.error("[dev-api] Error details:", JSON.stringify(errorJson, null, 2));
      } catch (e) {
        // Error text wasn't JSON, already logged above
      }
      
      return res.status(200).json({ hint: fallback });
    }

    const data = await resp.json().catch(() => null);
    console.log('📥 Gemini response:', JSON.stringify(data, null, 2));

    // Extract the generated hint
    let generatedHint = 
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.output_text ||
      null;

    if (generatedHint) {
      // Clean up the response
      generatedHint = generatedHint.trim();
      
      // Remove any unwanted formatting
      generatedHint = generatedHint.replace(/^\*\*|\*\*$/g, ''); // Remove bold markers
      generatedHint = generatedHint.replace(/^\*|\*$/g, ''); // Remove italic markers
      
      console.log('✅ Generated hint:', generatedHint);
      return res.status(200).json({ hint: generatedHint });
    }

    console.log('⚠️ No hint generated, using fallback');
    return res.status(200).json({ hint: fallback });
    
  } catch (err) {
    console.error("[api] handler error:", err);
    return res.status(200).json({ hint: fallback });
  }
}
