import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { PreCourseEvaluationAttempt, PreCourseEvaluationState } from '../../types/preCourseEvaluation'

const initialState: PreCourseEvaluationState = {
  attemptId: null,
  startedAt: null,
  completedAt: null,
  skipped: false,
  likertResponses: {},
  openResponse: '',
  source: 'pre-course',
  version: 1,
  status: 'idle',
  hydrated: false,
}

function hasDraftContent(attempt: PreCourseEvaluationAttempt) {
  return (
    Boolean(attempt.attemptId) ||
    Boolean(attempt.startedAt) ||
    Object.keys(attempt.likertResponses || {}).length > 0 ||
    Boolean(attempt.openResponse)
  )
}

function deriveStatus(attempt: PreCourseEvaluationAttempt): PreCourseEvaluationState['status'] {
  if (attempt.skipped && attempt.completedAt) {
    return 'skipped'
  }

  if (attempt.completedAt) {
    return 'completed'
  }

  if (hasDraftContent(attempt)) {
    return 'draft'
  }

  return 'idle'
}

function applyAttempt(state: PreCourseEvaluationState, attempt: PreCourseEvaluationAttempt | null, hydrated = true) {
  if (!attempt) {
    Object.assign(state, { ...initialState, hydrated })
    return
  }

  Object.assign(state, {
    ...attempt,
    status: deriveStatus(attempt),
    hydrated,
  })
}

const preCourseEvaluationSlice = createSlice({
  name: 'preCourseEvaluation',
  initialState,
  reducers: {
    hydratePreCourseEvaluation(state, action: PayloadAction<PreCourseEvaluationAttempt | null>) {
      applyAttempt(state, action.payload, true)
    },
    startPreCourseEvaluation(state, action: PayloadAction<PreCourseEvaluationAttempt>) {
      Object.assign(state, {
        ...action.payload,
        status: 'draft',
        hydrated: true,
      })
    },
    updatePreCourseEvaluation(state, action: PayloadAction<PreCourseEvaluationAttempt>) {
      Object.assign(state, {
        ...action.payload,
        status: 'draft',
        hydrated: true,
      })
    },
    completePreCourseEvaluation(state, action: PayloadAction<PreCourseEvaluationAttempt>) {
      Object.assign(state, {
        ...action.payload,
        status: 'completed',
        hydrated: true,
      })
    },
    skipPreCourseEvaluation(state, action: PayloadAction<PreCourseEvaluationAttempt>) {
      Object.assign(state, {
        ...action.payload,
        status: 'skipped',
        hydrated: true,
      })
    },
    resetPreCourseEvaluation(state) {
      Object.assign(state, { ...initialState, hydrated: true })
    },
  },
})

export const {
  hydratePreCourseEvaluation,
  startPreCourseEvaluation,
  updatePreCourseEvaluation,
  completePreCourseEvaluation,
  skipPreCourseEvaluation,
  resetPreCourseEvaluation,
} = preCourseEvaluationSlice.actions

export const preCourseEvaluationReducer = preCourseEvaluationSlice.reducer
