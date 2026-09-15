import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { submitQuery, getQueryStatus, getRecentQueries } from '../controllers/queryController';

const router = express.Router();

router.post('/', authMiddleware, submitQuery);
router.get('/', authMiddleware, getRecentQueries);
router.get('/:id', authMiddleware, getQueryStatus);

export default router;
