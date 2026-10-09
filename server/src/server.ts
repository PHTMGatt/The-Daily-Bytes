import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import apiRoutes from './routes/api/index.js';

const app = express();
const PORT = process.env.PORT || 3001;
const clientDistPath = path.resolve('../client/dist');

app.use(express.json());
app.use(express.static(clientDistPath));
app.use('/api', apiRoutes);

// Let React Router handle client-side routes after API routes are checked.
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
