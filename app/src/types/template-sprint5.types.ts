import { DocumentType, PageSize, Orientation } from './template.types';

// Version History Types
export interface TemplateVersion {
  id: string; // UUID версии
  template_id: string; // FK к основному шаблону
  version_number: number; // 1, 2, 3...
  
  // Snapshot данных на момент версии
  name: string;
  description: string | null;
  document_type: DocumentType;
  page_size: PageSize;
  orientation: Orientation;
  json_schema_url: string; // snapshot JSON-схемы
  
  // Метаданные версии
  created_at: string; // ISO 8601
  created_by: string; // user_id
  change_summary: string | null; // Краткое описание изменений
  is_current: boolean; // Текущая активная версия
  
  // Diff metadata (опционально)
  diff_stats?: {
    elements_added: number;
    elements_removed: number;
    elements_modified: number;
  };
}

export interface VersionsListResponse {
  data: TemplateVersion[];
  current_version: number;
  total_versions: number;
}

export interface VersionDiff {
  from_version: number;
  to_version: number;
  summary: {
    elements_added: number;
    elements_removed: number;
    elements_modified: number;
    properties_changed: string[]; // ['name', 'page_size']
  };
  
  // Детальные изменения
  changes: VersionChange[];
}

export interface VersionChange {
  type: 'added' | 'removed' | 'modified';
  path: string; // JSON path: 'elements[0].position.x'
  old_value?: any;
  new_value?: any;
  description: string; // "Изменена позиция элемента 'Заголовок'"
}

// Enhanced Duplicate Types
export interface DuplicateOptions {
  name?: string; // Новое имя (если не указано, добавляется " (копия)")
  include_versions?: boolean; // Копировать всю историю версий (default: false)
  description?: string; // Новое описание
}

export interface DuplicateFormData {
  name: string;
  description?: string;
  include_versions: boolean;
}

// Bulk Operations Types
export type BulkAction = 'delete' | 'export' | 'duplicate' | 'change_type' | 'archive';

export interface BulkOperationRequest {
  action: BulkAction;
  template_ids: string[];
  options?: Record<string, any>;
}

export interface BulkOperationResponse {
  success_count: number;
  failed_count: number;
  errors: BulkOperationError[];
}

export interface BulkOperationError {
  template_id: string;
  template_name: string;
  error: string;
}

// Template Import/Export Types
export interface TemplateImportData {
  // Метаданные
  version: '1.0'; // Версия формата
  export_date?: string;
  
  // Данные шаблона
  name: string;
  description?: string;
  document_type: DocumentType;
  page_size: PageSize;
  orientation: Orientation;
  
  // JSON Schema элементов
  elements: TemplateElement[];
  
  // Assets (base64 encoded)
  assets?: TemplateImportAsset[];
}

export interface TemplateImportAsset {
  id: string;
  type: 'image' | 'logo';
  filename: string;
  mime_type: string;
  data: string; // base64
}

export interface ImportOptions {
  conflict_strategy?: 'skip' | 'replace' | 'rename';
}

export interface ImportValidationResult {
  valid: boolean;
  errors: Array<{ path: string; message: string }>;
  warnings: Array<{ path: string; message: string }>;
  conflicts: Array<{
    existing_template_id: string;
    existing_template_name: string;
  }>;
}

export interface ExportManifest {
  export_date: string;
  templates_count: number;
  exported_by: string;
  templates: Array<{
    id: string;
    filename: string;
    name: string;
    document_type: DocumentType;
  }>;
}

// Asset Management Types
export interface Asset {
  id: string;
  template_id: string;
  type: 'logo' | 'image' | 'watermark';
  filename: string;
  url: string;
  storage_url: string;
  size: number;
  mime_type: string;
  created_at: string;
}

// Thumbnail Generation Types
export interface ThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

export interface ThumbnailSizes {
  card: { width: number; height: number; quality: number };
  small: { width: number; height: number; quality: number };
  large: { width: number; height: number; quality: number };
}

// Template Elements (for import/export)
export interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'qr_code' | 'dynamic_field' | 'shape' | 'table';
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  style: ElementStyle;
  data: any; // type-specific data
}

export interface ElementStyle {
  // Text properties
  font?: string;
  size?: number;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'left' | 'center' | 'right';
  
  // Border properties
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  
  // Background
  backgroundColor?: string;
  opacity?: number;
  
  // Shadow
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

// Color Picker Types
export interface ColorPreset {
  name: string;
  value: string;
}

export interface RecentColor {
  value: string;
  timestamp: number;
}

// Image Upload Types
export interface ImageOptimizationOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
}

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

// UI State Types
export interface BulkSelectionState {
  selectedIds: string[];
  isAllSelected: boolean;
  isIndeterminate: boolean;
}

export interface VersionHistoryState {
  isOpen: boolean;
  selectedVersions: number[];
  compareMode: boolean;
}

export interface ImportState {
  file: File | null;
  previewData: TemplateImportData | null;
  validationErrors: Array<{ path: string; message: string }>;
  conflictStrategy: 'skip' | 'replace' | 'rename';
}

// Progress Tracking Types
export interface BulkOperationProgress {
  total: number;
  completed: number;
  failed: number;
  currentOperation: string;
}

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Error Handling Types
export interface Sprint5APIError extends Error {
  statusCode: number;
  operation: 'version' | 'duplicate' | 'import' | 'bulk' | 'asset';
  code?: string;
  details?: unknown;
}

// Component Props Types
export interface VersionHistoryPanelProps {
  templateId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface BulkActionsToolbarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onBulkAction: (action: BulkAction, options?: any) => void;
}

export interface TemplateImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: (template: any) => void;
}

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  presets?: string[];
  label?: string;
}

export interface LogoUploadProps {
  value: string | null;
  onChange: (file: File) => void;
  onRemove: () => void;
  maxSize?: number;
}