import express from 'express';
import cors from 'cors';
import { heistRouter } from './routes/heist.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/heist', heistRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Time Heist API', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Time Heist Server running on http://localhost:${PORT}`);
});
