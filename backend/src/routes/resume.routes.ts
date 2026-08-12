import { Router } from 'express';
import {
  createResume,
  updateResume,
  deleteResume,
  getResumeById,
  getUserResumes,
  getTemplates,
  getTemplateById,
  exportResumePdf,
  analyzeResumeContentQuality,
  getLatestResumeContentQuality,
  optimizeResumeContentIssue,
  applyResumeContentOptimization,
  restoreResumeVersion,
  optimizeResumeAtsIssue,
  applyResumeAtsOptimization,
  completeResumeOptimizationAction,
} from '../controllers/resume.controllers';
import { authMiddleware } from '../middlewares/auth.middleware';

const router: Router = Router();

router.get('/templates', getTemplates);
router.get('/templates/:id', getTemplateById);
router.get('/', authMiddleware, getUserResumes);
router.get('/:id/export-pdf', authMiddleware, exportResumePdf);
router.get('/:id/content-quality', authMiddleware, getLatestResumeContentQuality);
router.post('/:id/content-quality', authMiddleware, analyzeResumeContentQuality);
router.post('/:id/content-quality/optimize', authMiddleware, optimizeResumeContentIssue);
router.post('/:id/content-quality/apply', authMiddleware, applyResumeContentOptimization);
router.post('/:id/ats/optimize', authMiddleware, optimizeResumeAtsIssue);
router.post('/:id/ats/apply', authMiddleware, applyResumeAtsOptimization);
router.post('/:id/optimization-actions/:actionId/complete', authMiddleware, completeResumeOptimizationAction);
router.post('/:id/versions/:versionId/restore', authMiddleware, restoreResumeVersion);
router.get('/:id', authMiddleware, getResumeById);
router.post('/', authMiddleware, createResume);
router.put('/:id', authMiddleware, updateResume);
router.delete('/:id', authMiddleware, deleteResume);

export default router;
