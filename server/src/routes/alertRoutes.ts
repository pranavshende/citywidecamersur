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

export default router;
