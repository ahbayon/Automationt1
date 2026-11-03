import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

function getGeminiClient(customApiKey?: string) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Check API key status
app.get('/api/ai/status', (req, res) => {
  const hasEnvKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    hasEnvKey,
    defaultKeyActive: hasEnvKey,
  });
});

// Validate API key
app.post('/api/ai/test-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    const ai = getGeminiClient(apiKey);
    if (!ai) {
      return res.status(400).json({ success: false, error: 'No API key provided' });
    }
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Ping test. Reply with "OK".',
    });
    res.json({ success: true, text: response.text });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'API key verification failed' });
  }
});

// Expand Natok Review Script
app.post('/api/ai/expand-script', async (req, res) => {
  try {
    const { script, durationMinutes = 1, dramaTitle, customApiKey } = req.body;
    const ai = getGeminiClient(customApiKey);

    if (!ai) {
      // Return a smart generated Bengali script locally if no key is configured
      const localSample = `আসসালামু আলাইকুম বন্ধুরা, আজকের পর্বে আপনারা দেখবেন ${dramaTitle || 'দুনিয়া টাকার গোলাম'} নাটকের নতুন কিছু চমক এবং অত্যন্ত আকর্ষণীয় কিছু টুইস্ট, যেগুলো আপনাদের কখনোই জানা ছিল না। গল্পের শুরুতেই আমরা দেখতে পাই নায়কের জীবনের এক চরম নাটকীয় পরিবর্তন, যেখানে বিশ্বস্ততা আর প্রতারণার মাঝে এক কঠিন দ্বন্দ্ব শুরু হয়। প্রতিটি মুহূর্তে নতুন নতুন রহস্য উন্মোচিত হতে থাকে। শেষ পর্যন্ত কে জয়ী হয় আর কার মুখোশ খুলে পড়ে, তা জানতে পুরো পর্বটি মনোযোগ দিয়ে উপভোগ করুন। ভিডিওটি ভালো লাগলে লাইক, কমেন্ট ও সাবস্ক্রাইব করে সাথেই থাকুন!`;
      return res.json({
        success: true,
        script: localSample,
        source: 'local_template',
      });
    }

    const targetWords = Math.min(2500, Math.max(80, Math.round(durationMinutes * 130)));

    const prompt = `You are an expert Bengali drama (Natok) reviewer and story summary narrator for YouTube/Facebook recap videos.
Expand or write a gripping, dramatic Bengali review narration based on the following input:

Input draft / context: "${script || dramaTitle || 'দুনিয়া টাকার গোলাম নাটক রিভিউ'}"
Target Duration: approximately ${durationMinutes} minute(s) (~${targetWords} words).
Drama Title: ${dramaTitle || 'দুনিয়া টাকার গোলাম'}

Guidelines:
1. Write entirely in natural, expressive Bengali (বাংলা ভাষা), using engaging colloquial phrases used by popular Natok review channels (যেমন: "বন্ধুরা আজকের পর্বে দেখবেন...", "গল্পের শুরুতে আমরা দেখতে পাই...", "এমন এক নাটকীয় মোড় যা কেউ কল্পনাও করেনি...", "আসসালামু আলাইকুম বন্ধুরা...").
2. Build suspense, highlight dramatic twists, character clashes, emotional high points, and conclude with a call to subscribe and comment.
3. Output ONLY the spoken narration script in plain text without markdown bolding (**), asterisks (*), or stage directions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a professional Bengali YouTube drama recap scriptwriter. Always write natural, exciting spoken Bengali without asterisks.',
      },
    });

    const generatedText = response.text || '';
    res.json({ success: true, script: generatedText.replace(/[*#_]/g, '') });
  } catch (error: any) {
    console.error('Script expansion error:', error);
    res.status(500).json({ success: false, error: error.message || 'Script expansion failed' });
  }
});

// Text-to-Speech (TTS)
app.post('/api/ai/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Zephyr', customApiKey } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    const ai = getGeminiClient(customApiKey);
    if (!ai) {
      return res.json({
        success: false,
        error: 'NO_API_KEY',
        fallback: true,
      });
    }

    const validVoices = ['Kore', 'Aoede', 'Zephyr', 'Fenrir', 'Charon', 'Puck'];
    const chosenVoice = validVoices.includes(voiceName) ? voiceName : 'Zephyr';

    // Limit text chunk for single unary TTS request
    const trimmedText = text.slice(0, 1500);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: trimmedText,
              speechMetadata: {
                style: 'Dramatic Bengali drama review narrator, engaging, clear storytelling tone',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: chosenVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.json({ success: false, error: 'No audio returned from model', fallback: true });
    }

    res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('TTS generation error:', error);
    res.json({
      success: false,
      error: error.message || 'TTS generation failed',
      fallback: true,
    });
  }
});

// AI Song & Music Generation
app.post('/api/ai/song', async (req, res) => {
  try {
    const { dramaTitle = 'দুনিয়া টাকার গোলাম', mood = 'Emotional Dramatic', customApiKey } = req.body;
    const ai = getGeminiClient(customApiKey);

    if (!ai) {
      return res.json({
        success: true,
        title: `${dramaTitle} - থিম সং (AI Remaster)`,
        lyrics: `টাকার এই দুনিয়ায় স্বার্থের খেলা,\nআপন মানুষ অচেনা হয় আঁধার বেলা।\nমায়ার বাঁধন ছিঁড়ে যায় যে নিমিষে,\nহৃদয় কাঁদে নিরবে চোখের জলে ভেসে...`,
        tempo: 85,
        genre: 'Bengali Folk Pop / Drama Ballad',
      });
    }

    const prompt = `Write a deep, soulful, dramatic Bengali theme song for the TV serial/Natok "${dramaTitle}".
Mood: ${mood}.
Provide:
1. Song title in Bengali
2. 2-3 stanzas of poignant Bengali lyrics (Mukhra and Antara)
3. Recommended BPM/Tempo and musical instruments (Flute, Dotara, Piano, Strings).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({
      success: true,
      text: response.text,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
