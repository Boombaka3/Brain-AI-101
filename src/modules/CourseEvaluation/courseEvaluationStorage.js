const STORAGE_KEY = 'brainAi101.courseEvaluation.v1'
const PRE_COURSE_STORAGE_KEY = 'brainAi101.preCourseEvaluation.v1'

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
    remoteSubmissionStatus: typeof raw.remoteSubmissionStatus === 'string' ? raw.remoteSubmissionStatus : 'idle',
    remoteSubmissionError: typeof raw.remoteSubmissionError === 'string' ? raw.remoteSubmissionError : '',
    remoteSubmissionFiles: Array.isArray(raw.remoteSubmissionFiles) ? raw.remoteSubmissionFiles : [],
  }
}

function normalizePreCourseAttempt(raw = {}) {
  return {
    attemptId: raw.attemptId || generateAttemptId(),
    startedAt: raw.startedAt || new Date().toISOString(),
    completedAt: raw.completedAt || null,
    skipped: typeof raw.skipped === 'boolean' ? raw.skipped : false,
    likertResponses: raw.likertResponses || {},
    openResponse: typeof raw.openResponse === 'string' ? raw.openResponse : '',
    source: 'pre-course',
    version: 1,
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
    remoteSubmissionStatus: 'idle',
    remoteSubmissionError: '',
    remoteSubmissionFiles: [],
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

export function createPreCourseEvaluationAttempt(seed = {}) {
  return normalizePreCourseAttempt({
    ...seed,
    attemptId: generateAttemptId(),
    startedAt: new Date().toISOString(),
    completedAt: null,
    skipped: false,
    source: 'pre-course',
    version: 1,
  })
}

export function savePreCourseEvaluationAttempt(attempt) {
  const normalized = normalizePreCourseAttempt(attempt)
  if (!canUseStorage()) return normalized

  window.localStorage.setItem(PRE_COURSE_STORAGE_KEY, JSON.stringify(normalized))
  return normalized
}

export function loadPreCourseEvaluationAttempt() {
  if (!canUseStorage()) return null

  try {
    const raw = window.localStorage.getItem(PRE_COURSE_STORAGE_KEY)
    if (!raw) return null
    return normalizePreCourseAttempt(JSON.parse(raw))
  } catch (error) {
    console.error('Failed to load pre-course evaluation attempt', error)
    return null
  }
}

export function clearPreCourseEvaluationAttempt() {
  if (!canUseStorage()) return
  window.localStorage.removeItem(PRE_COURSE_STORAGE_KEY)
}

export function markPreCourseEvaluationSkipped() {
  const currentAttempt = loadPreCourseEvaluationAttempt()
  const normalized = normalizePreCourseAttempt({
    ...(currentAttempt || createPreCourseEvaluationAttempt()),
    skipped: true,
    completedAt: new Date().toISOString(),
  })

  return savePreCourseEvaluationAttempt(normalized)
}
