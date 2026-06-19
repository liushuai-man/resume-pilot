import request from '@/utils/request';
import type {
  ApiResponse,
  GithubUser,
  GithubLoginRequest,
} from '@/types/index';

export const githubLogin = async (
  code: GithubLoginRequest
): Promise<ApiResponse<GithubUser>> => {
  return request.post('/auth/github', { code });
};

export const logout = async (): Promise<ApiResponse<null>> => {
  return request.post('/auth/logout');
};

export const getCurrentUser = async (): Promise<ApiResponse<GithubUser>> => {
  return request.get('/auth/me');
};
