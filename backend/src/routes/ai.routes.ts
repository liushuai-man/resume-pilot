import { Router } from 'express';
import { completeText, polishText } from '../controllers/ai.controllers';
import { authMiddleware } from '../middlewares/auth.middleware';

const router: Router = Router();

router.post('/complete', authMiddleware, completeText);
router.post('/polish', authMiddleware, polishText);

export default router;