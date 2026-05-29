import type { RootState } from '..'
import type { ModuleSectionProgress } from '../../types/progress'

const EMPTY_PROGRESS: ModuleSectionProgress = {
  activeIndex: 0,
  visitedIndices: [0],
}

export const selectProgressState = (state: RootState) => state.progress
export const selectCompletedViews = (state: RootState) => selectProgressState(state).completedViews
export const selectModuleSectionProgress = (
  moduleKey: 'module1' | 'module2' | 'module3',
) => (state: RootState) => selectProgressState(state).moduleSectionProgress[moduleKey] || EMPTY_PROGRESS
