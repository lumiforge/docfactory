import { useQuery } from '@tanstack/react-query';
import {
  Plus,
  Minus,
  Edit,
  ArrowRight,
  Eye,
  Download,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { templatesSprint5API } from '@/lib/api/templates-sprint5.api';
import { cn } from '@/lib/utils';
import type { VersionDiff, VersionChange } from '@/types/template-sprint5.types';
import { Badge } from '@/components/ui/badge';

interface VersionComparisonProps {
  templateId: string;
  fromVersion: number;
  toVersion: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VersionComparison({
  templateId,
  fromVersion,
  toVersion,
  open,
  onOpenChange,
}: VersionComparisonProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'changes' | 'preview'>('summary');

  // Fetch version diff
  const { data: diff, isLoading } = useQuery({
    queryKey: ['template-versions', templateId, 'diff', fromVersion, toVersion],
    queryFn: () => templatesSprint5API.compareVersions(templateId, fromVersion, toVersion),
    enabled: open,
  });

  const handleExportDiff = () => {
    // TODO: Implement diff export
    console.log('Export diff:', diff);
  };

  const handlePreviewVersion = (version: number) => {
    // TODO: Open version preview
    console.log('Preview version:', version);
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!diff) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Сравнение версий
            <Badge variant="outline">
              v{fromVersion} → v{toVersion}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Детальное сравнение изменений между версиями шаблона
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { id: 'summary', label: 'Обзор' },
            { id: 'changes', label: 'Изменения' },
            { id: 'preview', label: 'Предпросмотр' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'summary' && (
            <SummaryTab diff={diff} onExport={handleExportDiff} />
          )}
          
          {activeTab === 'changes' && (
            <ChangesTab 
              changes={diff.changes} 
              onPreviewVersion={handlePreviewVersion}
            />
          )}
          
          {activeTab === 'preview' && (
            <PreviewTab 
              templateId={templateId}
              fromVersion={fromVersion}
              toVersion={toVersion}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center p-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportDiff}>
              <Download className="h-4 w-4 mr-2" />
              Экспорт изменений
            </Button>
          </div>
          
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface SummaryTabProps {
  diff: VersionDiff;
  onExport: () => void;
}

function SummaryTab({ diff, onExport }: SummaryTabProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-6">
        <StatCard
          label="Добавлено"
          value={diff.summary.elements_added}
          color="green"
          icon={<Plus className="h-6 w-6" />}
        />
        
        <StatCard
          label="Удалено"
          value={diff.summary.elements_removed}
          color="red"
          icon={<Minus className="h-6 w-6" />}
        />
        
        <StatCard
          label="Изменено"
          value={diff.summary.elements_modified}
          color="blue"
          icon={<Edit className="h-6 w-6" />}
        />
      </div>

      {/* Changed properties */}
      {diff.summary.properties_changed.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Измененные свойства</h3>
            <div className="space-y-2">
              {diff.summary.properties_changed.map((property, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge variant="outline">{property}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface ChangesTabProps {
  changes: VersionChange[];
  onPreviewVersion: (version: number) => void;
}

function ChangesTab({ changes, onPreviewVersion }: ChangesTabProps) {
  return (
    <ScrollArea className="h-[500px] p-6">
      <div className="space-y-3">
        {changes.map((change, index) => (
          <ChangeItem key={index} change={change} />
        ))}
      </div>
    </ScrollArea>
  );
}

interface PreviewTabProps {
  templateId: string;
  fromVersion: number;
  toVersion: number;
}

function PreviewTab({ templateId, fromVersion, toVersion }: PreviewTabProps) {
  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-6 h-[500px]">
        {/* From version */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Версия {fromVersion}</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPreviewVersion(fromVersion)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Предпросмотр
            </Button>
          </div>
          <Card className="flex-1">
            <CardContent className="p-4 h-full flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-2" />
                <p>Предпросмотр версии {fromVersion}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center">
          <ArrowRight className="h-6 w-6 text-gray-400" />
        </div>

        {/* To version */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Версия {toVersion}</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPreviewVersion(toVersion)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Предпросмотр
            </Button>
          </div>
          <Card className="flex-1">
            <CardContent className="p-4 h-full flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-2" />
                <p>Предпросмотр версии {toVersion}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  color: 'green' | 'red' | 'blue';
  icon: React.ReactNode;
}

function StatCard({ label, value, color, icon }: StatCardProps) {
  const colorClasses = {
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <Card className={cn('border-2', colorClasses[color])}>
      <CardContent className="p-6 text-center">
        <div className="flex justify-center mb-3">
          {icon}
        </div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        <div className="text-sm font-medium">{label}</div>
      </CardContent>
    </Card>
  );
}

function ChangeItem({ change }: { change: VersionChange }) {
  const icons = {
    added: <Plus className="h-4 w-4 text-green-600" />,
    removed: <Minus className="h-4 w-4 text-red-600" />,
    modified: <Edit className="h-4 w-4 text-blue-600" />,
  };

  const typeLabels = {
    added: 'Добавлено',
    removed: 'Удалено',
    modified: 'Изменено',
  };

  return (
    <Card className="border-l-4 border-l-gray-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            {icons[change.type]}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={change.type === 'modified' ? 'default' : 'secondary'}>
                {typeLabels[change.type]}
              </Badge>
              <span className="text-sm text-gray-500 font-mono">
                {change.path}
              </span>
            </div>
            
            <p className="text-sm font-medium mb-2">
              {change.description}
            </p>
            
            {change.type === 'modified' && change.old_value !== undefined && change.new_value !== undefined && (
              <div className="space-y-1">
                <div className="text-xs">
                  <span className="text-red-600">- {JSON.stringify(change.old_value)}</span>
                </div>
                <div className="text-xs">
                  <span className="text-green-600">+ {JSON.stringify(change.new_value)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}