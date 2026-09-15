import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { prisma } from '../config/db.js';

const router = express.Router();

// Search for unique vehicles (paginated)
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { plate, type, color, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build Prisma where clause
    const where: any = {};
    if (plate) where.plate = { contains: plate as string, mode: 'insensitive' };
    if (type) where.vehicle_type = { equals: type as string, mode: 'insensitive' };
    if (color) where.vehicle_color = { equals: color as string, mode: 'insensitive' };

    // Get the most recent detection for each matching plate to act as the "search result"
    // Since Prisma doesn't support distinct on multiple fields easily with complex sorting,
    // we fetch detections matching criteria, sorted by timestamp desc
    const detections = await prisma.detections.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      include: {
        camera: { select: { name: true, location_name: true } }
      }
    });

    // Deduplicate by plate in memory (simple approach for this dashboard)
    const uniquePlates = new Set<string>();
    const results = [];
    for (const d of detections) {
      if (d.plate && !uniquePlates.has(d.plate)) {
        uniquePlates.add(d.plate);
        results.push(d);
      }
    }

    // Paginate in memory after deduplication
    const paginatedResults = results.slice(skip, skip + limitNum);

    res.json({
      success: true,
      data: paginatedResults,
      total: results.length,
      page: pageNum,
      totalPages: Math.ceil(results.length / limitNum)
    });
  } catch (error) {
    console.error('[VehicleSearch] Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get chronological history (trajectory) for a specific plate
router.get('/:plate/history', authMiddleware, async (req, res) => {
  try {
    const plate = req.params.plate as string;
    if (!plate) return res.status(400).json({ error: 'Plate is required' });

    const history = await prisma.detections.findMany({
      where: { plate: { equals: plate, mode: 'insensitive' } },
      orderBy: { timestamp: 'asc' }, // chronological
      include: {
        camera: { select: { id: true, name: true, latitude: true, longitude: true } },
        edge_node: { select: { id: true, name: true } }
      }
    });

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('[VehicleHistory] Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
