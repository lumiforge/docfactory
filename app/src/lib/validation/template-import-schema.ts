import { z } from 'zod';
import type { TemplateImportData } from '@/types/template-sprint5.types';
import { DocumentType, PageSize, Orientation } from '@/types/template.types';

// Element type schema
const elementSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['text', 'image', 'qr_code', 'dynamic_field', 'shape', 'table']),
  position: z.object({
    x: z.number().min(0),
    y: z.number().min(0),
  }),
  size: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
  }),
  rotation: z.number().min(-360).max(360).default(0),
  zIndex: z.number().int().min(0).default(0),
  locked: z.boolean().default(false),
  visible: z.boolean().default(true),
  style: z.object({
    // Text properties
    font: z.string().optional(),
    size: z.number().positive().optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    bold: z.boolean().optional(),
    italic: z.boolean().optional(),
    underline: z.boolean().optional(),
    align: z.enum(['left', 'center', 'right']).optional(),
    
    // Border properties
    borderColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    borderWidth: z.number().min(0).optional(),
    borderStyle: z.enum(['solid', 'dashed', 'dotted']).optional(),
    
    // Background
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    opacity: z.number().min(0).max(1).optional(),
    
    // Shadow
    shadowColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    shadowBlur: z.number().min(0).optional(),
    shadowOffsetX: z.number().optional(),
    shadowOffsetY: z.number().optional(),
  }),
  data: z.any(), // Type-specific data
});

// Asset schema
const assetSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['image', 'logo', 'watermark']),
  filename: z.string().min(1).max(255),
  mime_type: z.string().regex(/^image\/(png|jpeg|jpg|webp|svg\+xml)$/),
  data: z.string().regex(/^[A-Za-z0-9+/=]+$/), // base64
  size: z.number().positive(),
  url: z.string().url().optional(),
});

// Main template import schema
export const templateImportSchema = z.object({
  version: z.literal('1.0'),
  export_date: z.string().datetime().optional(),
  
  // Required template metadata
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  document_type: z.nativeEnum(DocumentType),
  page_size: z.nativeEnum(PageSize),
  orientation: z.nativeEnum(Orientation),
  
  // Template content
  elements: z.array(elementSchema).min(0).max(100), // Limit to 100 elements
  
  // Optional assets
  assets: z.array(assetSchema).max(20).optional(), // Limit to 20 assets
  
  // Template settings
  settings: z.object({
    grid_enabled: z.boolean().default(true),
    snap_to_grid: z.boolean().default(true),
    grid_size: z.number().positive().default(10),
    show_rulers: z.boolean().default(true),
    show_guides: z.boolean().default(true),
  }).optional(),
  
  // Metadata
  metadata: z.object({
    created_by: z.string().optional(),
    created_at: z.string().datetime().optional(),
    updated_by: z.string().optional(),
    updated_at: z.string().datetime().optional(),
    tags: z.array(z.string()).max(10).optional(),
    category: z.string().optional(),
  }).optional(),
});

// Validation function with detailed error reporting
export function validateImportJSON(data: unknown): {
  success: boolean;
  data?: TemplateImportData;
  errors?: Array<{
    path: string[];
    message: string;
    code: string;
  }>;
  warnings?: Array<{
    path: string[];
    message: string;
  }>;
} {
  try {
    const validated = templateImportSchema.parse(data);
    
    // Additional validation logic
    const warnings: Array<{ path: string[]; message: string }> = [];
    
    // Check for duplicate element IDs
    if (validated.elements) {
      const elementIds = validated.elements.map(e => e.id);
      const duplicateIds = elementIds.filter((id, index) => elementIds.indexOf(id) !== index);
      if (duplicateIds.length > 0) {
        warnings.push({
          path: ['elements'],
          message: `Найдены дубликаты ID элементов: ${duplicateIds.join(', ')}`,
        });
      }
    }
    
    // Check for duplicate asset IDs
    if (validated.assets) {
      const assetIds = validated.assets.map(a => a.id);
      const duplicateIds = assetIds.filter((id, index) => assetIds.indexOf(id) !== index);
      if (duplicateIds.length > 0) {
        warnings.push({
          path: ['assets'],
          message: `Найдены дубликаты ID ассетов: ${duplicateIds.join(', ')}`,
        });
      }
    }
    
    // Check for missing asset references
    if (validated.elements && validated.assets) {
      const assetIds = new Set(validated.assets.map(a => a.id));
      const missingAssets = validated.elements
        .filter(e => e.type === 'image' && e.data?.asset_id && !assetIds.has(e.data.asset_id))
        .map(e => e.data.asset_id);
      
      if (missingAssets.length > 0) {
        warnings.push({
          path: ['elements'],
          message: `Некоторые элементы ссылаются на несуществующие ассеты: ${missingAssets.join(', ')}`,
        });
      }
    }
    
    // Check for elements outside page bounds
    const pageBounds = {
      width: validated.page_size === 'A4' ? 210 : validated.page_size === 'A5' ? 148 : 216,
      height: validated.page_size === 'A4' ? 297 : validated.page_size === 'A5' ? 210 : 279,
    };
    
    if (validated.orientation === 'landscape') {
      [pageBounds.width, pageBounds.height] = [pageBounds.height, pageBounds.width];
    }
    
    const outOfBoundsElements = validated.elements.filter(e => 
      e.position.x < 0 || 
      e.position.y < 0 ||
      e.position.x + e.size.width > pageBounds.width ||
      e.position.y + e.size.height > pageBounds.height
    );
    
    if (outOfBoundsElements.length > 0) {
      warnings.push({
        path: ['elements'],
        message: `${outOfBoundsElements.length} элементов выходят за границы страницы`,
      });
    }
    
    return {
      success: true,
      data: validated as TemplateImportData,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(issue => ({
        path: issue.path.map(String),
        message: issue.message,
        code: issue.code,
      }));
      
      return { success: false, errors };
    }
    
    return { 
      success: false, 
      errors: [{
        path: [],
        message: 'Невалидный формат данных',
        code: 'INVALID_FORMAT',
      }]
    };
  }
}

