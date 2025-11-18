import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  History,
  RotateCcw,
  Eye,
  MoreVertical,
  Plus,
  Minus,
  Edit,
  User,
  Clock,
  X,
  CheckCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { templatesSprint5API } from '@/lib/api/templates-sprint5.api';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import type { TemplateVersion } from '@/types/template-sprint5.types';
import { VersionComparison } from './version-comparison';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface VersionHistoryPanelProps {
  templateId: string;
  templateName: string;
}

export function VersionHistoryPanel({ templateId, templateName }: VersionHistoryPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<number[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [comparisonVersions, setComparisonVersions] = useState<[number, number] | null>(null);

  const queryClient = useQueryClient();

  // Fetch versions
  const { data: versionsData, isLoading } = useQuery({
    queryKey: ['template-versions', templateId],
    queryFn: () => templatesSprint5API.getVersions(templateId),
    enabled: isOpen,
  });

  // Restore version mutation
  const restoreMutation = useMutation({
    mutationFn: (versionNumber: number) => 
      templatesSprint5API.restoreVersion(templateId, versionNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-versions', templateId] });
      queryClient.invalidateQueries({ queryKey: ['templates', templateId] });
      toast.success('Версия восстановлена', 'Создана новая версия с содержимым выбранной');
    },
    onError: (error) => {
      toast.error('Ошибка восстановления', error.message);
    },
  });

  const versions = versionsData?.data || [];
  const totalVersions = versionsData?.total_versions || 0;

  const handleVersionSelect = (versionNumber: number, selected: boolean) => {
    if (selected) {
      const newSelection = [...selectedVersions, versionNumber];
      setSelectedVersions(newSelection);
      
      // Enable compare mode if exactly 2 versions selected
      if (newSelection.length === 2) {
        setCompareMode(true);
        setComparisonVersions(newSelection as [number, number]);
      } else {
        setCompareMode(false);
        setComparisonVersions(null);
      }
    } else {
      const newSelection = selectedVersions.filter(v => v !== versionNumber);
      setSelectedVersions(newSelection);
      setCompareMode(false);
      setComparisonVersions(null);
    }
  };

  const handleRestore = (versionNumber: number) => {
    if (confirm(`Восстановить версию ${versionNumber}? Это создаст новую версию с содержимым версии ${versionNumber}.`)) {
      restoreMutation.mutate(versionNumber);
    }
  };

  const handleCompare = () => {
    if (comparisonVersions && comparisonVersions.length === 2) {
      // Open comparison dialog
      setCompareMode(true);
    }
  };

  const clearSelection = () => {
    setSelectedVersions([]);
    setCompareMode(false);
    setComparisonVersions(null);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="mr-2 h-4 w-4" />
          История версий
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-[600px]">
        <SheetHeader>
          <SheetTitle>История изменений</SheetTitle>
          <SheetDescription>
            {templateName} • Всего версий: {totalVersions}
          </SheetDescription>
        </SheetHeader>
        
        {/* Compare mode alert */}
        {compareMode && comparisonVersions && (
          <Alert className="my-4">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Режим сравнения</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>
                Выбраны версии {comparisonVersions[0]} и {comparisonVersions[1]}
              </span>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCompare}>
                  Сравнить
                </Button>
                <Button size="sm" variant="outline" onClick={clearSelection}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Selection info */}
        {selectedVersions.length > 0 && !compareMode && (
          <Alert className="my-4">
            <AlertDescription>
              Выбрано версий: {selectedVersions.length}
              {selectedVersions.length === 1 && (
                <span className="ml-2 text-sm text-gray-600">
                  Выберите еще одну версию для сравнения
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Versions list */}
        <ScrollArea className="h-[calc(100vh-250px)] mt-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="p-4">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20" />
                    <div className="h-3 bg-gray-200 rounded w-32" />
                    <div className="h-3 bg-gray-200 rounded w-48" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version, index) => (
                <VersionItem
                  key={version.id}
                  version={version}
                  isLatest={index === 0}
                  isSelected={selectedVersions.includes(version.version_number)}
                  onSelect={(selected) => 
                    handleVersionSelect(version.version_number, selected)
                  }
                  onRestore={() => handleRestore(version.version_number)}
                  onView={() => {
                    // TODO: Implement version preview
                    toast.info('Предпросмотр версии', `Версия ${version.version_number}`);
                  }}
                />
              ))}
            </div>
          )}
        </ScrollArea>
        
        {/* Version Comparison Dialog */}
        {compareMode && comparisonVersions && (
          <VersionComparison
            templateId={templateId}
            fromVersion={comparisonVersions[0]}
            toVersion={comparisonVersions[1]}
            open={compareMode}
            onOpenChange={setCompareMode}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

interface VersionItemProps {
  version: TemplateVersion;
  isLatest: boolean;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onRestore: () => void;
  onView: () => void;
}

function VersionItem({
  version,
  isLatest,
  isSelected,
  onSelect,
  onRestore,
  onView,
}: VersionItemProps) {
  return (
    <Card className={cn(
      "relative transition-all hover:shadow-md",
      version.is_current && "border-blue-500 bg-blue-50",
      isSelected && "ring-2 ring-blue-500"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Selection checkbox */}
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="mt-1"
            disabled={version.is_current}
          />
          
          <div className="flex-1 min-w-0">
            {/* Version number + badges */}
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">
                v{version.version_number}
              </Badge>
              {version.is_current && (
                <Badge variant="default">Текущая</Badge>
              )}
              {isLatest && !version.is_current && (
                <Badge variant="secondary">Последняя</Badge>
              )}
            </div>
            
            {/* Change summary */}
            <p className="text-sm font-medium mb-2 truncate">
              {version.change_summary || 'Без описания изменений'}
            </p>
            
            {/* Metadata */}
            <div className="flex items-center gap-4 mb-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {version.created_by}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(version.created_at), {
                  addSuffix: true,
                  locale: ru,
                })}
              </span>
            </div>
            
            {/* Diff stats */}
            {version.diff_stats && (
              <div className="flex gap-3 text-xs">
                <span className="text-green-600 flex items-center gap-1">
                  <Plus className="h-3 w-3" />
                  {version.diff_stats.elements_added}
                </span>
                <span className="text-red-600 flex items-center gap-1">
                  <Minus className="h-3 w-3" />
                  {version.diff_stats.elements_removed}
                </span>
                <span className="text-blue-600 flex items-center gap-1">
                  <Edit className="h-3 w-3" />
                  {version.diff_stats.elements_modified}
                </span>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <Eye className="mr-2 h-4 w-4" />
                Предпросмотр
              </DropdownMenuItem>
              
              {!version.is_current && (
                <DropdownMenuItem onClick={onRestore}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Восстановить
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}