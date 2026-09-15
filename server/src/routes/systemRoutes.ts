import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  getSystemStatus,
  getEdgeNodes,
  getCameras,
  simulateNodeFailure,
  simulateCameraFailure,
  restoreAll
} from '../controllers/systemController';

const router = express.Router();

router.get('/status', authMiddleware, getSystemStatus);
router.get('/edge-nodes', authMiddleware, getEdgeNodes);
router.get('/cameras', authMiddleware, getCameras);
router.post('/simulate-node-failure', authMiddleware, simulateNodeFailure);
router.post('/simulate-camera-failure', authMiddleware, simulateCameraFailure);
router.post('/restore', authMiddleware, restoreAll);

export default router;
