import { Router } from 'express';
import {
  analyzeJob,
  confirmJobProfile,
  createJob,
  deleteJob,
  getJob,
  listJobs,
  updateJobProfile,
} from '../controllers/job.controllers';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
router.use(authMiddleware);
router.get('/', listJobs);
router.post('/', createJob);
router.get('/:id', getJob);
router.delete('/:id', deleteJob);
router.post('/:id/analyze', analyzeJob);
router.put('/:id/profiles/:profileId', updateJobProfile);
router.post('/:id/profiles/:profileId/confirm', confirmJobProfile);

export default router;
