import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ModuleProgressState } from '../../types/progress'
import type { AppView } from '../../types/app'

const initialState: ModuleProgressState = {
  completedViews: [],
  moduleSectionProgress: {
    module1: { activeIndex: 0, visitedIndices: [0] },
    module2: { activeIndex: 0, visitedIndices: [0] },
    module3: { activeIndex: 0, visitedIndices: [0] },
  },
}

interface SetModuleSectionProgressPayload {
  moduleKey: 'module1' | 'module2' | 'module3'
  activeIndex: number
  visitedIndices: number[]
}

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    markViewComplete(state, action: PayloadAction<AppView>) {
      if (!state.completedViews.includes(action.payload)) {
        state.completedViews.push(action.payload)
      }
    },
    setModuleSectionProgress(state, action: PayloadAction<SetModuleSectionProgressPayload>) {
      const { moduleKey, activeIndex, visitedIndices } = action.payload
      state.moduleSectionProgress[moduleKey] = {
        activeIndex,
        visitedIndices: Array.from(new Set(visitedIndices)).sort((a, b) => a - b),
      }
    },
    resetProgress(state) {
      state.completedViews = []
      state.moduleSectionProgress = initialState.moduleSectionProgress
    },
  },
})

export const { markViewComplete, setModuleSectionProgress, resetProgress } = progressSlice.actions
export const progressReducer = progressSlice.reducer
