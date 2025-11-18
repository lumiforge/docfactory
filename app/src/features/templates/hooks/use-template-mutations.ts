import { useMutation, useQueryClient } from '@tanstack/react-query';
import { templatesAPI } from '@/lib/api/templates.api';
import { toast } from '@/lib/toast';
import type { 
  CreateTemplateDto, 
  UpdateTemplateDto, 
  Template, 
  PaginatedResponse 
} from '@/types/template.types';

// Мутация для создания шаблона
export function useCreateTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTemplateDto) => templatesAPI.create(data),
    onSuccess: (newTemplate) => {
      // Инвалидируем список шаблонов для обновления
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      
      // Добавляем новый шаблон в кэш
      queryClient.setQueryData(['templates', newTemplate.id], newTemplate);
      
      toast.success('Шаблон создан', 'Теперь вы можете настроить его дизайн');
    },
    onError: (error) => {
      toast.error('Ошибка создания шаблона', error.message);
    },
  });
}

// Мутация для обновления шаблона с оптимистическим обновлением
export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateDto }) =>
      templatesAPI.update(id, data),
    
    // Оптимистическое обновление
    onMutate: async ({ id, data }) => {
      // Отменяем исходящие запросы
      await queryClient.cancelQueries({ queryKey: ['templates', id] });
      
      // Сохраняем предыдущее значение
      const previousTemplate = queryClient.getQueryData<Template>(['templates', id]);
      
      // Оптимистически обновляем кэш
      if (previousTemplate) {
        queryClient.setQueryData<Template>(['templates', id], {
          ...previousTemplate,
          ...data,
          updated_at: new Date().toISOString(),
        });
      }
      
      return { previousTemplate };
    },
    
    // Откат при ошибке
    onError: (error, variables, context) => {
      if (context?.previousTemplate) {
        queryClient.setQueryData(
          ['templates', variables.id],
          context.previousTemplate
        );
      }
      toast.error('Ошибка обновления шаблона', error.message);
    },
    
    // Всегда обновляем после ошибки или успеха
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['templates', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
    
    onSuccess: () => {
      toast.success('Шаблон обновлен', 'Изменения сохранены');
    },
  });
}

// Мутация для удаления шаблона с оптимистическим обновлением
export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => templatesAPI.delete(id),
    
    // Оптимистическое обновление
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['templates'] });
      
      const previousTemplates = queryClient.getQueryData<PaginatedResponse<Template>>(['templates']);
      
      // Оптимистически удаляем из списка
      if (previousTemplates) {
        queryClient.setQueryData<PaginatedResponse<Template>>(['templates'], {
          ...previousTemplates,
          data: previousTemplates.data.filter(t => t.id !== id),
        });
      }
      
      return { previousTemplates };
    },
    
    // Откат при ошибке
    onError: (error, id, context) => {
      if (context?.previousTemplates) {
        queryClient.setQueryData(['templates'], context.previousTemplates);
      }
      toast.error('Ошибка удаления', error.message);
    },
    
    onSuccess: () => {
      toast.success('Шаблон удален', 'Вы можете восстановить его в течение 30 дней');
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

// Мутация для восстановления удаленного шаблона
export function useRestoreTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => templatesAPI.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['templates', 'deleted'] });
      toast.success('Шаблон восстановлен', 'Шаблон снова доступен для работы');
    },
    onError: (error) => {
      toast.error('Ошибка восстановления', error.message);
    },
  });
}

// Мутация для дублирования шаблона
export function useDuplicateTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => templatesAPI.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Шаблон дублирован', 'Копия создана успешно');
    },
    onError: (error) => {
      toast.error('Ошибка дублирования', error.message);
    },
  });
}

// Мутация для частичного обновления (patch)
export function usePatchTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UpdateTemplateDto> }) =>
      templatesAPI.patch(id, data),
    
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['templates', id] });
      
      const previousTemplate = queryClient.getQueryData<Template>(['templates', id]);
      
      if (previousTemplate) {
        queryClient.setQueryData<Template>(['templates', id], {
          ...previousTemplate,
          ...data,
          updated_at: new Date().toISOString(),
        });
      }
      
      return { previousTemplate };
    },
    
    onError: (error, variables, context) => {
      if (context?.previousTemplate) {
        queryClient.setQueryData(
          ['templates', variables.id],
          context.previousTemplate
        );
      }
      toast.error('Ошибка обновления', error.message);
    },
    
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['templates', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}