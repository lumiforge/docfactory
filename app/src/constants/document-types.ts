import { DocumentType } from '@/types/template.types';

export const DOCUMENT_TYPES = {
  [DocumentType.WARRANTY]: {
    value: DocumentType.WARRANTY,
    label: 'Гарантийный талон',
    icon: 'Shield',
    color: 'blue',
    description: 'Официальный документ гарантии на товар',
  },
  [DocumentType.INSTRUCTION]: {
    value: DocumentType.INSTRUCTION,
    label: 'Инструкция по эксплуатации',
    icon: 'Book',
    color: 'green',
    description: 'Руководство по использованию товара',
  },
  [DocumentType.CERTIFICATE]: {
    value: DocumentType.CERTIFICATE,
    label: 'Сертификат',
    icon: 'Award',
    color: 'purple',
    description: 'Сертификат соответствия или качества',
  },
  [DocumentType.LABEL]: {
    value: DocumentType.LABEL,
    label: 'Этикетка',
    icon: 'Tag',
    color: 'orange',
    description: 'Информационная этикетка для товара',
  },
} as const;

export const SORT_OPTIONS = [
  {
    value: 'updated_at',
    label: 'Дата изменения',
    defaultOrder: 'desc',
  },
  {
    value: 'created_at',
    label: 'Дата создания',
    defaultOrder: 'desc',
  },
  {
    value: 'name',
    label: 'Название (А-Я)',
    defaultOrder: 'asc',
  },
  {
    value: 'document_type',
    label: 'Тип документа',
    defaultOrder: 'asc',
  },
  {
    value: 'documents_count',
    label: 'Популярность',
    defaultOrder: 'desc',
  },
] as const;

export const PAGINATION_CONFIG = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
  maxPageSize: 100,
} as const;