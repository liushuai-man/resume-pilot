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
} from '../controllers/resume.controllers';
import { authMiddleware } from '../middlewares/auth.middleware';

const router: Router = Router();

router.get('/templates', getTemplates);
router.get('/templates/:id', getTemplateById);
router.get('/', authMiddleware, getUserResumes);
router.get('/:id/export-pdf', authMiddleware, exportResumePdf);
router.get('/:id', authMiddleware, getResumeById);
router.post('/', authMiddleware, createResume);
router.put('/:id', authMiddleware, updateResume);
router.delete('/:id', authMiddleware, deleteResume);

export default router;
