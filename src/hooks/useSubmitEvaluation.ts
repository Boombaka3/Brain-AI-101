import { useState } from 'react'
import { postEvaluationSubmission } from '../lib/api/submissions'
import type { EvaluationSubmissionPayload, EvaluationSubmissionResponse } from '../types/submission'

export function useSubmitEvaluation() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [data, setData] = useState<EvaluationSubmissionResponse | null>(null)

  const submit = async (payload: EvaluationSubmissionPayload) => {
    setStatus('submitting')
    setError('')

    try {
      const result = await postEvaluationSubmission(payload)
      setData(result)
      setStatus('success')
      return result
    } catch (submissionError) {
      const message = submissionError instanceof Error ? submissionError.message : 'Unable to submit evaluation.'
      setError(message)
      setStatus('error')
      throw submissionError
    }
  }

  return {
    submit,
    status,
    error,
    data,
    isSubmitting: status === 'submitting',
  }
}
