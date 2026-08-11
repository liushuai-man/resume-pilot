import request from '@/utils/request';
import type { ApiResponse } from '@/types';
import type {
  AtsAnalysisResult,
  JobMatchAnalysis,
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
  analyzeAts: (id: string, resumeId: string): Promise<ApiResponse<AtsAnalysisResult>> =>
    request.post(`/jobs/${id}/ats`, { resumeId }),
  analyzeMatch: (id: string, resumeId: string): Promise<ApiResponse<JobMatchAnalysis>> =>
    request.post(`/jobs/${id}/match`, { resumeId }),
  getLatestMatch: (id: string, resumeId: string): Promise<ApiResponse<JobMatchAnalysis | null>> =>
    request.get(`/jobs/${id}/match/latest`, { params: { resumeId } }),
  listProfiles: (id: string): Promise<ApiResponse<JobProfile[]>> =>
    request.get(`/jobs/${id}/profiles`),
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
