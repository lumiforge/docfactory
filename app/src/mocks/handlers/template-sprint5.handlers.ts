import { http, HttpResponse } from 'msw';
import {
  TemplateVersion,
  VersionDiff,
  BulkOperationResponse,
  TemplateImportData,
  ImportValidationResult,
  Asset,
  ThumbnailOptions,
  DuplicateOptions
} from '@/types/template-sprint5.types';
import { DocumentType, PageSize, Orientation } from '@/types/template.types';

// Mock data generators
const generateTemplateVersion = (
  templateId: string, 
  versionNumber: number, 
  isCurrent: boolean = false
): TemplateVersion => ({
  id: `version-${templateId}-${versionNumber}`,
  template_id: templateId,
  version_number: versionNumber,
  name: `Шаблон гарантийного талона v${versionNumber}`,
  description: versionNumber === 1 
    ? 'Исходная версия шаблона' 
    : `Версия ${versionNumber} с обновлениями`,
  document_type: DocumentType.WARRANTY,
  page_size: PageSize.A4,
  orientation: Orientation.PORTRAIT,
  json_schema_url: `https://storage.example.com/templates/${templateId}/v${versionNumber}.json`,
  created_at: new Date(Date.now() - (versionNumber * 24 * 60 * 60 * 1000)).toISOString(),
  created_by: 'user-123',
  change_summary: versionNumber === 1 
    ? 'Создание шаблона' 
    : `Обновление элементов и стилей`,
  is_current: isCurrent,
  diff_stats: versionNumber > 1 ? {
    elements_added: Math.floor(Math.random() * 5) + 1,
    elements_removed: Math.floor(Math.random() * 3),
    elements_modified: Math.floor(Math.random() * 8) + 2,
  } : undefined,
});

const generateVersionDiff = (fromVersion: number, toVersion: number): VersionDiff => ({
  from_version: fromVersion,
  to_version: toVersion,
  summary: {
    elements_added: Math.floor(Math.random() * 5) + 1,
    elements_removed: Math.floor(Math.random() * 3),
    elements_modified: Math.floor(Math.random() * 8) + 2,
    properties_changed: ['name', 'elements[0].position.x', 'elements[1].style.color'],
  },
  changes: [
    {
      type: 'added',
      path: 'elements[2]',
      description: 'Добавлен новый текстовый элемент "Гарантийный период"',
      new_value: { type: 'text', content: 'Гарантийный период' },
    },
    {
      type: 'modified',
      path: 'elements[0].position.x',
      description: 'Изменена позиция элемента "Заголовок"',
      old_value: 100,
      new_value: 120,
    },
    {
      type: 'removed',
      path: 'elements[3]',
      description: 'Удален элемент "Старый QR-код"',
      old_value: { type: 'qr_code', data: 'old-qr-data' },
    },
  ],
});

const generateAsset = (templateId: string, type: 'logo' | 'image'): Asset => ({
  id: `asset-${templateId}-${type}-${Math.random().toString(36).substr(2, 9)}`,
  template_id: templateId,
  type,
  filename: type === 'logo' ? 'company-logo.png' : 'product-image.jpg',
  url: `https://storage.example.com/assets/${templateId}/${type}-${Date.now()}.webp`,
  storage_url: `s3://docfactory-assets/${templateId}/${type}-${Date.now()}.webp`,
  size: type === 'logo' ? 15000 : 250000, // 15KB for logo, 250KB for image
  mime_type: 'image/webp',
  created_at: new Date().toISOString(),
});

