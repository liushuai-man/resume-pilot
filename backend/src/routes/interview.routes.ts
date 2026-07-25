import { Router } from 'express';
import {
  startInterviewHandler,
  submitAnswerHandler,
  finishInterviewHandler,
  getInterviewResultsHandler,
  getInterviewResultHandler,
  deleteInterviewResultHandler,
} from '../controllers/interview.controllers';
import { authMiddleware } from '../middlewares/auth.middleware';

const router: Router = Router();

router.post('/start', authMiddleware, startInterviewHandler);
router.post('/answer', authMiddleware, submitAnswerHandler);
router.post('/finish', authMiddleware, finishInterviewHandler);
router.get('/results', authMiddleware, getInterviewResultsHandler);
router.get('/results/:id', authMiddleware, getInterviewResultHandler);
router.delete('/results/:id', authMiddleware, deleteInterviewResultHandler);

export default router;
