import { Router, Request, Response } from 'express';
import { queryExample } from '../db/prisma';
import { getLogger } from '../logger/logger';

const router = Router();
const log = getLogger('routes');

// GET /api/health
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// GET /api/data?from=2024-01-01&to=2024-01-02
router.get('/data', async (req: Request, res: Response) => {
  const { from, to } = req.query;

  if (!from || !to) {
    res.status(400).json({ error: 'Query params "from" and "to" are required.' });
    return;
  }

  const dateInit = new Date(from as string);
  const dateEnd  = new Date(to as string);

  if (Number.isNaN(dateInit.getTime()) || Number.isNaN(dateEnd.getTime())) {
    res.status(400).json({ error: 'Invalid date format. Use ISO 8601 (e.g. 2024-01-01T00:00:00Z).' });
    return;
  }

  try {
    const data = await queryExample(dateInit, dateEnd);
    res.json({ count: data.length, data });
  } catch (err: any) {
    log.error(`GET /data failed: ${err.message}`);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;