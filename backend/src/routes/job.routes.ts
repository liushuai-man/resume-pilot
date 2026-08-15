import { Router } from 'express';
import {
  analyzeJob,
  analyzeJobResumeAts,
  analyzeJobResumeMatch,
  confirmJobProfile,
  createJob,
  deleteJob,
  getJob,
  listJobProfiles,
  listJobs,
  getLatestJobResumeMatch,
  updateJobProfile,
  optimizeJobMatchRequirement,
  applyJobMatchOptimization,
} from '../controllers/job.controllers';
import { authMiddleware } from '../middlewares/auth.middleware';

const router: Router = Router();
router.use(authMiddleware);
router.get('/', listJobs);
router.post('/', createJob);
router.get('/:id', getJob);
router.delete('/:id', deleteJob);
router.post('/:id/analyze', analyzeJob);
router.post('/:id/ats', analyzeJobResumeAts);
router.post('/:id/match', analyzeJobResumeMatch);
router.get('/:id/match/latest', getLatestJobResumeMatch);
router.post('/:id/match/optimize', optimizeJobMatchRequirement);
router.post('/:id/match/apply', applyJobMatchOptimization);
router.get('/:id/profiles', listJobProfiles);
router.put('/:id/profiles/:profileId', updateJobProfile);
router.post('/:id/profiles/:profileId/confirm', confirmJobProfile);

export default router;
