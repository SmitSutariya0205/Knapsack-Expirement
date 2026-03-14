import 'dotenv/config';
import express from 'express';
import { connectPostgres } from './db';
import { router as participantRoutes } from './routes/participantRoutes';
import { router as authRoutes } from './routes/authRoutes';

const app = express();
const port = Number(process.env.PORT || 8787);

const ALLOWED_ORIGINS = [
  'https://arjav5090.github.io',
  'https://smitsutariya0205.github.io',
  'http://localhost:3000',
  'http://localhost:3001',
  ...(process.env.CORS_ORIGIN?.split(',') ?? [])
];

// MANUAL CORS — do NOT use the 'cors' npm package (Render/Cloudflare strips its headers)
// Use res.setHeader to bypass any middleware interference
app.use((req, res, next) => {
  const origin = req.headers.origin as string | undefined;

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    res.setHeader('Content-Length', '0');
    res.writeHead(204);
    return res.end();
  }

  next();
});

app.use(express.json({ limit: '2mb' }));
app.use(participantRoutes);
app.use(authRoutes);

// routes
app.get('/health', (_, res) => res.json({ ok: true }));

app.listen(port, async () => {
  await connectPostgres();
  console.log(`[backend] running at http://localhost:${port}`);
});
