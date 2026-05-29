import { configureStore } from '@reduxjs/toolkit'
import { appReducer } from './app'
import { evaluationReducer } from './courseEvaluation'
import { preCourseEvaluationReducer } from './preCourseEvaluation'
import { progressReducer } from './progress'

export const store = configureStore({
  reducer: {
    app: appReducer,
    progress: progressReducer,
    evaluation: evaluationReducer,
    preCourseEvaluation: preCourseEvaluationReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
