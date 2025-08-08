import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'
import { handleError as baseHandleError } from '@/shared/utils'

export const useErrorHandler = () => {
  const navigate = useNavigate()

  const handleError = useCallback(
    (
      error: { status?: number; message?: string },
      context?: string
    ) => {
      baseHandleError(error, context, navigate)
    },
    [navigate]
  )

  return { handleError }
}