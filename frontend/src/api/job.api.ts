import request from '@/utils/request';
import type { ApiResponse } from '@/types';
import type {
  AtsAnalysisResult,
  JobMatchAnalysis,
  EditableJobProfile,
  JobDescription,
  JobProfile,
  JobMatchOptimizationResult,
} from '@/types/job';
import type { AppliedResumeOptimization } from '@/types/content-quality';

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
  optimizeMatchRequirement: (id: string, data: { analysisId: string; requirementIndex: number; userFacts?: string }): Promise<ApiResponse<JobMatchOptimizationResult>> =>
    request.post(`/jobs/${id}/match/optimize`, data),
  applyMatchOptimization: (id: string, data: { analysisId: string; requirementIndex: number; suggestedText: string }): Promise<ApiResponse<AppliedResumeOptimization>> =>
    request.post(`/jobs/${id}/match/apply`, data),
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
