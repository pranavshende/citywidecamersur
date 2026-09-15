import { Request, Response } from 'express';
import { getDemoService } from '../services/demoService';

export async function startDemo(req: Request, res: Response) {
  try {
    const demoService = getDemoService();

    if (demoService.isRunning()) {
      return res.status(409).json({ success: false, error: 'Demo is already running' });
    }

    // Start demo asynchronously (it takes ~2 minutes)
    demoService.startDemo().catch((err: any) => {
      console.error('[Demo] Async error:', err);
    });

    res.json({ success: true, message: 'Demo started' });
  } catch (err: any) {
    console.error('[Demo] Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export function resetDemo(req: Request, res: Response) {
  const demoService = getDemoService();
  demoService.reset();
  res.json({ success: true, message: 'Demo reset' });
}
