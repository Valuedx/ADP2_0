import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from 'sonner'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function handleError(
  error: { status?: number; message?: string },
  context?: string,
  navigate?: (path: string) => void
) {
  if (error.status === 403 && error.message?.includes('document limit')) {
    toast.error('Document limit reached. Please contact support for upgrade.')
    return
  }

  if (error.status === 403 && error.message?.includes('power user required')) {
    toast.error('This feature requires Power User access.')
    return
  }

  if (error.status === 401) {
    toast.error('Session expired. Please log in again.')
    if (navigate) {
      navigate('/')
    } else if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
    return
  }

  const prefix = context ? `${context}: ` : ''
  toast.error(prefix + (error.message || 'An unexpected error occurred'))
}
