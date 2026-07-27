import request from '@/utils/request';
import type { ResumeDocument } from '@/types/resume-document';
import type { ApiResponse } from '@/types';

export interface UpdateDocumentRequest {
  title: string;
  document: ResumeDocument;
}

export async function getResumeDocument(id: string): Promise<ResumeDocument> {
  const res = await request.get<ApiResponse<ResumeDocument>>(`/resumes/${id}`);
  return res.data;
}

export async function updateResumeDocument(
  id: string,
  data: UpdateDocumentRequest
): Promise<ResumeDocument> {
  const res = await request.put<ApiResponse<ResumeDocument>>(
    `/resumes/${id}`,
    data
  );
  return res.data;
}

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

export async function exportDocumentPdf(id: string): Promise<Blob> {
  const res = await request.get<Blob>(`/resumes/${id}/export-pdf`, {
    responseType: 'blob',
  });
  return res;
}
