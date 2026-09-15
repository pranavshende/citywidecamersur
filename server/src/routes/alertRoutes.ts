import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { prisma } from '../config/db';

const router = express.Router();

router.get('/recent', authMiddleware, async (req, res) => {
  try {
    const alerts = await prisma.alerts.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        camera: { select: { location_name: true } }
      }
    });

    res.json(alerts);
  } catch (error) {
    console.error('Alerts Error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = '1', limit = '20', severity, status } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const where: any = {};
    if (severity) where.severity = severity as string;
    if (status) where.status = status as string;

    const [alerts, total] = await Promise.all([
      prisma.alerts.findMany({
        where,
        take: limitNum,
        skip: (pageNum - 1) * limitNum,
        orderBy: { created_at: 'desc' },
        include: {
          camera: { select: { location_name: true, name: true } },
          edge_node: { select: { name: true } }
        }
      }),
      prisma.alerts.count({ where })
    ]);

    res.json({
      success: true,
      data: alerts,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('[AlertList] Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
