import type { AdminSubmissionResponse } from '../../types/admin'
import type {
  EvaluationSubmissionPayload,
  EvaluationSubmissionResponse,
  QuizAttemptSubmission,
  QuizAttemptSubmissionResponse,
} from '../../types/submission'
import { requestJson } from './client'

export function postQuizAttempt(payload: QuizAttemptSubmission) {
  return requestJson<QuizAttemptSubmissionResponse>('/api/quiz-attempts', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function postEvaluationSubmission(payload: EvaluationSubmissionPayload) {
  return requestJson<EvaluationSubmissionResponse>('/api/evaluations', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getAdminSubmissions(token: string) {
  return requestJson<AdminSubmissionResponse>('/api/admin/submissions', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export function getExportUrl(kind: 'quiz' | 'evaluations') {
  return kind === 'quiz' ? '/api/admin/export-quiz.csv' : '/api/admin/export-evaluations.csv'
}
