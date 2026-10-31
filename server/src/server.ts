import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { connectMongo } from './config/mongo.js';
import apiRoutes from './routes/api/index.js';

const app = express();
const PORT = process.env.PORT || 3001;
const clientDistPath = path.resolve('../client/dist');

// Render terminates TLS at one proxy hop; trust it so req.ip is the real client.
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));
app.use(express.static(clientDistPath));
app.use('/api', apiRoutes);

app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

const start = async () => {
  try {
    await connectMongo();
    app.listen(PORT, () => {
      console.log(`Daily Bytes running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Daily Bytes failed to start:', error);
    process.exit(1);
  }
};

void start();
