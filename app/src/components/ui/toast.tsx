"use client"

import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react"
import { toast as sonnerToast, Toaster } from "sonner"

interface ToastOptions {
  description?: string
  duration?: number
}

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, {
      description: options?.description,
      duration: options?.duration || 3000,
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
    })
  },
  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      icon: <XCircle className="h-4 w-4 text-red-500" />,
    })
  },
  warning: (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: <AlertCircle className="h-4 w-4 text-yellow-500" />,
    })
  },
  info: (message: string, options?: ToastOptions) => {
    return sonnerToast.info(message, {
      description: options?.description,
      duration: options?.duration || 3000,
      icon: <Info className="h-4 w-4 text-blue-500" />,
    })
  },
  loading: (message: string, options?: ToastOptions) => {
    return sonnerToast.loading(message, {
      description: options?.description,
    })
  },
  dismiss: (id?: string | number) => {
    sonnerToast.dismiss(id)
  },
}

export { Toaster }

// Re-export for convenience
export default toast