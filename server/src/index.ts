import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getDb, saveDbToDisk } from './db/index.js';
import { logger } from './logger/index.js';

import listingsRouter from './routes/listings.js';
import reviewsRouter from './routes/reviews.js';
import batchRouter from './routes/batch.js';
import policiesRouter from './routes/policies.js';
import logsRouter from './routes/logs.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request logging middleware
app.use((req, _res, next) => {
  if (!req.path.startsWith('/api/logs')) {
    logger.debug('HTTP', `${req.method} ${req.path}`);
  }
  next();
});

// API Routes
app.use('/api/listings', listingsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/batch', batchRouter);
app.use('/api/policies', policiesRouter);
app.use('/api/logs', logsRouter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'marketplace-listing-quality-reviewer',
    version: '1.0.0'
  });
});

// Serve frontend in production
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Start Server
async function start() {
  try {
    await getDb();
    const server = app.listen(PORT, () => {
      logger.info('SERVER', `🚀 Marketplace Listing Quality Reviewer Server running at http://localhost:${PORT}`);
    });

    // Handle shutdown
    const shutdown = () => {
      logger.info('SERVER', 'Gracefully shutting down server...');
      saveDbToDisk();
      server.close(() => {
        logger.info('SERVER', 'Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err: any) {
    logger.error('SERVER_BOOT', 'Failed to initialize server', { error: err.message });
    process.exit(1);
  }
}

start();
