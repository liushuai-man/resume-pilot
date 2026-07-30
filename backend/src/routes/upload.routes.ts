import { Router } from 'express';
import { uploadResumeHandler, getResumePreviewHandler } from '../controllers/upload.controllers';
import { authMiddleware } from '../middlewares/auth.middleware';

const router: Router = Router();

router.post('/resume', authMiddleware, uploadResumeHandler);
router.get('/resume/:id/preview', authMiddleware, getResumePreviewHandler);

export default router;
