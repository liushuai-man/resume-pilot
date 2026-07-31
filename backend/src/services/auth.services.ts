import axios from 'axios';
import jwt from 'jsonwebtoken';
import { prisma } from '../database/prisma';
import { authConfig } from '../config/auth';
import { GithubUser, User } from '../types/auth';

const GITHUB_REQUEST_TIMEOUT_MS = 12_000;

// 创建一个忽略 SSL 验证的 https Agent（用于开发环境）
export const authService = {
  async githubLogin(code: string): Promise<{ user: User; token: string }> {;
    // 1. 用 code 换取 access_token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: authConfig.github.clientId,
        client_secret: authConfig.github.clientSecret,
        code,
      },
      {
        headers: {
          Accept: 'application/json',
        },
        timeout: GITHUB_REQUEST_TIMEOUT_MS,
      }
    );
    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      throw new Error('Failed to get access token');
    }
    // 2. 用 access_token 获取 GitHub 用户信息
    const userResponse = await axios.get<GithubUser>(
      'https://api.github.com/user',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: GITHUB_REQUEST_TIMEOUT_MS,
      }
    );
    const githubUser = userResponse.data;
    let user = await prisma.user.findUnique({
      where: {
        github_id: String(githubUser.id),
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          github_id: String(githubUser.id),
          github_login: githubUser.login,
          github_avatar: githubUser.avatar_url,
        },
      });
    } else {
      user = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          github_login: githubUser.login,
          github_avatar: githubUser.avatar_url,
        },
      });
    }
    const jwtSecret = authConfig.jwt.secret;
    if (!jwtSecret) {
      throw new Error('JWT secret is not configured');
    }

    const token = jwt.sign(
      {
        userId: user.id,
      },
      jwtSecret,
      {
        expiresIn: authConfig.jwt.expiresIn,
      }
    );
    return {
      user: {
        id: user.id,
        github_id: user.github_id,
        github_login: user.github_login,
        github_avatar: user.github_avatar || '',
      },
      token,
    };
  },

  async getUserById(userId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      github_id: user.github_id,
      github_login: user.github_login,
      github_avatar: user.github_avatar || '',
    };
  },
};
