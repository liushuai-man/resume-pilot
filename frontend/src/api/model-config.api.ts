import request from '@/utils/request';
import { ApiResponse } from '@/types';

const MODEL_SAVE_TIMEOUT_MS = 20000;

export interface ModelPreset {
  provider: string;
  baseUrl: string;
  defaultModel: string;
}

export interface ModelConfig {
  id: string;
  provider: string;
  modelName: string;
  displayName: string;
  baseUrl?: string | null;
  isDefault: boolean;
  purpose: 'chat' | 'embedding';
  createdAt: string;
  updatedAt: string;
}

export interface CreateModelConfigRequest {
  provider: string;
  modelName: string;
  apiKey: string;
  baseUrl?: string;
  displayName: string;
  isDefault?: boolean;
  purpose?: 'chat' | 'embedding';
}

export interface UpdateModelConfigRequest {
  provider?: string;
  modelName?: string;
  apiKey?: string;
  baseUrl?: string;
  displayName?: string;
  isDefault?: boolean;
  purpose?: 'chat' | 'embedding';
}

export const modelConfigApi = {
  getPresets: async (): Promise<ApiResponse<ModelPreset[]>> => {
    return await request.get('/model-config/presets');
  },

  list: async (): Promise<ApiResponse<ModelConfig[]>> => {
    return await request.get('/model-config');
  },

  get: async (id: string): Promise<ApiResponse<ModelConfig>> => {
    return await request.get(`/model-config/${id}`);
  },

  create: async (
    data: CreateModelConfigRequest
  ): Promise<ApiResponse<ModelConfig>> => {
    return await request.post('/model-config', data, {
      timeout: MODEL_SAVE_TIMEOUT_MS,
    });
  },

  update: async (
    id: string,
    data: UpdateModelConfigRequest
  ): Promise<ApiResponse<ModelConfig>> => {
    return await request.put(`/model-config/${id}`, data, {
      timeout: MODEL_SAVE_TIMEOUT_MS,
    });
  },

  setDefault: async (id: string): Promise<ApiResponse<ModelConfig>> => {
    return await request.patch(`/model-config/${id}/default`);
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return await request.delete(`/model-config/${id}`);
  },
};

export default modelConfigApi;
