import { useState } from 'react'
import { postQuizAttempt } from '../lib/api/submissions'
import type { QuizAttemptSubmission, QuizAttemptSubmissionResponse } from '../types/submission'

export function useSubmitQuizAttempt() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [data, setData] = useState<QuizAttemptSubmissionResponse | null>(null)

  const submit = async (payload: QuizAttemptSubmission) => {
    setStatus('submitting')
    setError('')

    try {
      const result = await postQuizAttempt(payload)
      setData(result)
      setStatus('success')
      return result
    } catch (submissionError) {
      const message = submissionError instanceof Error ? submissionError.message : 'Unable to submit quiz attempt.'
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
