import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Wire API routes to existing handlers
const apis = ['status', 'config', 'diagnose', 'autonomous', 'logs', 'monitor', 'ping'];
for (const name of apis) {
  app.all(`/api/${name}`, async (req, res, next) => {
    try {
      const mod = await import(`./api/${name}.js`);
      await mod.default(req, res);
    } catch (error) {
      console.error(`Error in /api/${name}:`, error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
      }
    }
  });
}

// Serve static dashboard
app.use(express.static(path.join(__dirname, 'web')));

// Fallback to index.html for SPA routes (catch-all must be last)
app.use((req, res, next) => {
  // Skip API routes (already handled above)
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  // Serve index.html for all other routes
  res.sendFile(path.join(__dirname, 'web', 'index.html'));
});

const port = process.env.PORT || 3002;
app.listen(port, () => console.log(`Demo server running at http://localhost:${port}`));

