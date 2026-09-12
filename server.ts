import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { generateSmartResponse } from './server/smartResponder';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const CANDIDATE_MODELS = ['gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-flash-latest'];

// Helper to get or create Gemini client for a given API key
function getGenAIClient(customKey?: string): GoogleGenAI | null {
  const key = customKey || process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({ apiKey: key });
}

// Health check and connection test endpoint
app.get('/api/health', (req, res) => {
  const customKey = (req.headers['x-gemini-api-key'] as string) || '';
  const activeKey = customKey || process.env.GEMINI_API_KEY || '';
  const hasKey = Boolean(activeKey);

  res.json({
    status: 'ok',
    aiOnline: true,
    model: 'gemini-3.6-flash',
    apiKeyConfigured: hasKey,
    runtime: 'talking_bot (Python & Node.js GenAI Engine)',
    timestamp: new Date().toISOString()
  });
});

// Key status endpoint
app.get('/api/key-status', (req, res) => {
  const customKey = (req.headers['x-gemini-api-key'] as string) || '';
  const activeKey = customKey || process.env.GEMINI_API_KEY || '';
  const hasKey = Boolean(activeKey);
  const masked = hasKey ? `${activeKey.slice(0, 4)}...${activeKey.slice(-4)}` : '';

  res.json({
    configured: hasKey,
    maskedKey: masked
  });
});

// Configure or update Gemini API key dynamically
app.post('/api/set-api-key', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ error: 'API key is required.' });
  }

  const cleanKey = apiKey.trim();

  // Test the key with gemini-3.6-flash (or candidate models)
  try {
    const testAI = new GoogleGenAI({ apiKey: cleanKey });
    let verified = false;
    let verifiedModel = 'gemini-3.6-flash';
    let lastError: any = null;

    for (const m of CANDIDATE_MODELS) {
      try {
        await testAI.models.generateContent({
          model: m,
          contents: 'Hi! Connection test.',
          config: {
            maxOutputTokens: 10,
          }
        });
        verified = true;
        verifiedModel = m;
        break;
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || '';
        // If model not found or deprecated, try next candidate
        if (err?.status === 404 || msg.includes('not found') || msg.includes('no longer available') || msg.includes('NOT_FOUND')) {
          continue;
        }
        throw err;
      }
    }

    if (!verified && lastError) {
      throw lastError;
    }

    // Successfully verified, persist to environment and .env file
    process.env.GEMINI_API_KEY = cleanKey;

    try {
      const envPath = path.join(process.cwd(), '.env');
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }

      if (/^GEMINI_API_KEY=/m.test(envContent)) {
        envContent = envContent.replace(/^GEMINI_API_KEY=.*$/m, `GEMINI_API_KEY="${cleanKey}"`);
      } else {
        envContent += `\nGEMINI_API_KEY="${cleanKey}"\n`;
      }
      fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
    } catch (fsErr) {
      console.warn('Could not write .env file, retained in process.env memory', fsErr);
    }

    res.json({
      success: true,
      message: `Gemini API Key verified and saved successfully! (Model: ${verifiedModel})`
    });
  } catch (testErr: any) {
    console.error('API Key validation failed:', testErr);
    let readableError = testErr?.message || 'Invalid Gemini API key or unable to connect to Google GenAI.';
    try {
      if (typeof readableError === 'string' && readableError.includes('{')) {
        const jsonMatch = readableError.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed?.error?.message) {
            readableError = parsed.error.message;
          }
        }
      }
    } catch {
      // Keep original readableError
    }

    res.status(400).json({
      success: false,
      error: readableError
    });
  }
});

// Chat endpoint supporting multi-turn conversation context
app.post('/api/chat', async (req, res) => {
  const { message, history = [], systemInstruction, apiKey: bodyApiKey } = req.body;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  const cleanMessage = message.trim();

  // Check for exit / quit commands
  if (/^(exit|quit|bye|goodbye)$/i.test(cleanMessage)) {
    return res.json({
      isExit: true,
      reply: 'Thanks for chatting with Talking Bot! See you again.',
    });
  }

  const headerKey = req.headers['x-gemini-api-key'] as string;
  const activeKey = headerKey || bodyApiKey || process.env.GEMINI_API_KEY;

  // If Gemini API Key is available, invoke live Gemini model
  if (activeKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: activeKey });

      // Map history to contents format expected by SDK
      const contents: any[] = [];
      const recentHistory = Array.isArray(history) ? history.slice(-10) : [];
      for (const item of recentHistory) {
        if (item.sender === 'user' && item.text) {
          contents.push({
            role: 'user',
            parts: [{ text: item.text }]
          });
        } else if (item.sender === 'bot' && item.text) {
          contents.push({
            role: 'model',
            parts: [{ text: item.text }]
          });
        }
      }

      // Add current user message
      contents.push({
        role: 'user',
        parts: [{ text: cleanMessage }]
      });

      const defaultSystemPrompt = "You are 'Talking Bot', a friendly, intelligent, and cheerful AI conversation assistant. You provide clear, engaging, concise, and helpful answers. You can speak about any topic, solve math problems accurately, converse in English and Bengali, explain complex concepts simply, teach programming, and keep conversations engaging. Always maintain a warm, polite, and encouraging tone.";

      let response: any = null;
      let usedModel = 'gemini-3.6-flash';
      let lastApiErr: any = null;

      for (const m of CANDIDATE_MODELS) {
        try {
          response = await ai.models.generateContent({
            model: m,
            contents: contents,
            config: {
              systemInstruction: systemInstruction || defaultSystemPrompt,
              temperature: 0.7,
              maxOutputTokens: 1000,
            }
          });
          usedModel = m;
          break;
        } catch (err: any) {
          lastApiErr = err;
          const msg = err?.message || '';
          if (err?.status === 404 || msg.includes('not found') || msg.includes('no longer available') || msg.includes('NOT_FOUND')) {
            continue;
          }
          throw err;
        }
      }

      if (!response && lastApiErr) {
        throw lastApiErr;
      }

      const replyText = response?.text || "I'm here to chat! Could you please repeat that?";

      return res.json({
        reply: replyText,
        model: usedModel,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.warn('Gemini API request failed, falling back to smart local engine:', error?.message);
      // Fallback smoothly to smart responder instead of crashing or returning an error
      const smartReply = generateSmartResponse(cleanMessage, history);
      return res.json({
        reply: smartReply,
        model: 'gemini-3.6-flash (offline fallback)',
        timestamp: new Date().toISOString(),
        warning: error?.message
      });
    }
  }

  // When no API key is provided, use the built-in smart conversational engine
  // This immediately answers math expressions (e.g. 1 - 1, 1 + 1), greetings, Bengali & English queries, and code
  const smartReply = generateSmartResponse(cleanMessage, history);

  return res.json({
    reply: smartReply,
    model: 'gemini-3.6-flash (built-in engine)',
    timestamp: new Date().toISOString(),
    isOfflineFallback: true
  });
});

// Start server with Vite middleware in dev or static files in production
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Talking Bot Server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  start();
}

export default app;

