import request from '@/utils/request';
import type { Resume, Template } from '@/types/resume';
import { ApiResponse } from '@/types';
import type { AppliedResumeOptimization, AtsOptimizationResult, ContentQualityAnalysis, ResumeOptimizationResult } from '@/types/content-quality';
import type { AtsAnalysisResult } from '@/types/job';

export const resumeApi = {
  getTemplates: async (): Promise<ApiResponse<Template[]>> => {
    return await request.get('/resume/templates');
  },

  getTemplateById: async (id: string): Promise<ApiResponse<Template>> => {
    return await request.get(`/resume/templates/${id}`);
  },

  getUserResumes: async (params?: {
    excludeUploaded?: boolean;
  }): Promise<ApiResponse<Resume[]>> => {
    return await request.get('/resume', { params });
  },

  getResumeById: async (id: string): Promise<ApiResponse<Resume>> => {
    return await request.get(`/resume/${id}`);
  },

  createResume: async (data: {
    template_id: string;
    title: string;
    content: Resume['content'];
  }): Promise<ApiResponse<Resume>> => {
    return await request.post('/resume', data);
  },

  updateResume: async (
    id: string,
    data: { title?: string; content?: Resume['content'] }
  ): Promise<ApiResponse<Resume>> => {
    return await request.put(`/resume/${id}`, data);
  },

  deleteResume: async (id: string): Promise<ApiResponse<void>> => {
    return await request.delete(`/resume/${id}`);
  },

  exportResumePdf: async (id: string): Promise<Blob> => {
    return await request.get(`/resume/${id}/export-pdf`, {
      responseType: 'blob',
    });
  },

  analyzeContentQuality: async (id: string): Promise<ApiResponse<ContentQualityAnalysis>> => {
    return await request.post(`/resume/${id}/content-quality`);
  },

  getLatestContentQuality: async (id: string): Promise<ApiResponse<ContentQualityAnalysis | null>> => {
    return await request.get(`/resume/${id}/content-quality`);
  },

  optimizeContentIssue: async (id: string, data: { analysisId: string; issueIndex: number; userFacts?: string }): Promise<ApiResponse<ResumeOptimizationResult>> => {
    return await request.post(`/resume/${id}/content-quality/optimize`, data);
  },

  applyContentOptimization: async (id: string, data: { analysisId: string; issueIndex: number; suggestedText: string }): Promise<ApiResponse<AppliedResumeOptimization>> => {
    return await request.post(`/resume/${id}/content-quality/apply`, data);
  },

  restoreVersion: async (id: string, versionId: string): Promise<ApiResponse<Resume>> => {
    return await request.post(`/resume/${id}/versions/${versionId}/restore`);
  },
  optimizeAtsIssue: async (id: string, data: { issueId: string; userFacts?: string }): Promise<ApiResponse<AtsOptimizationResult>> => request.post(`/resume/${id}/ats/optimize`, data),
  applyAtsOptimization: async (id: string, data: { issueId: string; suggestedText: string }): Promise<ApiResponse<AppliedResumeOptimization & { previousScore: number; ats: AtsAnalysisResult }>> => request.post(`/resume/${id}/ats/apply`, data),
};

export default resumeApi;
