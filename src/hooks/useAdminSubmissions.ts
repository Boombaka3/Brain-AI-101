import { useState } from 'react'
import { getAdminSubmissions } from '../lib/api/submissions'
import type { AdminSubmissionResponse } from '../types/admin'

export function useAdminSubmissions() {
  const [data, setData] = useState<AdminSubmissionResponse | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  const load = async (token: string) => {
    setStatus('loading')
    setError('')

    try {
      const result = await getAdminSubmissions(token)
      setData(result)
      setStatus('success')
      return result
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Unable to load submissions.'
      setError(message)
      setStatus('error')
      throw loadError
    }
  }

  return {
    data,
    status,
    error,
    load,
    isLoading: status === 'loading',
  }
}
