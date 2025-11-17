import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, { 
      description,
      duration: 3000,
      position: 'top-right',
    });
  },
  error: (message: string, description?: string) => {
    sonnerToast.error(message, { 
      description,
      duration: 5000,
      position: 'top-right',
    });
  },
  info: (message: string, description?: string) => {
    sonnerToast.info(message, { 
      description,
      duration: 4000,
      position: 'top-right',
    });
  },
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, { 
      description,
      duration: 4000,
      position: 'top-right',
    });
  },
  loading: (message: string) => {
    return sonnerToast.loading(message, {
      position: 'top-right',
    });
  },
  dismiss: (id: string | number) => {
    sonnerToast.dismiss(id);
  },
  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
      position: 'top-right',
    });
  },
};