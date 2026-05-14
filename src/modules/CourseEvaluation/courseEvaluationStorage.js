const STORAGE_KEY = 'brainAi101.courseEvaluation.v1'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function generateAttemptId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `attempt-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
}

function normalizeAttempt(raw = {}) {
  return {
    attemptId: raw.attemptId || generateAttemptId(),
    startedAt: raw.startedAt || new Date().toISOString(),
    completedAt: raw.completedAt || null,
    likertResponses: raw.likertResponses || {},
    openResponses: raw.openResponses || {},
    quizAnswers: raw.quizAnswers || {},
    score: Number.isFinite(raw.score) ? raw.score : null,
    maxScore: Number.isFinite(raw.maxScore) ? raw.maxScore : null,
    moduleBreakdown: raw.moduleBreakdown || {},
    passed: typeof raw.passed === 'boolean' ? raw.passed : false,
  }
}

export function createEvaluationAttempt(seed = {}) {
  return normalizeAttempt({
    ...seed,
    attemptId: generateAttemptId(),
    startedAt: new Date().toISOString(),
    completedAt: null,
    score: null,
    maxScore: null,
    moduleBreakdown: {},
    passed: false,
  })
}

export function saveEvaluationAttempt(attempt) {
  const normalized = normalizeAttempt(attempt)
  if (!canUseStorage()) return normalized

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
  return normalized
}

export function loadEvaluationAttempt() {
  if (!canUseStorage()) return null

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return normalizeAttempt(JSON.parse(raw))
  } catch (error) {
    console.error('Failed to load course evaluation attempt', error)
    return null
  }
}

export function clearEvaluationAttempt() {
  if (!canUseStorage()) return
  window.localStorage.removeItem(STORAGE_KEY)
}

export function submitEvaluationAttempt(attempt) {
  const normalized = normalizeAttempt({
    ...attempt,
    completedAt: new Date().toISOString(),
  })

  return saveEvaluationAttempt(normalized)
}
