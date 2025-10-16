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
  // Check for document limit error - handle both simple and detailed messages
  if (error.status === 403 && error.message && 
      (error.message.includes('document limit') || error.message.includes('Document limit reached'))) {
    toast.error('Document limit reached')
    return
  }

  if (error.status === 403 && error.message?.includes('power user required')) {
    toast.error('This feature requires Power User access.')
    return
  }

  if (error.status === 401) {
    toast.error('Incorrect Credential. Please try again.')
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