import request from '@/utils/request';

export interface UploadResumeResponse {
  resume: any;
  ocrText: string;
  fileInfo: {
    name: string;
    type: 'pdf' | 'image' | 'text';
    pageCount?: number;
  };
}

export const uploadApi = {
  uploadResume: async (file: File): Promise<UploadResumeResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response: any = await request.post('/upload/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data || response;
  },
};
