import {
  TemplateVersion,
  VersionsListResponse,
  VersionDiff,
  DuplicateOptions,
  BulkOperationRequest,
  BulkOperationResponse,
  TemplateImportData,
  ImportValidationResult,
  ImportOptions,
  Asset,
  ThumbnailOptions,
} from '@/types/template-sprint5.types';
import { Template } from '@/types/template.types';
import { apiClient } from './client';

export const templatesSprint5API = {
  // ========== VERSIONS ==========
  // Список версий
  getVersions: (templateId: string) =>
    apiClient.get<VersionsListResponse>(
      `/api/v1/templates/${templateId}/versions`
    ),
  
  // Получить конкретную версию
  getVersion: (templateId: string, versionNumber: number) =>
    apiClient.get<TemplateVersion>(
      `/api/v1/templates/${templateId}/versions/${versionNumber}`
    ),
  
  // Сравнить версии
  compareVersions: (
    templateId: string,
    fromVersion: number,
    toVersion: number
  ) =>
    apiClient.get<VersionDiff>(
      `/api/v1/templates/${templateId}/versions/compare`,
      { params: { from: fromVersion, to: toVersion } }
    ),
  
  // Восстановить версию
  restoreVersion: (templateId: string, versionNumber: number) =>
    apiClient.post<Template>(
      `/api/v1/templates/${templateId}/versions/${versionNumber}/restore`
    ),
  
  // ========== DUPLICATE ==========
  duplicate: (templateId: string, options?: DuplicateOptions) =>
    apiClient.post<Template>(
      `/api/v1/templates/${templateId}/duplicate`,
      options
    ),
  
  // ========== PREVIEW/THUMBNAIL ==========
  // Upload thumbnail
  uploadThumbnail: (templateId: string, file: File) => {
    const formData = new FormData();
    formData.append('thumbnail', file);
    
    return apiClient.post(
      `/api/v1/templates/${templateId}/thumbnail`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
  },
  
  // Generate thumbnail (backend генерирует из JSON schema)
  generateThumbnail: (templateId: string) =>
    apiClient.post(`/api/v1/templates/${templateId}/thumbnail/generate`),
  
  // Get preview (high-res)
  getPreview: (templateId: string, version?: number) =>
    apiClient.get<Blob>(
      `/api/v1/templates/${templateId}/preview`,
      {
        params: { version },
        responseType: 'blob',
      }
    ),
  
  // ========== BULK OPERATIONS ==========
  bulkDelete: (templateIds: string[]) =>
    apiClient.post<BulkOperationResponse>(
      '/api/v1/templates/bulk/delete',
      { template_ids: templateIds }
    ),
  
  bulkExport: (templateIds: string[]) =>
    apiClient.post(
      '/api/v1/templates/bulk/export',
      { template_ids: templateIds },
      { responseType: 'blob' }
    ),
  
  bulkDuplicate: (templateIds: string[]) =>
    apiClient.post<BulkOperationResponse>(
      '/api/v1/templates/bulk/duplicate',
      { template_ids: templateIds }
    ),
  
  // ========== IMPORT ==========
  importTemplate: (
    data: TemplateImportData,
    options?: ImportOptions
  ) =>
    apiClient.post<Template>(
      '/api/v1/templates/import',
      data,
      { params: options }
    ),
  
  // Validate import (dry-run)
  validateImport: (data: TemplateImportData) =>
    apiClient.post<ImportValidationResult>(
      '/api/v1/templates/import/validate',
      data
    ),
  
  // ========== ASSETS ==========
  // Upload logo/image
  uploadAsset: (templateId: string, file: File, type: 'logo' | 'image') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    return apiClient.post<Asset>(
      `/api/v1/templates/${templateId}/assets`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
  },
  
  // List assets
  listAssets: (templateId: string) =>
    apiClient.get<Asset[]>(`/api/v1/templates/${templateId}/assets`),
  
  // Delete asset
  deleteAsset: (templateId: string, assetId: string) =>
    apiClient.delete(`/api/v1/templates/${templateId}/assets/${assetId}`),
};

// Error handling for Sprint 5 specific operations
export class Sprint5APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public operation: 'version' | 'duplicate' | 'import' | 'bulk' | 'asset',
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'Sprint5APIError';
  }
}

// Helper function to handle file downloads
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// Helper function to create thumbnail URL from blob
export const createThumbnailUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};