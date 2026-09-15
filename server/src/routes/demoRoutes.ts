import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { startDemo, resetDemo } from '../controllers/demoController';

const router = express.Router();

router.post('/start', authMiddleware, startDemo);
router.post('/reset', authMiddleware, resetDemo);

export default router;
