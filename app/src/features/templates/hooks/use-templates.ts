import { useQuery, keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { templatesAPI } from '@/lib/api/templates.api';
import type { TemplateListParams, PaginatedResponse, Template } from '@/types/template.types';

// Хук для получения списка шаблонов с пагинацией и фильтрацией
export function useTemplates(params: TemplateListParams) {
  return useQuery({
    queryKey: ['templates', params],
    queryFn: () => templatesAPI.list(params),
    placeholderData: keepPreviousData, // Плавные переходы между страницами
    staleTime: 5 * 60 * 1000, // 5 минут - данные считаются свежими
  });
}

// Хук для получения одного шаблона по ID
export function useTemplate(id: string) {
  return useQuery({
    queryKey: ['templates', id],
    queryFn: () => templatesAPI.getById(id),
    enabled: !!id, // Запускать только если ID предоставлен
    staleTime: 10 * 60 * 1000, // 10 минут - один шаблон дольше актуален
  });
}

// Хук для получения удаленных шаблонов
export function useDeletedTemplates(params: Omit<TemplateListParams, 'include_deleted'>) {
  return useQuery({
    queryKey: ['templates', 'deleted', params],
    queryFn: () => templatesAPI.list({ ...params, include_deleted: true }),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}

// Хук для получения версий шаблона
export function useTemplateVersions(id: string) {
  return useQuery({
    queryKey: ['templates', id, 'versions'],
    queryFn: () => templatesAPI.getVersions(id),
    enabled: !!id,
    staleTime: 15 * 60 * 1000, // 15 минут - версии меняются редко
  });
}

// Хук для предварительной загрузки следующей страницы
export function useTemplatesPrefetch() {
  const queryClient = useQueryClient();
  
  // Предзагрузка следующей страницы
  const prefetchNextPage = async (currentPage: number, params: TemplateListParams) => {
    await queryClient.prefetchQuery({
      queryKey: ['templates', { ...params, page: currentPage + 1 }],
      queryFn: () => templatesAPI.list({ ...params, page: currentPage + 1 }),
    });
  };
  
  // Предзагрузка деталей шаблона при наведении
  const prefetchTemplate = async (id: string) => {
    await queryClient.prefetchQuery({
      queryKey: ['templates', id],
      queryFn: () => templatesAPI.getById(id),
    });
  };
  
  return { prefetchNextPage, prefetchTemplate };
}
