import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load local env
dotenv.config();

const app = express();
app.use(cors({ origin: '*'}));
app.use(express.json());

const fallback = 'In works for AI Generated Hints';

app.get('/api/ping', (req, res) => {
  res.status(200).json({ ok: true, route: '/api/ping' });
});

app.options('/api/gemini-hint', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(204).end();
});

app.get('/api/gemini-hint', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(405).json({ error: 'Method not allowed. Use POST.' });
});

app.post('/api/gemini-hint', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { message, stepContext } = req.body || {};
    if (!message || typeof message !== 'string') return res.status(200).json({ hint: fallback });

    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      console.error('[dev-api] Missing GOOGLE_GENAI_API_KEY');
      return res.status(200).json({ hint: fallback });
    }

    const prompt = `You are a helpful math tutor.\nStudent input: "${message}"\nStep context: "${stepContext ?? 'General Math'}"\nProvide a short, encouraging hint only. Do NOT reveal the final answer.`;

    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + encodeURIComponent(apiKey);

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
    });

    if (!resp.ok) {
      console.error('[dev-api] Gemini error', resp.status, await resp.text().catch(() => ''));
      return res.status(200).json({ hint: fallback });
    }

    const data = await resp.json().catch(() => null);
    const hint = data?.candidates?.[0]?.content?.parts?.[0]?.text || data?.candidates?.[0]?.output_text || fallback;
    res.status(200).json({ hint });
  } catch (err) {
    console.error('[dev-api] handler error:', err);
    res.status(200).json({ hint: fallback });
  }
});

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => {
  console.log(`[dev-api] listening on http://localhost:${PORT}`);
});
