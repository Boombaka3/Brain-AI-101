import type { RootState } from '..'

export const selectCourseEvaluationState = (state: RootState) => state.evaluation
export const selectEvaluationAttempt = (state: RootState) => selectCourseEvaluationState(state).attempt
export const selectEvaluationCurrentStep = (state: RootState) => selectCourseEvaluationState(state).currentStep
export const selectEvaluationHydrated = (state: RootState) => selectCourseEvaluationState(state).hydrated
export const selectEvaluationSubmissionStatus = (state: RootState) => selectCourseEvaluationState(state).submissionStatus