// Validation for specific element types
export const textElementSchema = elementSchema.extend({
  type: z.literal('text'),
  data: z.object({
    content: z.string().max(1000),
    placeholder: z.string().optional(),
    is_dynamic: z.boolean().default(false),
    field_name: z.string().optional(),
  }),
});

export const imageElementSchema = elementSchema.extend({
  type: z.literal('image'),
  data: z.object({
    asset_id: z.string().uuid().optional(),
    url: z.string().url().optional(),
    alt_text: z.string().max(255).optional(),
    fit: z.enum(['contain', 'cover', 'fill', 'none']).default('contain'),
  }),
});

export const qrCodeElementSchema = elementSchema.extend({
  type: z.literal('qr_code'),
  data: z.object({
    content: z.string().max(500),
    error_correction: z.enum(['L', 'M', 'Q', 'H']).default('M'),
    size: z.number().positive().default(100),
    foreground_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#000000'),
    background_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#FFFFFF'),
  }),
});

export const dynamicFieldElementSchema = elementSchema.extend({
  type: z.literal('dynamic_field'),
  data: z.object({
    field_name: z.string().min(1).max(50),
    field_type: z.enum(['text', 'number', 'date', 'boolean', 'select']),
    label: z.string().max(100),
    required: z.boolean().default(false),
    default_value: z.any().optional(),
    options: z.array(z.string()).optional(), // For select type
    validation: z.object({
      min_length: z.number().min(0).optional(),
      max_length: z.number().positive().optional(),
      min_value: z.number().optional(),
      max_value: z.number().optional(),
      pattern: z.string().optional(),
    }).optional(),
  }),
});

export const shapeElementSchema = elementSchema.extend({
  type: z.literal('shape'),
  data: z.object({
    shape: z.enum(['rectangle', 'circle', 'triangle', 'line', 'arrow']),
    fill_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    stroke_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#000000'),
    stroke_width: z.number().min(0).default(1),
    corner_radius: z.number().min(0).optional(), // For rectangle
  }),
});

export const tableElementSchema = elementSchema.extend({
  type: z.literal('table'),
  data: z.object({
    rows: z.number().int().min(1).max(50),
    columns: z.number().int().min(1).max(20),
    headers: z.array(z.string().max(100)).optional(),
    data: z.array(z.array(z.string().max(500))).optional(),
    style: z.object({
      border_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#000000'),
      border_width: z.number().min(0).default(1),
      header_background: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      alternate_rows: z.boolean().default(false),
      alternate_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    }).optional(),
  }),
});

// Export validation schemas for specific use cases
export const elementValidationSchemas = {
  text: textElementSchema,
  image: imageElementSchema,
  qr_code: qrCodeElementSchema,
  dynamic_field: dynamicFieldElementSchema,
  shape: shapeElementSchema,
  table: tableElementSchema,
};

// Helper function to validate individual elements
export function validateElement(element: unknown, type: string): {
  success: boolean;
  errors?: Array<{ path: string[]; message: string }>;
} {
  const schema = elementValidationSchemas[type as keyof typeof elementValidationSchemas];
  
  if (!schema) {
    return {
      success: false,
      errors: [{
        path: ['type'],
        message: `Неизвестный тип элемента: ${type}`,
      }],
    };
  }
  
  try {
    schema.parse(element);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(issue => ({
        path: issue.path.map(String),
        message: issue.message,
      }));
      
      return { success: false, errors };
    }
    
    return {
      success: false,
      errors: [{
        path: [],
        message: 'Ошибка валидации элемента',
      }],
    };
  }
}

// Type guards
export function isValidTemplateImportData(data: unknown): data is TemplateImportData {
  const result = validateImportJSON(data);
  return result.success;
}

export function isValidElement(element: unknown): element is z.infer<typeof elementSchema> {
  try {
    elementSchema.parse(element);
    return true;
  } catch {
    return false;
  }
}