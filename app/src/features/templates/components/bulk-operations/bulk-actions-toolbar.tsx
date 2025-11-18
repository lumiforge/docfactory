import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Download,
  Copy,
  Trash2,
  X,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { templatesSprint5API, downloadFile } from '@/lib/api/templates-sprint5.api';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import type { BulkAction, BulkOperationResponse } from '@/types/template-sprint5.types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

interface BulkActionsToolbarProps {
  selectedIds: string[];
  selectedCount: number;
  onClearSelection: () => void;
  onSelectionChange?: (ids: string[]) => void;
}

export function BulkActionsToolbar({
  selectedIds,
  selectedCount,
  onClearSelection,
  onSelectionChange,
}: BulkActionsToolbarProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeOperation, setActiveOperation] = useState<BulkAction | null>(null);
  const [operationProgress, setOperationProgress] = useState<{
    total: number;
    completed: number;
    failed: number;
  } | null>(null);

  const queryClient = useQueryClient();

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: () => templatesSprint5API.bulkDelete(selectedIds),
    onMutate: () => {
      setActiveOperation('delete');
      setOperationProgress({ total: selectedCount, completed: 0, failed: 0 });
    },
    onSuccess: (result: BulkOperationResponse) => {
      setOperationProgress(prev => prev ? {
        ...prev,
        completed: result.success_count,
        failed: result.failed_count,
      } : null);
      
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      
      if (result.failed_count === 0) {
        toast.success('Удалено', `Удалено шаблонов: ${result.success_count}`);
        onClearSelection();
      } else {
        toast.error(
          'Частичное удаление',
          `Удалено: ${result.success_count}, ошибок: ${result.failed_count}`
        );
      }
    },
    onError: (error) => {
      toast.error('Ошибка удаления', error.message);
      setOperationProgress(null);
      setActiveOperation(null);
    },
    onSettled: () => {
      setTimeout(() => {
        setOperationProgress(null);
        setActiveOperation(null);
      }, 2000);
    },
  });

  // Bulk export mutation
  const bulkExportMutation = useMutation({
    mutationFn: () => templatesSprint5API.bulkExport(selectedIds),
    onMutate: () => {
      setActiveOperation('export');
      setOperationProgress({ total: selectedCount, completed: 0, failed: 0 });
    },
    onSuccess: (blob) => {
      const filename = `templates-export-${new Date().toISOString().split('T')[0]}.zip`;
      downloadFile(blob, filename);
      
      toast.success('Экспорт завершен', `Шаблоны экспортированы в ${filename}`);
      
      setOperationProgress(prev => prev ? {
        ...prev,
        completed: selectedCount,
      } : null);
    },
    onError: (error) => {
      toast.error('Ошибка экспорта', error.message);
      setOperationProgress(null);
      setActiveOperation(null);
    },
    onSettled: () => {
      setTimeout(() => {
        setOperationProgress(null);
        setActiveOperation(null);
      }, 2000);
    },
  });

  // Bulk duplicate mutation
  const bulkDuplicateMutation = useMutation({
    mutationFn: () => templatesSprint5API.bulkDuplicate(selectedIds),
    onMutate: () => {
      setActiveOperation('duplicate');
      setOperationProgress({ total: selectedCount, completed: 0, failed: 0 });
    },
    onSuccess: (result: BulkOperationResponse) => {
      setOperationProgress(prev => prev ? {
        ...prev,
        completed: result.success_count,
        failed: result.failed_count,
      } : null);
      
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      
      if (result.failed_count === 0) {
        toast.success('Дублирование завершено', `Создано копий: ${result.success_count}`);
        onClearSelection();
      } else {
        toast.error(
          'Частичное дублирование',
          `Создано: ${result.success_count}, ошибок: ${result.failed_count}`
        );
      }
    },
    onError: (error) => {
      toast.error('Ошибка дублирования', error.message);
      setOperationProgress(null);
      setActiveOperation(null);
    },
    onSettled: () => {
      setTimeout(() => {
        setOperationProgress(null);
        setActiveOperation(null);
      }, 2000);
    },
  });

  const handleBulkDelete = () => {
    bulkDeleteMutation.mutate();
    setIsDeleteDialogOpen(false);
  };

  const handleBulkExport = () => {
    bulkExportMutation.mutate();
  };

  const handleBulkDuplicate = () => {
    bulkDuplicateMutation.mutate();
  };

  const isOperationInProgress = activeOperation !== null;
  const getOperationIcon = (operation: BulkAction) => {
    switch (operation) {
      case 'delete': return <Trash2 className="h-4 w-4" />;
      case 'export': return <Download className="h-4 w-4" />;
      case 'duplicate': return <Copy className="h-4 w-4" />;
      default: return <Loader2 className="h-4 w-4" />;
    }
  };

  const getOperationText = (operation: BulkAction) => {
    switch (operation) {
      case 'delete': return 'Удаление';
      case 'export': return 'Экспорт';
      case 'duplicate': return 'Дублирование';
      default: return 'Обработка';
    }
  };

  if (selectedCount === 0) return null;

  return (
    <>
      {/* Main toolbar */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border shadow-lg rounded-lg p-4 flex items-center gap-4 z-50 min-w-[400px]">
        {/* Selection info */}
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">
            Выбрано: {selectedCount}
          </Badge>
          
          {operationProgress && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {getOperationIcon(activeOperation!)}
              <span>{getOperationText(activeOperation!)}...</span>
            </div>
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkExport}
            disabled={isOperationInProgress}
            loading={activeOperation === 'export'}
          >
            <Download className="h-4 w-4 mr-2" />
            Экспорт
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkDuplicate}
            disabled={isOperationInProgress}
            loading={activeOperation === 'duplicate'}
          >
            <Copy className="h-4 w-4 mr-2" />
            Дублировать
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isOperationInProgress}
            loading={activeOperation === 'delete'}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Удалить
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            disabled={isOperationInProgress}
          >
            <X className="h-4 w-4 mr-2" />
            Отменить
          </Button>
        </div>
      </div>

      {/* Progress indicator */}
      {operationProgress && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-white border shadow-lg rounded-lg p-4 z-50 min-w-[300px]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {getOperationText(activeOperation!)}
              </span>
              <Badge 
                variant={operationProgress.failed > 0 ? "destructive" : "default"}
                className="text-xs"
              >
                {operationProgress.completed}/{operationProgress.total}
              </Badge>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  operationProgress.failed > 0 
                    ? "bg-red-500" 
                    : "bg-blue-500"
                )}
                style={{
                  width: `${(operationProgress.completed / operationProgress.total) * 100}%`,
                }}
              />
            </div>
            
            {/* Status */}
            <div className="flex items-center gap-2 text-sm">
              {operationProgress.failed > 0 ? (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-600">
                    {operationProgress.failed} ошибок
                  </span>
                </>
              ) : operationProgress.completed === operationProgress.total ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">Завершено</span>
                </>
              ) : (
                <>
                  <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                  <span className="text-blue-600">В процессе...</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить {selectedCount} шаблон(ов)?
              Это действие нельзя будет отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}