import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api/index.js';

const app = express();
const PORT = process.env.PORT || 3001;
const clientDistPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');

app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'daily-bytes', authMode: 'browser-local-demo',
    newsConfigured: Boolean(process.env.MEDIASTACK_API_KEY),
    horoscopeConfigured: Boolean(process.env.API_NINJAS_KEY) });
});
app.use(express.static(clientDistPath));
app.use('/api', apiRoutes);
app.use('/api', (_req, res) => { res.status(404).json({ message: 'API endpoint not found.' }); });

// Let React Router handle client-side routes after API routes are checked.
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
