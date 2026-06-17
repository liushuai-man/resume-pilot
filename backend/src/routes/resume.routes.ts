import { Router } from 'express';
import {
  createResume,
  updateResume,
  deleteResume,
  getResumeById,
  getUserResumes,
  getTemplates,
} from '../controllers/resume.controllers';
import { authMiddleware } from '../middlewares/auth.middleware';

const router: Router = Router();

router.get('/templates', getTemplates);
router.get('/', authMiddleware, getUserResumes);
router.get('/:id', authMiddleware, getResumeById);
router.post('/', authMiddleware, createResume);
router.put('/:id', authMiddleware, updateResume);
router.delete('/:id', authMiddleware, deleteResume);

export default router;
