import type { Request, Response } from 'express';
import { authService } from '../services/auth.services';
import { authConfig } from '../config/auth';
import { env } from '../config/env';
import {
  success,
  unauthorized,
  notFound,
  error,
} from '../utils/response';
import { guestMigrationService, type GuestMigrationEntity } from '../services/guest-migration.service';

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const authController = {
  /**
   * GitHub OAuth 授权入口
   * 前端访问 /api/auth/github，后端重定向到 GitHub 授权页面
   */
  githubAuthRedirect: async (req: Request, res: Response) => {
    const returnTo = typeof req.query.returnTo === 'string' && req.query.returnTo.startsWith('/')
      ? req.query.returnTo
      : '/resumes';
    const state = Buffer.from(JSON.stringify({ returnTo })).toString('base64url');
    const githubAuthUrl =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${authConfig.github.clientId}` +
      `&redirect_uri=${authConfig.github.redirectUri}` +
      `&scope=read:user user:email` +
      `&state=${state}`;

    return res.redirect(githubAuthUrl);
  },
  /**
   * GitHub OAuth 回调处理
   * GitHub 授权后会跳转到此路由，携带 code 参数
   */
  githubAuthCallback: async (req: Request, res: Response) => {
    const { code, error } = req.query;
    // 处理 GitHub 返回的错误
    if (error) {
      return res.redirect(
        `${authConfig.frontendUrl}/auth/login?error=${error}`
      );
    }
    if (!code) {
      return res.redirect(
        `${authConfig.frontendUrl}/auth/login?error=missing_code`
      );
    }

    try {
    
      // 调用 service 处理登录
      const { token } = await authService.githubLogin(code as string);
      const returnTo = parseReturnTo(req.query.state);
      // 设置 cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: env.COOKIE_SECURE,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天
      });
      // 登录成功，重定向回前端首页（带登录成功标记）
      const separator = returnTo.includes('?') ? '&' : '?';
      return res.redirect(`${authConfig.frontendUrl}${returnTo}${separator}login=success`);
    } catch (err) {
      return res.redirect(
        `${authConfig.frontendUrl}/auth/login?error=auth_failed`
      );
    }
  },


  /**
   * 获取当前用户信息
   */
  getCurrentUser: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return unauthorized(res, 'Unauthorized');
      }
      const user = await authService.getUserById(userId);
      if (!user) {
        return notFound(res, 'User not found');
      }
      return success(res, {
        id: user.id,
        github_login: user.github_login,
        github_avatar: user.github_avatar,

      });
    } catch (err) {
      console.error('Get current user failed:', err);
      return error(res, 'Failed to get current user');
    }
  },

  /**
   * 退出登录
   */
  logout: async (_req: Request, res: Response) => {
    try {
      res.clearCookie('token', {
        secure: env.COOKIE_SECURE,
        sameSite: 'lax',
        path: '/',
      });
      return success(res, null);
    } catch (err) {
      console.error('Logout failed:', err);
      return error(res, 'Logout failed');
    }
  },
  migrateGuestWorkspace: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user?.id) return unauthorized(res, 'Unauthorized');
      const entities = Array.isArray(req.body?.entities) ? req.body.entities as GuestMigrationEntity[] : [];
      if (entities.length > 200) return error(res.status(413), '游客数据数量超过单次迁移上限', 413);
      const allowed = new Set(['resume', 'job', 'analysis', 'interview-result']);
      if (entities.some((item) => !item || !allowed.has(item.entityType) || typeof item.entityId !== 'string' || !item.payload)) {
        return error(res.status(400), '游客迁移数据格式无效', 400);
      }
      const mappings = await guestMigrationService.migrate(req.user.id, entities);
      return success(res, { mappings, migrated: mappings.length });
    } catch (err) {
      console.error('Guest migration failed:', err);
      return error(res, '游客数据迁移失败');
    }
  },
};

const parseReturnTo = (state: unknown) => {
  if (typeof state !== 'string') return '/resumes';
  try {
    const parsed = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
    return typeof parsed.returnTo === 'string' && parsed.returnTo.startsWith('/')
      ? parsed.returnTo
      : '/resumes';
  } catch {
    return '/resumes';
  }
};
