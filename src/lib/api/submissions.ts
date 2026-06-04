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
