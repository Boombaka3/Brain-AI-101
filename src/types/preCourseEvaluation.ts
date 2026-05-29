export type PreCourseEvaluationStatus = 'idle' | 'draft' | 'completed' | 'skipped'

export interface PreCourseEvaluationAttempt {
  attemptId: string | null
  startedAt: string | null
  completedAt: string | null
  skipped: boolean
  likertResponses: Record<string, number>
  openResponse: string
  source: 'pre-course'
  version: 1
}

export interface PreCourseEvaluationState extends PreCourseEvaluationAttempt {
  status: PreCourseEvaluationStatus
  hydrated: boolean
}
