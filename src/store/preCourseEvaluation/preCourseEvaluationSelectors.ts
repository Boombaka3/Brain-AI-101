import type { RootState } from '..'

export const selectPreCourseEvaluationState = (state: RootState) => state.preCourseEvaluation
export const selectPreCourseCompletedAt = (state: RootState) => selectPreCourseEvaluationState(state).completedAt
export const selectPreCourseHydrated = (state: RootState) => selectPreCourseEvaluationState(state).hydrated
