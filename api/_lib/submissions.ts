import type { EvaluationSource } from '@prisma/client'
import { questionMap } from './courseData'

const MODULE_LABELS: Record<string, string> = {
  module1: 'Module 1',
  module2: 'Module 2',
  module3: 'Module 3',
}

export function scoreQuizAnswers(selectedAnswers: Record<string, string>) {
  const moduleBreakdown: Record<string, { module: string; label: string; correct: number; total: number }> = {}
  let score = 0

  for (const [questionId, selectedOptionId] of Object.entries(selectedAnswers)) {
    const question = questionMap.get(questionId)
    if (!question) {
      continue
    }

    const isCorrect = question.correctOptionId === selectedOptionId
    if (isCorrect) {
      score += 1
    }

    const bucket = moduleBreakdown[question.moduleId] || {
      module: question.moduleId,
      label: MODULE_LABELS[question.moduleId] || question.moduleId,
      correct: 0,
      total: 0,
    }

    bucket.total += 1
    if (isCorrect) {
      bucket.correct += 1
    }
    moduleBreakdown[question.moduleId] = bucket
  }

  return {
    score,
    maxScore: questionMap.size,
    passed: score >= 7,
    moduleBreakdown,
  }
}

export function mapEvaluationSource(source: 'pre-course' | 'course-evaluation'): EvaluationSource {
  return source === 'pre-course' ? 'pre_course' : 'post_course'
}

export function serializeEvaluationSource(source: EvaluationSource): 'pre-course' | 'course-evaluation' {
  return source === 'pre_course' ? 'pre-course' : 'course-evaluation'
}

export function buildAdminSummary(
  quizAttempts: Array<{ score: number; passed: boolean }>,
  evaluations: Array<{ source: EvaluationSource }>,
) {
  const quizAttemptCount = quizAttempts.length
  const evaluationCount = evaluations.length
  const totalScore = quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0)
  const passCount = quizAttempts.filter((attempt) => attempt.passed).length
  const preCourseCount = evaluations.filter((item) => item.source === 'pre_course').length
  const postCourseCount = evaluations.filter((item) => item.source === 'post_course').length

  return {
    quizAttemptCount,
    evaluationCount,
    averageQuizScore: quizAttemptCount > 0 ? Number((totalScore / quizAttemptCount).toFixed(2)) : 0,
    passCount,
    preCourseCount,
    postCourseCount,
  }
}
