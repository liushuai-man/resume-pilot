import express, { Router } from 'express';
import { authController } from '../controllers/auth.controllers';
import { authMiddleware } from '../middlewares/auth.middleware';

const router: Router = express.Router();

// GitHub OAuth 授权入口（GET 请求，重定向到 GitHub）
router.get('/github', authController.githubAuthRedirect);

// GitHub OAuth 回调处理（GET 请求，由 GitHub 调用）
router.get('/github/callback', authController.githubAuthCallback);

// 获取当前用户（需要登录）
router.get('/me', authMiddleware, authController.getCurrentUser);
router.post('/guest-migration', authMiddleware, authController.migrateGuestWorkspace);

// 退出登录
router.post('/logout', authController.logout);

export default router;
