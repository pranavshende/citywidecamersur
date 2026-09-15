import express from 'express';
import { login, getMe } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/login', login);
router.get('/me', authMiddleware, getMe);

export default router;
