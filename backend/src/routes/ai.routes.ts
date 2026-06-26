import { Router } from 'express';
import { completeText, polishText, chat, testAIConnection } from '../controllers/ai.controllers';
import { authMiddleware } from '../middlewares/auth.middleware';

const router: Router = Router();

router.get('/test', testAIConnection);
router.post('/complete', authMiddleware, completeText);
router.post('/polish', authMiddleware, polishText);
router.post('/chat', authMiddleware, chat);

export default router;
