import type { RootState } from '..'

export const selectAppState = (state: RootState) => state.app
export const selectCurrentView = (state: RootState) => selectAppState(state).currentView
