import type { EvaluationSource } from '../../src/types/submission'
import type { EvaluationSubmissionPayload, QuizAttemptSubmission } from '../../src/types/submission'
import { postCourseLikertIds, preCourseLikertIds, questionMap } from './courseData'

function isIsoDate(value: unknown) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function normalizeSessionId(value: unknown) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error('sessionId is required.')
  }

  return value.trim().slice(0, 120)
}

function normalizeOptionalDate(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  if (!isIsoDate(value)) {
    throw new Error('Dates must be valid ISO strings.')
  }

  return new Date(value).toISOString()
}

function normalizeLikertResponses(
  source: EvaluationSource,
  responses: Record<string, number> | undefined,
  skipped: boolean,
) {
  const normalized: Record<string, number> = {}
  const allowedIds = source === 'pre-course' ? preCourseLikertIds : postCourseLikertIds

  for (const [key, rawValue] of Object.entries(responses || {})) {
    if (!allowedIds.has(key)) {
      throw new Error(`Unknown likert response id: ${key}`)
    }

    const value = Number(rawValue)
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      throw new Error(`Likert response "${key}" must be an integer from 1 to 5.`)
    }

    normalized[key] = value
  }

  if (!skipped) {
    for (const id of allowedIds) {
      if (!Number.isInteger(normalized[id])) {
        throw new Error('All rating questions must be answered.')
      }
    }
  }

  return normalized
}

function normalizeOpenResponses(openResponses: Record<string, string> | undefined) {
  const normalized: Record<string, string> = {}

  for (const [key, rawValue] of Object.entries(openResponses || {})) {
    const value = typeof rawValue === 'string' ? rawValue.trim() : ''
    if (value.length > 4000) {
      throw new Error(`Open response "${key}" is too long.`)
    }
    normalized[key] = value
  }

  return normalized
}

export function validateQuizAttemptPayload(payload: unknown): QuizAttemptSubmission {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Payload must be a JSON object.')
  }

  const input = payload as QuizAttemptSubmission
  const selectedAnswers = input.selectedAnswers || {}

  if (typeof selectedAnswers !== 'object' || Array.isArray(selectedAnswers) || Object.keys(selectedAnswers).length === 0) {
    throw new Error('selectedAnswers is required.')
  }

  const normalizedAnswers: Record<string, string> = {}

  for (const [questionId, optionId] of Object.entries(selectedAnswers)) {
    if (!questionMap.has(questionId)) {
      throw new Error(`Unknown question id: ${questionId}`)
    }

    const normalizedOptionId = typeof optionId === 'string' ? optionId.trim().toUpperCase() : ''
    if (!['A', 'B', 'C', 'D'].includes(normalizedOptionId)) {
      throw new Error(`Answer for "${questionId}" must be A, B, C, or D.`)
    }

    normalizedAnswers[questionId] = normalizedOptionId
  }

  return {
    sessionId: normalizeSessionId(input.sessionId),
    startedAt: normalizeOptionalDate(input.startedAt),
    completedAt: normalizeOptionalDate(input.completedAt),
    source: typeof input.source === 'string' && input.source.trim() ? input.source.trim() : 'course-evaluation',
    selectedAnswers: normalizedAnswers,
  }
}

export function validateEvaluationPayload(payload: unknown): EvaluationSubmissionPayload {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Payload must be a JSON object.')
  }

  const input = payload as EvaluationSubmissionPayload
  const source = input.source

  if (source !== 'pre-course' && source !== 'course-evaluation') {
    throw new Error('source must be "pre-course" or "course-evaluation".')
  }

  const skipped = Boolean(input.skipped)
  const normalizedOpenResponses = normalizeOpenResponses(input.openResponses)

  return {
    sessionId: normalizeSessionId(input.sessionId),
    source,
    startedAt: normalizeOptionalDate(input.startedAt),
    completedAt: normalizeOptionalDate(input.completedAt),
    skipped,
    likertResponses: normalizeLikertResponses(source, input.likertResponses, skipped),
    openResponses: normalizedOpenResponses,
    quizAttemptId: typeof input.quizAttemptId === 'string' && input.quizAttemptId.trim()
      ? input.quizAttemptId.trim()
      : null,
  }
}
