import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { getCoordinatorService } from '../services/coordinatorService';

export async function submitQuery(req: Request, res: Response) {
  try {
    const { plate, vehicle_color, vehicle_type } = req.body;

    if (!plate && !vehicle_color && !vehicle_type) {
      return res.status(400).json({ error: 'At least one search parameter is required' });
    }

    const coordinator = getCoordinatorService();
    
    // For demo purposes, we do not await the full query processing here so we can return early 
    // and let the client connect via WebSocket to see the steps.
    coordinator.processQuery({ plate, vehicle_color, vehicle_type }).catch(err => {
      console.error('[QueryController] Async query error:', err);
    });

    res.json({ success: true, message: 'Query initiated. Connect via WebSocket for real-time progress.' });

  } catch (error: any) {
    console.error('Error submitting query:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getQueryStatus(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    
    const query = await prisma.queries.findUnique({ where: { id } });
    if (!query) {
      return res.status(404).json({ error: 'Query not found' });
    }

    const detections = await prisma.detections.findMany({
      where: { query_id: id },
      orderBy: { timestamp: 'asc' }
    });

    const trajectories = await prisma.trajectories.findMany({
      where: { query_id: id }
    });

    res.json({
      query,
      detections,
      trajectory: trajectories.length > 0 ? trajectories[0] : null
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getRecentQueries(req: Request, res: Response) {
  try {
    const queries = await prisma.queries.findMany({
      orderBy: { created_at: 'desc' },
      take: 20
    });
    res.json(queries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
