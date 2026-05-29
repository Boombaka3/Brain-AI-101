import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CourseEvaluationAttempt, CourseEvaluationStep, EvaluationState, EvaluationSyncStatus } from '../../types/evaluation'

const initialState: EvaluationState = {
  attempt: null,
  currentStep: 'feedback',
  submissionStatus: 'idle',
  lastAttemptId: null,
  hydrated: false,
}

interface HydrateEvaluationPayload {
  attempt: CourseEvaluationAttempt | null
  currentStep: CourseEvaluationStep
}

function syncAttemptMetadata(state: EvaluationState, attempt: CourseEvaluationAttempt | null) {
  state.attempt = attempt
  state.lastAttemptId = attempt?.attemptId || null
  state.submissionStatus = attempt?.remoteSubmissionStatus || 'idle'
}

const evaluationSlice = createSlice({
  name: 'evaluation',
  initialState,
  reducers: {
    hydrateEvaluationState(state, action: PayloadAction<HydrateEvaluationPayload>) {
      syncAttemptMetadata(state, action.payload.attempt)
      state.currentStep = action.payload.currentStep
      state.hydrated = true
    },
    updateEvaluationAttempt(state, action: PayloadAction<CourseEvaluationAttempt>) {
      syncAttemptMetadata(state, action.payload)
      state.hydrated = true
    },
    setEvaluationStep(state, action: PayloadAction<CourseEvaluationStep>) {
      state.currentStep = action.payload
    },
    setSubmissionStatus(state, action: PayloadAction<EvaluationSyncStatus>) {
      state.submissionStatus = action.payload
      if (state.attempt) {
        state.attempt.remoteSubmissionStatus = action.payload
      }
    },
    setLastAttemptId(state, action: PayloadAction<string | null>) {
      state.lastAttemptId = action.payload
    },
    resetEvaluationState(state) {
      state.attempt = null
      state.currentStep = 'feedback'
      state.submissionStatus = 'idle'
      state.lastAttemptId = null
      state.hydrated = true
    },
  },
})

export const {
  hydrateEvaluationState,
  updateEvaluationAttempt,
  setEvaluationStep,
  setSubmissionStatus,
  setLastAttemptId,
  resetEvaluationState,
} = evaluationSlice.actions
export const evaluationReducer = evaluationSlice.reducer
