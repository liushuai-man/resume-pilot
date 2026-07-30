import request from '@/utils/request';
import type { ApiResponse } from '@/types';

export async function polishSection(params: {
  resumeId: string;
  sectionType: string;
  sectionTitle: string;
  content: string;
  targetField?: string;
  tone?: string;
}): Promise<{ result: string }> {
  const res = await request.post<ApiResponse<{ result: string }>>(
    '/ai/resume/polish-section',
    params
  );
  return res.data;
}

export async function completeSection(params: {
  resumeId: string;
  sectionType: string;
  sectionTitle: string;
  existingContent: string;
  context?: string;
}): Promise<{ result: string }> {
  const res = await request.post<ApiResponse<{ result: string }>>(
    '/ai/resume/complete-section',
    params
  );
  return res.data;
}

