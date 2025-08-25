import type { VercelRequest, VercelResponse } from "@vercel/node";

function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// No app.listen — Vercel mounts this at /api/gemini-hint
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const fallback = "In works for AI Generated Hints";
  try {
    const raw = (req as any).body;
    const body = typeof raw === "string" ? JSON.parse(raw) : (raw ?? {});
    const { message, stepContext } = body as { message?: string; stepContext?: string };

    if (!message || typeof message !== "string") return res.status(200).json({ hint: fallback });

    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      console.error("[api] GOOGLE_GENAI_API_KEY missing");
      return res.status(200).json({ hint: fallback });
    }

    const prompt = `You are a helpful math tutor.
Student input: "${message}"
Step context: "${stepContext ?? "General Math"}"
Provide a short, encouraging hint only. Do NOT reveal the final answer.`.trim();

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      encodeURIComponent(apiKey);

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
    });

    if (!resp.ok) {
      console.error("[api] Gemini error", resp.status, await resp.text().catch(() => ""));
      return res.status(200).json({ hint: fallback });
    }

    const data = await resp.json().catch(() => null);
    const hint =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      data?.candidates?.[0]?.output_text ??
      fallback;

    return res.status(200).json({ hint });
  } catch (err) {
    console.error("[api] handler error:", err);
    return res.status(200).json({ hint: fallback });
  }
}
