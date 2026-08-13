import { Router } from 'express';
import { getProfileOverviewHandler } from '../controllers/profile.controllers';
import { authMiddleware } from '../middlewares/auth.middleware';
const router = Router();
router.get('/overview', authMiddleware, getProfileOverviewHandler);
export default router;
