import { Router, Request, Response } from 'express';
import { logger } from '../logger/index.js';

const router = Router();

// GET /api/logs - retrieve structured application and AI workflow logs
router.get('/', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 100;
  const context = req.query.context as string | undefined;

  const logs = logger.getRecentLogs(limit, context);
  res.json({
    success: true,
    count: logs.length,
    data: logs
  });
});

// DELETE /api/logs - clear log buffer
router.delete('/', (_req: Request, res: Response) => {
  logger.clearLogs();
  res.json({ success: true, message: 'Logs cleared' });
});

export default router;