// MSW Handlers for Sprint 5 features
export const templateSprint5Handlers = [
  // Version History endpoints
  http.get('/api/v1/templates/:templateId/versions', ({ params }) => {
    const { templateId } = params;
    const versions = Array.from({ length: 5 }, (_, i) => 
      generateTemplateVersion(templateId as string, i + 1, i === 4)
    );
    
    return HttpResponse.json({
      data: versions.reverse(), // Latest first
      current_version: 5,
      total_versions: 5,
    });
  }),

  http.get('/api/v1/templates/:templateId/versions/:versionNumber', ({ params }) => {
    const { templateId, versionNumber } = params;
    const version = generateTemplateVersion(
      templateId as string, 
      parseInt(versionNumber as string)
    );
    
    return HttpResponse.json(version);
  }),

  http.get('/api/v1/templates/:templateId/versions/compare', ({ request }) => {
    const url = new URL(request.url);
    const fromVersion = parseInt(url.searchParams.get('from') || '1');
    const toVersion = parseInt(url.searchParams.get('to') || '2');
    
    const diff = generateVersionDiff(fromVersion, toVersion);
    
    return HttpResponse.json(diff);
  }),

  http.post('/api/v1/templates/:templateId/versions/:versionNumber/restore', ({ params }) => {
    const { templateId, versionNumber } = params;
    
    // Simulate API delay
    return HttpResponse.json(
      { 
        message: `Version ${versionNumber} restored successfully`,
        newVersionNumber: parseInt(versionNumber as string) + 1
      },
      { status: 200 }
    );
  }),

  // Enhanced Duplicate endpoints
  http.post('/api/v1/templates/:templateId/duplicate', async ({ request, params }) => {
    const { templateId } = params;
    const options = await request.json() as DuplicateOptions;
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const duplicatedTemplate = {
      id: `template-duplicate-${Date.now()}`,
      name: options.name || `Шаблон (копия)`,
      description: options.description || 'Копия шаблона',
      document_type: DocumentType.WARRANTY,
      page_size: PageSize.A4,
      orientation: Orientation.PORTRAIT,
      version: options.include_versions ? 5 : 1,
      created_at: new Date().toISOString(),
      created_by: 'user-123',
      thumbnail_url: `https://storage.example.com/thumbnails/template-duplicate-${Date.now()}.jpg`,
    };
    
    return HttpResponse.json(duplicatedTemplate);
  }),

  // Thumbnail generation endpoints
  http.post('/api/v1/templates/:templateId/thumbnail', async ({ request, params }) => {
    const { templateId } = params;
    const formData = await request.formData();
    const thumbnail = formData.get('thumbnail') as File;
    
    // Simulate upload and processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return HttpResponse.json({
      thumbnail_url: `https://storage.example.com/thumbnails/${templateId}/${Date.now()}.jpg`,
      size: thumbnail.size,
      format: 'image/jpeg',
    });
  }),

  http.post('/api/v1/templates/:templateId/thumbnail/generate', async ({ params }) => {
    const { templateId } = params;
    
    // Simulate thumbnail generation from JSON schema
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return HttpResponse.json({
      thumbnail_url: `https://storage.example.com/thumbnails/${templateId}/generated-${Date.now()}.jpg`,
      generated_at: new Date().toISOString(),
    });
  }),

  http.get('/api/v1/templates/:templateId/preview', async ({ request, params }) => {
    const { templateId } = params;
    const url = new URL(request.url);
    const version = url.searchParams.get('version');
    
    // Simulate high-res preview generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return a blob (in real implementation)
    return new HttpResponse(
      new Blob(['mock-preview-data'], { type: 'image/jpeg' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Disposition': `inline; filename="preview-${templateId}-${version || 'latest'}.jpg"`,
        },
      }
    );
  }),

  // Bulk Operations endpoints
  http.post('/api/v1/templates/bulk/delete', async ({ request }) => {
    const { template_ids } = await request.json() as { template_ids: string[] };
    
    // Simulate bulk processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const response: BulkOperationResponse = {
      success_count: template_ids.length - 1,
      failed_count: 1,
      errors: [
        {
          template_id: template_ids[0] || '',
          template_name: 'Шаблон с ошибкой',
          error: 'Template is in use by documents',
        },
      ],
    };
    
    return HttpResponse.json(response);
  }),

  http.post('/api/v1/templates/bulk/export', async ({ request }) => {
    const { template_ids } = await request.json() as { template_ids: string[] };
    
    // Simulate ZIP creation
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Return ZIP file (in real implementation)
    const zipContent = JSON.stringify({
      manifest: {
        export_date: new Date().toISOString(),
        templates_count: template_ids.length,
        exported_by: 'user-123',
        templates: template_ids.map((id, index) => ({
          id,
          filename: `template-${id}.json`,
          name: `Шаблон ${index + 1}`,
          document_type: 'warranty',
        })),
      },
    });
    
    return new HttpResponse(
      new Blob([zipContent], { type: 'application/zip' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="templates-export-${Date.now()}.zip"`,
        },
      }
    );
  }),

  http.post('/api/v1/templates/bulk/duplicate', async ({ request }) => {
    const { template_ids } = await request.json() as { template_ids: string[] };
    
    // Simulate bulk duplication
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const response: BulkOperationResponse = {
      success_count: template_ids.length,
      failed_count: 0,
      errors: [],
    };
    
    return HttpResponse.json(response);
  }),

  // Import endpoints
  http.post('/api/v1/templates/import/validate', async ({ request }) => {
    const data = await request.json() as TemplateImportData;
    
    // Simulate validation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response: ImportValidationResult = {
      valid: true,
      errors: [],
      warnings: [
        {
          path: 'elements[0].style.font',
          message: 'Font "Arial" may not be available on all systems',
        },
      ],
      conflicts: data.name === 'Existing Template' ? [{
        existing_template_id: 'template-existing',
        existing_template_name: 'Existing Template',
      }] : [],
    };
    
    return HttpResponse.json(response);
  }),

  http.post('/api/v1/templates/import', async ({ request }) => {
    const url = new URL(request.url);
    const conflictStrategy = url.searchParams.get('conflict_strategy') || 'rename';
    const data = await request.json() as TemplateImportData;
    
    // Simulate import processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const importedTemplate = {
      id: `template-imported-${Date.now()}`,
      name: conflictStrategy === 'rename' ? `${data.name} (импорт)` : data.name,
      description: data.description,
      document_type: data.document_type,
      page_size: data.page_size,
      orientation: data.orientation,
      version: 1,
      created_at: new Date().toISOString(),
      created_by: 'user-123',
      thumbnail_url: `https://storage.example.com/thumbnails/imported-${Date.now()}.jpg`,
    };
    
    return HttpResponse.json(importedTemplate);
  }),

  // Asset management endpoints
  http.post('/api/v1/templates/:templateId/assets', async ({ request, params }) => {
    const { templateId } = params;
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    
    // Simulate upload and optimization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const asset = generateAsset(templateId as string, type as 'logo' | 'image');
    
    return HttpResponse.json(asset);
  }),

  http.get('/api/v1/templates/:templateId/assets', ({ params }) => {
    const { templateId } = params;
    
    const assets = [
      generateAsset(templateId as string, 'logo'),
      generateAsset(templateId as string, 'image'),
    ];
    
    return HttpResponse.json(assets);
  }),

  http.delete('/api/v1/templates/:templateId/assets/:assetId', () => {
    // Simulate deletion
    return HttpResponse.json({ message: 'Asset deleted successfully' });
  }),
];

// Helper function to generate mock template elements for import/export
export const generateMockTemplateElements = () => [
  {
    id: 'element-1',
    type: 'text' as const,
    position: { x: 100, y: 50 },
    size: { width: 400, height: 30 },
    rotation: 0,
    zIndex: 1,
    locked: false,
    visible: true,
    style: {
      font: 'Arial',
      size: 24,
      color: '#000000',
      bold: true,
      align: 'center' as const,
    },
    data: { content: 'ГАРАНТИЙНЫЙ ТАЛОН' },
  },
  {
    id: 'element-2',
    type: 'text' as const,
    position: { x: 50, y: 150 },
    size: { width: 200, height: 20 },
    rotation: 0,
    zIndex: 2,
    locked: false,
    visible: true,
    style: {
      font: 'Arial',
      size: 14,
      color: '#333333',
    },
    data: { content: 'Продукт: __PRODUCT_NAME__' },
  },
  {
    id: 'element-3',
    type: 'image' as const,
    position: { x: 300, y: 120 },
    size: { width: 150, height: 100 },
    rotation: 0,
    zIndex: 3,
    locked: false,
    visible: true,
    style: {
      borderColor: '#cccccc',
      borderWidth: 1,
    },
    data: { 
      asset_url: 'https://storage.example.com/assets/product-image.webp',
      alt: 'Product Image' 
    },
  },
];