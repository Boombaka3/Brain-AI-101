import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ModuleProgressState } from '../types/progress'

const initialState: ModuleProgressState = {
  completedViews: [],
}

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    markViewComplete(state, action: PayloadAction<string>) {
      if (!state.completedViews.includes(action.payload)) {
        state.completedViews.push(action.payload)
      }
    },
    resetProgress(state) {
      state.completedViews = []
    },
  },
})

export const { markViewComplete, resetProgress } = progressSlice.actions
export const progressReducer = progressSlice.reducer
