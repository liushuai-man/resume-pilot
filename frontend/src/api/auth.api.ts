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
  return request.get('/auth/me', { timeout: 10000 });
};

export interface GuestMigrationMapping {
  entityType: 'resume' | 'job' | 'analysis' | 'interview-result';
  guestEntityId: string;
  cloudEntityId: string;
}

export const migrateGuestWorkspace = async (data: {
  workspaceId: string;
  entities: Array<{ entityType: GuestMigrationMapping['entityType']; entityId: string; payload: unknown }>;
}): Promise<ApiResponse<{ mappings: GuestMigrationMapping[]; migrated: number }>> => {
  return request.post('/auth/guest-migration', data, { timeout: 60_000 });
};
