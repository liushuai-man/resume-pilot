import request from '@/utils/request';
import type { Resume, Template } from '@/types/resume';
import { ApiResponse } from '@/types';

export const resumeApi = {
  getTemplates: async (): Promise<ApiResponse<Template[]>> => {
    return await request.get('/resume/templates');
  },

  getUserResumes: async (): Promise<ApiResponse<Resume[]>> => {
    return await request.get('/resume');
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
  
  
};



export default resumeApi;
