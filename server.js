const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Works with any OpenAI-compatible provider (Groq, xAI Grok, and others). Set these in .env
const API_KEY  = (process.env.LLM_API_KEY || '').trim();
const BASE_URL = (process.env.LLM_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/$/, '');
const MODEL    = (process.env.LLM_MODEL || 'openai/gpt-oss-20b').trim();

app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// The conversation lives only in the browser tab. Nothing is saved here.
app.post('/api/chat', async (req, res) => {
  const messages = req.body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'No messages sent.' });
  }
  if (!API_KEY) {
    console.error('LLM_API_KEY is missing. Check your .env file.');
    return res.status(500).json({ error: 'Missing LLM_API_KEY in your .env file.' });
  }
  try {
    const r = await fetch(BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + API_KEY },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2048,
        messages: [
          { role: 'system', content: 'You are Flash, a friendly and helpful AI assistant. Give clear, concise answers.' },
          ...messages.slice(-20)
        ]
      })
    });
    const data = await r.json();
    if (!r.ok) {
      const msg = (data.error && (data.error.message || data.error)) || 'API error';
      console.error('API error ' + r.status + ':', msg);
      return res.status(r.status).json({ error: String(msg) });
    }
    const reply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!reply) return res.status(502).json({ error: 'The model returned an empty reply. Try again.' });
    res.json({ reply });
  } catch (e) {
    console.error('Request failed:', e.message);
    res.status(500).json({ error: 'Could not reach the API. Check your internet connection.' });
  }
});

app.listen(PORT, () => {
  console.log('Flash is running at http://localhost:' + PORT + ' (model: ' + MODEL + ')');
  if (!API_KEY) console.log('Warning: LLM_API_KEY not found. Create a .env file next to server.js.');
});