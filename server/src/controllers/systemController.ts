import { Request, Response } from 'express';
import { getEdgeNodeManager } from '../edge/EdgeNodeManager';

export function getSystemStatus(req: Request, res: Response) {
  const edgeManager = getEdgeNodeManager();
  const status = edgeManager.getSystemStatus();
  res.json({ success: true, data: status });
}

export function getEdgeNodes(req: Request, res: Response) {
  const edgeManager = getEdgeNodeManager();
  const status = edgeManager.getSystemStatus();
  res.json({ success: true, data: status.edge_nodes });
}

export function getCameras(req: Request, res: Response) {
  const edgeManager = getEdgeNodeManager();
  const status = edgeManager.getSystemStatus();
  const cameras = status.edge_nodes.flatMap(n => n.cameras);
  res.json({ success: true, data: cameras });
}

export function simulateNodeFailure(req: Request, res: Response) {
  const { node_id } = req.body;
  if (!node_id) {
    return res.status(400).json({ success: false, error: 'node_id required' });
  }

  const edgeManager = getEdgeNodeManager();
  const success = edgeManager.simulateNodeFailure(node_id);

  if (success) {
    res.json({ success: true, message: `Edge Node ${node_id} set to OFFLINE` });
  } else {
    res.status(404).json({ success: false, error: `Edge Node ${node_id} not found` });
  }
}

export function simulateCameraFailure(req: Request, res: Response) {
  const { camera_id } = req.body;
  if (!camera_id) {
    return res.status(400).json({ success: false, error: 'camera_id required' });
  }

  const edgeManager = getEdgeNodeManager();
  const success = edgeManager.simulateCameraFailure(camera_id);

  if (success) {
    res.json({ success: true, message: `Camera ${camera_id} set to OFFLINE` });
  } else {
    res.status(404).json({ success: false, error: `Camera ${camera_id} not found` });
  }
}

export function restoreAll(req: Request, res: Response) {
  const edgeManager = getEdgeNodeManager();
  edgeManager.restoreAll();
  res.json({ success: true, message: 'All edge nodes and cameras restored' });
}
