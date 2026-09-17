import { useEffect, useState } from 'react'
import { ApiError } from '../services/api'

interface FetchState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

export function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false
    setState({ data: null, isLoading: true, error: null })

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, isLoading: false, error: null })
      })
      .catch((err) => {
        if (cancelled) return
        const message =
          err instanceof ApiError
            ? err.message
            : 'Failed to load data from the server.'
        setState({ data: null, isLoading: false, error: message })
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
