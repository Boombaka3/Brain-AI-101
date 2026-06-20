import type { EvaluationSubmissionRecord, QuizAttemptRecord } from './submission'

export interface AdminSubmissionsSummary {
  quizAttemptCount: number
  evaluationCount: number
  averageQuizScore: number
  passCount: number
  preCourseCount: number
  postCourseCount: number
}

export interface AdminSubmissionsResponse {
  ok: true
  summary: AdminSubmissionsSummary
  quizAttempts: QuizAttemptRecord[]
  evaluations: EvaluationSubmissionRecord[]
}

export type AdminExportType = 'quiz' | 'evaluations' | 'quiz-detailed' | 'evaluations-detailed'
