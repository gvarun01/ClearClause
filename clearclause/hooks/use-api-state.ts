"use client"

import { useState, useCallback } from "react"

interface ApiState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

export function useApiState<T>(initialData: T | null = null) {
  const [state, setState] = useState<ApiState<T>>({
    data: initialData,
    isLoading: false,
    error: null,
  })

  const execute = useCallback(async <R,>(apiCall: () => Promise<R>, onSuccess?: (data: R) => void) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const result = await apiCall()
      setState({ data: result as unknown as T, isLoading: false, error: null })
      if (onSuccess) onSuccess(result)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }))
      throw error
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: initialData, isLoading: false, error: null })
  }, [initialData])

  return {
    ...state,
    execute,
    reset,
  }
}
