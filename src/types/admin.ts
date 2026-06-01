import type { EvaluationSubmissionRecord, QuizAttemptRecord } from './submission'

export interface AdminDashboardSummary {
  quizAttemptCount: number
  evaluationCount: number
  averageQuizScore: number
  passCount: number
  preCourseCount: number
  postCourseCount: number
}

export interface AdminSubmissionResponse {
  ok: true
  summary: AdminDashboardSummary
  quizAttempts: QuizAttemptRecord[]
  evaluations: EvaluationSubmissionRecord[]
}
