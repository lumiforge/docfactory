export enum DocumentType {
  WARRANTY = 'warranty',
  INSTRUCTION = 'instruction',
  CERTIFICATE = 'certificate',
  LABEL = 'label',
}

export enum PageSize {
  A4 = 'A4',
  A5 = 'A5',
  LETTER = 'Letter',
}

export enum Orientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape',
}

export interface Template {
  id: string; // UUID
  tenant_id: string; // для multi-tenancy
  name: string; // обязательное, 3-100 символов
  description: string | null; // опциональное, max 500 символов
  document_type: DocumentType; // обязательное
  
  // Настройки страницы
  page_size: PageSize; // обязательное
  orientation: Orientation; // обязательное
  
  // JSON-схема шаблона
  json_schema_url: string; // ссылка на Object Storage
  thumbnail_url: string | null; // preview изображение
  
  // Метаданные
  version: number; // текущая версия
  created_by: string; // user_id создателя
  updated_by: string | null; // user_id последнего редактора
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  deleted_at: string | null; // для soft delete
  
  // Статистика
  documents_count: number; // количество сгенерированных документов
  last_used_at: string | null; // когда последний раз использовался
}

export interface CreateTemplateDto {
  name: string;
  description?: string;
  document_type: DocumentType;
  page_size: PageSize;
  orientation: Orientation;
  // json_schema загружается отдельно в редакторе
}

export interface UpdateTemplateDto {
  name?: string;
  description?: string;
  document_type?: DocumentType;
  page_size?: PageSize;
  orientation?: Orientation;
}

export interface TemplateListParams {
  page: number;
  limit: number;
  sort?: 'name' | 'created_at' | 'updated_at' | 'document_type';
  order?: 'asc' | 'desc';
  search?: string;
  document_type?: DocumentType[];
  include_deleted?: boolean; // для просмотра удаленных
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}