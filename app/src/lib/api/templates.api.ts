import {
  Template,
  CreateTemplateDto,
  UpdateTemplateDto,
  TemplateListParams,
  PaginatedResponse
} from '@/types/template.types';
import { apiClient } from './client';

export const templatesAPI = {
  list: (params: TemplateListParams) => 
    apiClient.get<PaginatedResponse<Template>>('/templates', { params }),
  
  getById: (id: string) => 
    apiClient.get<Template>(`/templates/${id}`),
  
  create: (data: CreateTemplateDto) => 
    apiClient.post<Template>('/templates', data),
  
  update: (id: string, data: UpdateTemplateDto) => 
    apiClient.put<Template>(`/templates/${id}`, data),
  
  patch: (id: string, data: Partial<UpdateTemplateDto>) => 
    apiClient.patch<Template>(`/templates/${id}`, data),
  
  delete: (id: string) => 
    apiClient.delete(`/templates/${id}`),
  
  restore: (id: string) => 
    apiClient.post(`/templates/${id}/restore`),
  
  duplicate: (id: string) => 
    apiClient.post<Template>(`/templates/${id}/duplicate`),
  
  getVersions: (id: string) => 
    apiClient.get<TemplateVersion[]>(`/templates/${id}/versions`),
};

export interface TemplateVersion {
  id: string;
  version: number;
  created_at: string;
  created_by: string;
  changes: string;
}