import { configureStore } from '@reduxjs/toolkit'
import { appReducer } from './appSlice'
import { evaluationReducer } from './evaluationSlice'
import { progressReducer } from './progressSlice'

export const store = configureStore({
  reducer: {
    app: appReducer,
    progress: progressReducer,
    evaluation: evaluationReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
