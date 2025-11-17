'use client';

import { X } from 'lucide-react';
import React, { useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface GlobalError {
  title: string;
  message: string;
  id?: string;
}

interface GlobalErrorBannerProps {
  error: GlobalError | null;
  clearError: () => void;
}

export function GlobalErrorBanner({ error, clearError }: GlobalErrorBannerProps) {
  useEffect(() => {
    if (error) {
      // Auto-dismiss after 10 seconds
      const timer = setTimeout(() => {
        clearError();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (!error) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-error text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold">!</span>
          </div>
          <div>
            <p className="font-medium">{error.title}</p>
            <p className="text-sm opacity-90">{error.message}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={clearError}
          className="text-white hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

// Hook for managing global errors
export function useGlobalError() {
  const [error, setError] = React.useState<GlobalError | null>(null);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const showError = React.useCallback((title: string, message: string) => {
    setError({ title, message, id: Date.now().toString() });
  }, []);

  return {
    error,
    clearError,
    showError,
  };
}