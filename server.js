/**
 * TCS Radio — Server
 * Express static server + health check & sitemap.
 * Developed by Umair.
 */
const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

app.get('/sitemap.xml', (req, res) => {
  const base = `${req.protocol}://${req.get('host')}`;
  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${base}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>\n</urlset>\n`
  );
});

app.get('/api/health', (_req, res) => res.json({ ok: true, app: 'TCS Radio', author: 'Umair' }));

app.use((_req, res) => res.status(404).sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`TCS Radio by Umair running on http://0.0.0.0:${PORT}`);
});
