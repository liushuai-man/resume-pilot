import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  startInterviewHandler,
  submitAnswerHandler,
  finishInterviewHandler,
  getInterviewResultsHandler,
  getInterviewResultHandler,
  deleteInterviewResultHandler,
  getNextQuestionHandler,
  retryInterviewReportHandler,
} from '../controllers/interview.controllers';
import { authMiddleware } from '../middlewares/auth.middleware';

const router: Router = Router();

const interviewRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 80,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req as any).user?.id || 'anonymous',
  message: {
    code: 429,
    message: '面试请求过于频繁，请稍后再试',
    data: null,
  },
});

router.post(
  '/start',
  authMiddleware,
  interviewRateLimit,
  startInterviewHandler
);
router.post(
  '/answer',
  authMiddleware,
  interviewRateLimit,
  submitAnswerHandler
);
router.post(
  '/next-question',
  authMiddleware,
  interviewRateLimit,
  getNextQuestionHandler
);
router.post(
  '/finish',
  authMiddleware,
  interviewRateLimit,
  finishInterviewHandler
);
router.get('/results', authMiddleware, getInterviewResultsHandler);
router.get('/results/:id', authMiddleware, getInterviewResultHandler);
router.post('/results/:id/retry', authMiddleware, interviewRateLimit, retryInterviewReportHandler);
router.delete('/results/:id', authMiddleware, deleteInterviewResultHandler);

export default router;
