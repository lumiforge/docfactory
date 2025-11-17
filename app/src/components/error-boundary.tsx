'use client';

import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log to error reporting service (Sentry, etc.)
    console.error('Error caught by boundary:', error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 p-4">
      <div className="max-w-md text-center space-y-4">
        <Alert variant="destructive">
          <AlertTitle className="text-lg">Что-то пошло не так</AlertTitle>
          <AlertDescription className="text-base">
            Произошла непредвиденная ошибка. Попробуйте перезагрузить страницу или вернуться на главную.
          </AlertDescription>
        </Alert>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 text-left">
            <details className="rounded-lg bg-gray-100 p-4 text-sm">
              <summary className="cursor-pointer font-medium">Детали ошибки</summary>
              <pre className="mt-2 overflow-auto text-xs bg-red-50 p-2 text-red-800">
                {error.message}
                {error.stack && (
                  <>
                    {'\n\n'}
                    {error.stack}
                  </>
                )}
              </pre>
            </details>
          </div>
        )}
        
        <div className="flex gap-3 justify-center pt-4">
          <Button onClick={reset}>
            Попробовать снова
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
          >
            На главную
          </Button>
        </div>
      </div>
    </div>
  );
}