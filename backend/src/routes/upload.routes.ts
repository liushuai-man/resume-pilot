import { Router } from 'express';
import { uploadResumeHandler, getResumePreviewHandler, getResumeFileHandler } from '../controllers/upload.controllers';
import { authMiddleware } from '../middlewares/auth.middleware';

const router: Router = Router();

router.post('/resume', authMiddleware, uploadResumeHandler);
router.get('/resume/:id/preview', authMiddleware, getResumePreviewHandler);
router.get('/resume/:id/file', authMiddleware, getResumeFileHandler);

export default router;
