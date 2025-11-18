import { z } from 'zod';
import { DocumentType, PageSize, Orientation } from '@/types/template.types';

export const templateSchema = z.object({
  name: z
    .string()
    .min(3, 'Название должно содержать минимум 3 символа')
    .max(100, 'Максимальная длина названия 100 символов')
    .regex(
      /^[a-zA-Zа-яА-ЯёЁ0-9\s\-_.()]+$/,
      'Название может содержать только буквы, цифры, пробелы и символы: - _ . ( )'
    ),
  
  description: z
    .string()
    .max(500, 'Максимальная длина описания 500 символов')
    .optional()
    .or(z.literal('')),
  
  document_type: z.nativeEnum(DocumentType, {
    errorMap: () => ({ message: 'Выберите тип документа' }),
  }),
  
  page_size: z.nativeEnum(PageSize),
  orientation: z.nativeEnum(Orientation),
});

export type TemplateFormData = z.infer<typeof templateSchema>;

export const templateFiltersSchema = z.object({
  search: z.string().optional(),
  document_type: z.array(z.nativeEnum(DocumentType)).optional(),
  sort: z.enum(['name', 'created_at', 'updated_at', 'document_type', 'documents_count']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

export type TemplateFiltersData = z.infer<typeof templateFiltersSchema>;