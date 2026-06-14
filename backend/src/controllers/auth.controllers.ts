import type { Request, Response } from 'express';
import { authService } from '../services/auth.services';
import { authConfig } from '../config/auth';
import {
  success,
  unauthorized,
  notFound,
  error,
} from '../utils/response';

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
  githubAuthRedirect: async (_req: Request, res: Response) => {
    const githubAuthUrl =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${authConfig.github.clientId}` +
      `&redirect_uri=${authConfig.github.redirectUri}` +
      `&scope=read:user user:email`;

    return res.redirect(githubAuthUrl);
  },
  /**
   * GitHub OAuth 回调处理
   * GitHub 授权后会跳转到此路由，携带 code 参数
   */
  githubAuthCallback: async (req: Request, res: Response) => {
    const { code, error, error_description } = req.query;
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
      // 设置 cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天
      });
      // 登录成功，重定向回前端首页
      return res.redirect(authConfig.frontendUrl);
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
      res.clearCookie('token');
      return success(res, null);
    } catch (err) {
      console.error('Logout failed:', err);
      return error(res, 'Logout failed');
    }
  },
};
