export interface QuizAttemptAnswerPayload {
  questionId: string
  selectedOptionId: string
}

export interface QuizAttemptSubmission {
  sessionId: string
  startedAt?: string | null
  completedAt?: string | null
  selectedAnswers: Record<string, string>
  source?: string
}

export interface QuizAttemptRecord {
  id: string
  sessionId: string
  source: string
  startedAt: string | null
  completedAt: string | null
  submittedAt: string
  score: number
  maxScore: number
  passed: boolean
  selectedAnswers: Record<string, string>
  moduleBreakdown: Record<string, { module: string; label: string; correct: number; total: number }>
}

export interface QuizAttemptSubmissionResponse {
  ok: true
  attempt: QuizAttemptRecord
}

export type EvaluationSource = 'pre-course' | 'course-evaluation'

export interface EvaluationSubmissionPayload {
  sessionId: string
  source: EvaluationSource
  startedAt?: string | null
  completedAt?: string | null
  skipped?: boolean
  likertResponses: Record<string, number>
  openResponses?: Record<string, string>
  quizAttemptId?: string | null
}

export interface EvaluationSubmissionRecord {
  id: string
  sessionId: string
  source: EvaluationSource
  startedAt: string | null
  completedAt: string | null
  submittedAt: string
  skipped: boolean
  likertResponses: Record<string, number>
  openResponses: Record<string, string>
  quizAttemptId: string | null
}

export interface EvaluationSubmissionResponse {
  ok: true
  submission: EvaluationSubmissionRecord
}
