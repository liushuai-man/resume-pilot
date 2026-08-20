import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  completeText,
  polishText,
  chat,
  chatStream,
  getChatSummary,
  clearChatSession,
  polishSection,
  completeSection,
} from '../controllers/ai.controllers';
import { authMiddleware } from '../middlewares/auth.middleware';

const router: Router = Router();

const aiUserRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req as any).user?.id || 'anonymous',
  message: {
    code: 429,
    message: 'AI 请求过于频繁，请稍后再试',
    data: null,
  },
});

router.post('/complete', authMiddleware, aiUserRateLimit, completeText);
router.post('/polish', authMiddleware, aiUserRateLimit, polishText);
router.post(
  '/resume/polish-section',
  authMiddleware,
  aiUserRateLimit,
  polishSection
);
router.post(
  '/resume/complete-section',
  authMiddleware,
  aiUserRateLimit,
  completeSection
);
router.post('/chat', authMiddleware, aiUserRateLimit, chat);
router.post('/chat/stream', authMiddleware, aiUserRateLimit, chatStream);
router.get('/chat/summary/:sessionId', authMiddleware, getChatSummary);
router.delete('/chat/session/:sessionId', authMiddleware, clearChatSession);

export default router;
