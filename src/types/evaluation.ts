export type EvaluationSyncStatus = 'idle' | 'syncing' | 'synced' | 'failed'

export type CourseEvaluationStep = 'feedback' | 'reflection' | 'knowledge' | 'results'

export interface CourseEvaluationAttempt {
  attemptId: string | null
  startedAt: string | null
  completedAt: string | null
  likertResponses: Record<string, number>
  openResponses: Record<string, string>
  quizAnswers: Record<string, string>
  score: number | null
  maxScore: number | null
  moduleBreakdown: Record<string, unknown>
  passed: boolean
  remoteSubmissionStatus: EvaluationSyncStatus
  remoteSubmissionError: string
  remoteSubmissionFiles: string[]
}

export interface EvaluationState {
  attempt: CourseEvaluationAttempt | null
  currentStep: CourseEvaluationStep
  submissionStatus: EvaluationSyncStatus
  lastAttemptId: string | null
  hydrated: boolean
}
