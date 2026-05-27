import 'dotenv/config';
import http from 'http';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import { connectDB } from './config/db';
import { redis } from './config/redis';
import { initSocketIO } from './sockets/socketManager';
import { startAssignmentWorker } from './workers/assignmentWorker';
import assignmentRoutes from './routes/assignments';
import logger from './utils/logger';

const PORT = parseInt(process.env.PORT || '4000', 10);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const PDF_DIR = process.env.PDF_OUTPUT_DIR || './pdfs';

async function bootstrap() {
  // ── Ensure upload dir ───────────────────────────────────────────────────
  if (!fs.existsSync('/tmp/veda-uploads')) {
    fs.mkdirSync('/tmp/veda-uploads', { recursive: true });
  }
  if (!fs.existsSync(PDF_DIR)) {
    fs.mkdirSync(PDF_DIR, { recursive: true });
  }
  if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs', { recursive: true });
  }

  // ── Connect DB & Redis ──────────────────────────────────────────────────
  await connectDB();
  await redis.connect();

  // ── Express ─────────────────────────────────────────────────────────────
  const app = express();

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
  app.use(
    cors({
      origin: FRONTEND_URL,
      credentials: true,
    })
  );
  app.use(morgan('combined'));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ── Static PDF serving ──────────────────────────────────────────────────
  app.use(
    '/pdfs',
    express.static(path.resolve(PDF_DIR), {
      setHeaders: (res) => {
        res.setHeader('Content-Type', 'application/pdf');
      },
    })
  );

  // ── API Routes ──────────────────────────────────────────────────────────
  app.use('/assignments', assignmentRoutes);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ── 404 Handler ─────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
  });

  // ── HTTP Server ─────────────────────────────────────────────────────────
  const httpServer = http.createServer(app);

  // ── Socket.IO ───────────────────────────────────────────────────────────
  initSocketIO(httpServer, FRONTEND_URL);

  // ── BullMQ Worker ───────────────────────────────────────────────────────
  startAssignmentWorker();

  // ── Start ────────────────────────────────────────────────────────────────
  httpServer.listen(PORT, () => {
    logger.info(`🚀 Veda AI Server running on http://localhost:${PORT}`);
    logger.info(`📡 Socket.IO ready`);
    logger.info(`⚙️  BullMQ worker started`);
  });

  // ── Graceful shutdown ────────────────────────────────────────────────────
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received — shutting down gracefully');
    await redis.quit();
    process.exit(0);
  });
}

bootstrap().catch((err) => {
  logger.error('Bootstrap failed:', err);
  process.exit(1);
});
