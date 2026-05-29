import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AppState, AppView } from '../../types/app'

const initialState: AppState = {
  currentView: 'landing',
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setCurrentView(state, action: PayloadAction<AppView>) {
      state.currentView = action.payload
    },
  },
})

export const { setCurrentView } = appSlice.actions
export const appReducer = appSlice.reducer
