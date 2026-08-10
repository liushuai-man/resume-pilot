import request from '@/utils/request';
import type { ApiResponse } from '@/types';
import type {
  EditableJobProfile,
  JobDescription,
  JobProfile,
} from '@/types/job';

export const jobApi = {
  list: (): Promise<ApiResponse<JobDescription[]>> => request.get('/jobs'),
  create: (data: {
    title?: string;
    company?: string;
    rawText: string;
    sourceUrl?: string;
  }): Promise<ApiResponse<JobDescription>> => request.post('/jobs', data),
  get: (id: string): Promise<ApiResponse<JobDescription>> =>
    request.get(`/jobs/${id}`),
  analyze: (id: string): Promise<ApiResponse<JobProfile>> =>
    request.post(`/jobs/${id}/analyze`),
  updateProfile: (
    jobId: string,
    profileId: string,
    data: EditableJobProfile
  ): Promise<ApiResponse<JobProfile>> =>
    request.put(`/jobs/${jobId}/profiles/${profileId}`, data),
  confirmProfile: (
    jobId: string,
    profileId: string
  ): Promise<ApiResponse<JobProfile>> =>
    request.post(`/jobs/${jobId}/profiles/${profileId}/confirm`),
  remove: (id: string): Promise<ApiResponse<null>> =>
    request.delete(`/jobs/${id}`),
};
