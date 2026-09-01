/**
 * Deluxe Saloon — server
 * Static site + live chat over WebSockets (in-memory, last 200 messages).
 */
const path = require('path');
const http = require('http');
const express = require('express');
const { WebSocketServer } = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

app.get('/sitemap.xml', (req, res) => {
  const base = `${req.protocol}://${req.get('host')}`;
  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${base}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>\n</urlset>\n`
  );
});

app.get('/api/health', (_req, res) => res.json({ ok: true, listeners: wss ? wss.clients.size : 0 }));

app.use((_req, res) => res.status(404).sendFile(path.join(__dirname, 'public', 'index.html')));

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const MAX = 200;
const messages = [
  { name: 'Ashish', text: 'Hi', ts: Date.now() - 900000 },
  { name: 'Sugat', text: 'Anyone from Pune', ts: Date.now() - 840000 },
  { name: 'Shyamal', text: 'I loved this tera hone laga hu', ts: Date.now() - 780000 },
  { name: 'Shubhodeep', text: 'Koe office me baithke sun rha hai??', ts: Date.now() - 600000 },
  { name: 'Deepak kushwah', text: 'Yup', ts: Date.now() - 560000 },
  { name: 'Nitesh', text: 'Bhai barish wala thoda sudhar karo, natural sound dalo', ts: Date.now() - 420000 },
  { name: 'Samir', text: 'Kya mast chiz banaya h bhai 😍', ts: Date.now() - 180000 }
];

const clean = (s, n) => String(s || '').replace(/[\u0000-\u001f]/g, '').trim().slice(0, n);
const broadcast = (obj) => {
  const raw = JSON.stringify(obj);
  wss.clients.forEach((c) => { if (c.readyState === 1) c.send(raw); });
};
const online = () => broadcast({ type: 'online', count: wss.clients.size });

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'history', messages }));
  online();
  ws.last = 0;

  ws.on('message', (raw) => {
    let d;
    try { d = JSON.parse(raw.toString().slice(0, 2000)); } catch { return; }
    if (d.type !== 'msg') return;
    const now = Date.now();
    if (now - ws.last < 800) return;           // simple rate limit
    ws.last = now;
    const message = { name: clean(d.name, 24) || 'Guest', text: clean(d.text, 200), ts: now };
    if (!message.text) return;
    messages.push(message);
    if (messages.length > MAX) messages.shift();
    broadcast({ type: 'msg', message });
  });

  ws.on('close', online);
});

server.listen(PORT, '0.0.0.0', () => console.log(`Deluxe Saloon running on http://0.0.0.0:${PORT}`));
