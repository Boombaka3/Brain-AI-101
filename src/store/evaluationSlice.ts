import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { EvaluationState, EvaluationSyncStatus } from '../types/evaluation'

const initialState: EvaluationState = {
  submissionStatus: 'idle',
  lastAttemptId: null,
}

const evaluationSlice = createSlice({
  name: 'evaluation',
  initialState,
  reducers: {
    setSubmissionStatus(state, action: PayloadAction<EvaluationSyncStatus>) {
      state.submissionStatus = action.payload
    },
    setLastAttemptId(state, action: PayloadAction<string | null>) {
      state.lastAttemptId = action.payload
    },
    resetEvaluationState(state) {
      state.submissionStatus = 'idle'
      state.lastAttemptId = null
    },
  },
})

export const { setSubmissionStatus, setLastAttemptId, resetEvaluationState } = evaluationSlice.actions
export const evaluationReducer = evaluationSlice.reducer
