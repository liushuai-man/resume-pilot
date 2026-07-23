import { Router } from 'express';
import { uploadResumeHandler } from '../controllers/upload.controllers';
import { authMiddleware } from '../middlewares/auth.middleware';

const router: Router = Router();

router.post('/resume', authMiddleware, uploadResumeHandler);

export default router;
